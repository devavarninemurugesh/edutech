from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Optional
from pypdf import PdfReader
import io
import sys
import contextlib
import datetime
import uuid

from app.services.roadmap_service import (
    ROLES, build_roadmap, analyze_gaps, get_role_skills_ai, 
    get_learning_tools, get_dynamic_projects
)
from app.services.assessment_service import questions_for, grade
from app.services.gemini_service import gemini
from app.services.huggingface_service import hf
from app.agents.assistant import answer

app = FastAPI(title="EduPath AI Skill Gap Agent API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Application state
state = {
    "auth": {
        "is_authenticated": False,
        "email": "",
        "user_id": "",
    },
    "profile": {
        "name": "",
        "email": "",
        "education": "",
        "experience": "",
        "target_role": "",
        "goal": "Land a career role in target domain",
        "hours_per_week": 10,
    },
    "skills": {},  # Clean initial state - populated after resume analysis
    "resume_uploaded": False,
    "resume_filename": "",
    "completed_tasks": 0,
    "completed_task_ids": [],
    "assessment_history": [],
    "settings": {
        "learning_pace": "balanced",
        "notifications": True,
        "gemini_api_key": "",
        "huggingface_token": "",
        "auto_sync_resume": True,
    }
}

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = ""

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: Optional[str] = ""
    target_role: Optional[str] = "Data Scientist"
    goal: Optional[str] = ""
    hours_per_week: Optional[int] = 10

class OnboardRequest(BaseModel):
    name: str
    email: str
    target_role: str
    goal: Optional[str] = ""
    hours_per_week: Optional[int] = 10
    resume_text: Optional[str] = ""
    education: Optional[str] = ""
    experience: Optional[str] = ""

class Profile(BaseModel):
    name: str
    education: str = ""
    experience: str = ""
    target_role: str = "Data Scientist"
    goal: str = ""
    hours_per_week: int = 10
    skills: dict[str, float] = {}

class ChatRequest(BaseModel):
    question: str

class AssessmentSubmission(BaseModel):
    skill: str
    answers: dict[str, str]

class CodeExecutionRequest(BaseModel):
    code: str
    language: str = "python"
    skill: Optional[str] = "Python"

class SettingsModel(BaseModel):
    learning_pace: str = "balanced"
    notifications: bool = True
    gemini_api_key: str = ""
    huggingface_token: str = ""
    auto_sync_resume: bool = True

class ApplySkillsRequest(BaseModel):
    skills: list[dict[str, Any]]

class TextResumeRequest(BaseModel):
    text: str
    target_role: Optional[str] = ""

class CreateTaskRequest(BaseModel):
    title: str
    type: str = "learning"
    day: str = "Mon"
    time_slot: str = "09:00 AM - 10:00 AM"
    minutes: int = 45
    description: str = ""


@app.get("/")
def root():
    return {"name": "EduPath AI Skill Gap Agent API", "status": "running", "version": "1.0.0"}

@app.get("/api/health")
def health():
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    return {
        "status": "healthy",
        "gemini_configured": gemini.is_configured(saved_key),
        "target_role": state["profile"]["target_role"],
        "resume_uploaded": state.get("resume_uploaded", False),
        "skills_count": len(state["skills"]),
        "is_authenticated": state["auth"]["is_authenticated"],
        "user_name": state["profile"]["name"]
    }

# ================= AUTH & ONBOARDING ENDPOINTS =================

@app.post("/api/auth/login")
def login(payload: LoginRequest):
    email = payload.email.strip()
    if not email:
        raise HTTPException(400, "Email address is required.")
    
    state["auth"]["is_authenticated"] = True
    state["auth"]["email"] = email
    state["auth"]["user_id"] = f"usr_{uuid.uuid4().hex[:8]}"
    if not state["profile"]["name"]:
        state["profile"]["name"] = email.split("@")[0].capitalize()
    state["profile"]["email"] = email
    
    return {
        "status": "authenticated",
        "user": {
            "name": state["profile"]["name"],
            "email": state["profile"]["email"],
            "target_role": state["profile"]["target_role"],
            "resume_uploaded": state.get("resume_uploaded", False),
            "is_authenticated": True
        }
    }

@app.post("/api/auth/register")
def register(payload: RegisterRequest):
    name = payload.name.strip()
    email = payload.email.strip()
    if not name or not email:
        raise HTTPException(400, "Name and Email are required.")
        
    state["auth"]["is_authenticated"] = True
    state["auth"]["email"] = email
    state["auth"]["user_id"] = f"usr_{uuid.uuid4().hex[:8]}"
    
    state["profile"]["name"] = name
    state["profile"]["email"] = email
    state["profile"]["target_role"] = payload.target_role or "Data Scientist"
    state["profile"]["goal"] = payload.goal or f"Master {payload.target_role} competencies"
    state["profile"]["hours_per_week"] = payload.hours_per_week or 10
    
    return {
        "status": "registered",
        "user": {
            "name": state["profile"]["name"],
            "email": state["profile"]["email"],
            "target_role": state["profile"]["target_role"],
            "resume_uploaded": state.get("resume_uploaded", False),
            "is_authenticated": True
        }
    }

@app.post("/api/auth/onboard")
def onboard_with_resume(payload: OnboardRequest):
    state["auth"]["is_authenticated"] = True
    state["auth"]["email"] = payload.email
    state["auth"]["user_id"] = f"usr_{uuid.uuid4().hex[:8]}"
    
    state["profile"]["name"] = payload.name
    state["profile"]["email"] = payload.email
    state["profile"]["target_role"] = payload.target_role
    state["profile"]["goal"] = payload.goal or f"Become a verified {payload.target_role}"
    state["profile"]["hours_per_week"] = payload.hours_per_week or 10
    state["profile"]["education"] = payload.education or ""
    state["profile"]["experience"] = payload.experience or ""
    
    # Process resume text if provided
    analysis_res = None
    if payload.resume_text and payload.resume_text.strip():
        analysis_res = analyze_text_resume(TextResumeRequest(
            text=payload.resume_text.strip(),
            target_role=payload.target_role
        ))
    else:
        # Seed baseline empty skills for target role
        saved_key = state.get("settings", {}).get("gemini_api_key", "")
        role_skills = get_role_skills_ai(payload.target_role, custom_key=saved_key)
        for sk in role_skills:
            if sk not in state["skills"]:
                state["skills"][sk] = 10.0
                
    return {
        "status": "onboarded_success",
        "user": {
            "name": state["profile"]["name"],
            "email": state["profile"]["email"],
            "target_role": state["profile"]["target_role"],
            "resume_uploaded": state.get("resume_uploaded", False),
            "is_authenticated": True
        },
        "analysis": analysis_res
    }

@app.get("/api/auth/me")
def get_current_user():
    return {
        "is_authenticated": state["auth"].get("is_authenticated", False),
        "name": state["profile"]["name"] or "Guest Learner",
        "email": state["profile"]["email"] or "",
        "target_role": state["profile"]["target_role"],
        "goal": state["profile"]["goal"],
        "hours_per_week": state["profile"]["hours_per_week"],
        "resume_uploaded": state.get("resume_uploaded", False),
        "skills_count": len(state["skills"])
    }

@app.post("/api/auth/logout")
def logout():
    state["auth"]["is_authenticated"] = False
    state["auth"]["email"] = ""
    return {"status": "logged_out"}


# ================= PROFILE & RESUME ENDPOINTS =================

@app.get("/api/roles")
def roles():
    return {"roles": list(ROLES.keys()), "role_skills": ROLES}

@app.get("/api/profile")
def get_profile():
    return {
        **state["profile"], 
        "skills": state["skills"],
        "resume_uploaded": state.get("resume_uploaded", False),
        "is_authenticated": state["auth"].get("is_authenticated", False)
    }

@app.put("/api/profile")
def update_profile(profile: Profile):
    prev_role = state["profile"]["target_role"]
    state["profile"] = profile.model_dump(exclude={"skills"})
    
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    new_role = profile.target_role
    role_skills = get_role_skills_ai(new_role, custom_key=saved_key)
    
    updated_skills = dict(profile.skills)
    for sk in role_skills:
        if sk not in updated_skills:
            updated_skills[sk] = 10.0
            
    state["skills"] = updated_skills
    return get_profile()

@app.post("/api/resume/analyze-text")
def analyze_text_resume(payload: TextResumeRequest):
    text = payload.text.strip()
    target_role = payload.target_role or state["profile"]["target_role"]
    if target_role:
        state["profile"]["target_role"] = target_role

    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    
    # Perform Gemini AI skill extraction
    system_prompt = (
        "You are an expert HR AI Skill Gap Analysis Agent.\n"
        f"Analyze the candidate's resume/experience text for the target role: '{target_role}'.\n"
        "Identify candidate's existing technical skills with scores from 15 to 85.\n"
        "Return ONLY a JSON array of objects with schema:\n"
        "[\n"
        '  {"name": "SkillName", "level": "intermediate", "score": 65.0, "confidence": 0.85, "evidence": "Extracted from projects"}\n'
        "]"
    )
    
    ai_skills = gemini.json(system_prompt, text, custom_key=saved_key)
    detected_skills = []
    
    if isinstance(ai_skills, list) and len(ai_skills) > 0:
        detected_skills = ai_skills
    elif isinstance(ai_skills, dict) and "skills" in ai_skills:
        detected_skills = ai_skills["skills"]
    else:
        # High-accuracy keyword & context extractor
        role_skills = get_role_skills_ai(target_role, custom_key=saved_key)
        for sk in role_skills:
            if sk.lower() in text.lower():
                detected_skills.append({
                    "name": sk, 
                    "level": "intermediate", 
                    "score": 65.0, 
                    "confidence": 0.88, 
                    "evidence": f"Found key technical proficiency '{sk}' mentioned in resume experience."
                })
        if not detected_skills and role_skills:
            detected_skills.append({
                "name": role_skills[0], 
                "level": "beginner", 
                "score": 35.0, 
                "confidence": 0.75, 
                "evidence": "Initial baseline technical competency."
            })

    # Clear previous mock skills and apply newly analyzed skills
    state["skills"] = {}
    for s in detected_skills:
        name = s.get("name")
        score = float(s.get("score", 50.0))
        if name:
            state["skills"][name] = score

    # Seed remaining target role skills at initial 10.0 score
    role_skills = get_role_skills_ai(target_role, custom_key=saved_key)
    for sk in role_skills:
        if sk not in state["skills"]:
            state["skills"][sk] = 10.0

    state["resume_uploaded"] = True
    state["profile"]["experience"] = text[:300]

    return {
        "status": "success",
        "target_role": target_role,
        "skills_detected_count": len(detected_skills),
        "analysis": {"skills": detected_skills},
        "all_skills": state["skills"]
    }

@app.post("/api/resume/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(413, "File too large. Maximum size is 5MB.")
    
    text = ""
    if file.filename.lower().endswith(".pdf"):
        reader = PdfReader(io.BytesIO(data))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    else:
        text = data.decode("utf-8", errors="ignore")
        
    res = analyze_text_resume(TextResumeRequest(text=text))
    res["filename"] = file.filename
    state["resume_filename"] = file.filename
    return res

@app.post("/api/resume/apply")
def apply_resume_skills(payload: ApplySkillsRequest):
    applied_count = 0
    for s in payload.skills:
        name = s.get("name")
        score = s.get("score", 60.0)
        if name:
            state["skills"][name] = max(state["skills"].get(name, 0.0), float(score))
            applied_count += 1
    state["resume_uploaded"] = True
    return {"status": "success", "applied_count": applied_count, "skills": state["skills"]}


# ================= SKILL GAP, LEARNING TOOLS & ROADMAP =================

@app.get("/api/skill-gap")
def skill_gap():
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    role = state["profile"]["target_role"]
    gaps = analyze_gaps(role, state["skills"], custom_key=saved_key)
    projects = get_dynamic_projects(role, state["skills"], custom_key=saved_key)
    return {
        "role": role, 
        "resume_uploaded": state.get("resume_uploaded", False),
        "gaps": gaps,
        "projects": projects
    }

@app.get("/api/learning-tools")
def learning_tools():
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    role = state["profile"]["target_role"]
    return get_learning_tools(role, state["skills"], custom_key=saved_key)

@app.get("/api/projects")
def projects():
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    role = state["profile"]["target_role"]
    return {
        "role": role,
        "projects": get_dynamic_projects(role, state["skills"], custom_key=saved_key)
    }

@app.get("/api/roadmap")
def roadmap():
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    return {
        "role": state["profile"]["target_role"], 
        "resume_uploaded": state.get("resume_uploaded", False),
        "nodes": build_roadmap(state["profile"]["target_role"], state["skills"], custom_key=saved_key)
    }


# ================= WEEKLY PLAN & TASKS =================

@app.get("/api/weekly-plan")
def weekly_plan(offset: int = 0):
    today = datetime.date.today() + datetime.timedelta(weeks=offset)
    start_of_week = today - datetime.timedelta(days=today.weekday())
    
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    gaps = analyze_gaps(state["profile"]["target_role"], state["skills"], custom_key=saved_key)
    focus = gaps[0]["skill"] if gaps else "Python"
    
    if "custom_tasks" not in state:
        state["custom_tasks"] = []

    default_calendar_tasks = [
        {
            "id": "t1",
            "title": f"Master {focus} Fundamentals & Core Syntax",
            "type": "learning",
            "day": "Mon",
            "day_index": 0,
            "time_slot": "09:00 AM - 09:45 AM",
            "minutes": 45,
            "status": "COMPLETED" if "t1" in state.get("completed_task_ids", []) else "PENDING",
            "description": f"Read interactive documentation and structured syntax guides for {focus}.",
            "priority": "HIGH"
        },
        {
            "id": "t2",
            "title": f"Solve 3 {focus} Practice Playground Challenges",
            "type": "practice",
            "day": "Tue",
            "day_index": 1,
            "time_slot": "10:30 AM - 11:30 AM",
            "minutes": 60,
            "status": "COMPLETED" if "t2" in state.get("completed_task_ids", []) else "PENDING",
            "description": f"Use live code playground to complete hands-on practice challenges.",
            "priority": "HIGH"
        },
        {
            "id": "t3",
            "title": f"{focus} Deep Dive, Algorithms & Optimization",
            "type": "learning",
            "day": "Wed",
            "day_index": 2,
            "time_slot": "02:00 PM - 02:45 PM",
            "minutes": 45,
            "status": "COMPLETED" if "t3" in state.get("completed_task_ids", []) else "PENDING",
            "description": f"Study optimized patterns, memory allocation & time complexity for {focus}.",
            "priority": "MEDIUM"
        },
        {
            "id": "t4",
            "title": f"Pass {focus} Skill Assessment (Target >= 80%)",
            "type": "assessment",
            "day": "Thu",
            "day_index": 3,
            "time_slot": "11:00 AM - 11:30 AM",
            "minutes": 30,
            "status": "COMPLETED" if "t4" in state.get("completed_task_ids", []) else "PENDING",
            "description": f"Take timed certification quiz to unlock next roadmap node.",
            "priority": "HIGH"
        },
        {
            "id": "t5",
            "title": f"Build a {focus} Real-World Portfolio Project",
            "type": "project",
            "day": "Fri",
            "day_index": 4,
            "time_slot": "03:00 PM - 04:30 PM",
            "minutes": 90,
            "status": "COMPLETED" if "t5" in state.get("completed_task_ids", []) else "PENDING",
            "description": f"Apply {focus} to construct a complete tested project deliverable.",
            "priority": "HIGH"
        }
    ]

    all_tasks = default_calendar_tasks + state.get("custom_tasks", [])
    
    for t in all_tasks:
        if t["id"] in state.get("completed_task_ids", []):
            t["status"] = "COMPLETED"
        else:
            t["status"] = t.get("status", "PENDING")
            
    days_data = []
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    full_day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for idx in range(7):
        day_date = start_of_week + datetime.timedelta(days=idx)
        day_code = day_names[idx]
        day_tasks = [t for t in all_tasks if t.get("day") == day_code or t.get("day_index") == idx]
        days_data.append({
            "day": day_code,
            "full_name": full_day_names[idx],
            "date": day_date.strftime("%b %d"),
            "iso_date": day_date.strftime("%Y-%m-%d"),
            "is_today": day_date == datetime.date.today(),
            "tasks": day_tasks,
            "total_minutes": sum(t.get("minutes", 0) for t in day_tasks),
            "completed_count": sum(1 for t in day_tasks if t.get("status") == "COMPLETED")
        })

    start_str = start_of_week.strftime("%b %d, %Y")
    end_str = (start_of_week + datetime.timedelta(days=6)).strftime("%b %d, %Y")
    completed_count = sum(1 for t in all_tasks if t.get("status") == "COMPLETED")

    return {
        "week": 1 + offset,
        "week_label": f"{start_str} - {end_str}",
        "focus": focus,
        "completed_count": completed_count,
        "total_count": len(all_tasks),
        "total_minutes": sum(t.get("minutes", 0) for t in all_tasks),
        "tasks": all_tasks,
        "days": days_data
    }

@app.post("/api/weekly-plan/tasks")
def create_weekly_task(payload: CreateTaskRequest):
    if "custom_tasks" not in state:
        state["custom_tasks"] = []
    day_map = {"Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6}
    new_task = {
        "id": f"custom_{uuid.uuid4().hex[:6]}",
        "title": payload.title,
        "type": payload.type,
        "day": payload.day,
        "day_index": day_map.get(payload.day, 0),
        "time_slot": payload.time_slot,
        "minutes": payload.minutes,
        "status": "PENDING",
        "description": payload.description or f"Custom scheduled {payload.type} task.",
        "priority": "MEDIUM"
    }
    state["custom_tasks"].append(new_task)
    return {"status": "created", "task": new_task}

@app.post("/api/weekly-plan/tasks/{task_id}/complete")
def complete_task(task_id: str):
    if "completed_task_ids" not in state:
        state["completed_task_ids"] = []
    if task_id in state["completed_task_ids"]:
        state["completed_task_ids"].remove(task_id)
        status = "PENDING"
    else:
        state["completed_task_ids"].append(task_id)
        status = "COMPLETED"
    state["completed_tasks"] = len(state["completed_task_ids"])
    return {"task_id": task_id, "status": status, "completed_tasks": state["completed_tasks"]}


# ================= PRACTICE & ASSESSMENTS (DYNAMIC) =================

@app.get("/api/practice")
def practice():
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    target_role = state["profile"]["target_role"]
    gaps = analyze_gaps(target_role, state["skills"], custom_key=saved_key)
    
    catalog = []
    for g in gaps:
        skill = g["skill"]
        score = g["current_score"]
        gap_val = g["gap"]
        
        level = "Beginner" if score < 40 else ("Intermediate" if score < 75 else "Advanced")
        category = "Target Role Skill" if gap_val > 0 else "Verified Competency"
        
        catalog.append({
            "name": skill,
            "category": category,
            "description": f"Master {skill} through interactive coding challenges and algorithm optimization for {target_role}.",
            "level": level,
            "challengesCount": 4,
            "isHighGap": gap_val >= 30,
            "current_score": score,
            "gap": gap_val,
            "topics": [f"{skill} Syntax", f"{skill} Core Patterns", f"{skill} Projects", f"{skill} Optimization"]
        })

    focus = gaps[0]["skill"] if gaps else (catalog[0]["name"] if catalog else "Python")
    return {
        "target_role": target_role,
        "resume_uploaded": state.get("resume_uploaded", False),
        "focus": focus,
        "catalog": catalog
    }

@app.get("/api/assessment")
def assessment_catalog():
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    target_role = state["profile"]["target_role"]
    gaps = analyze_gaps(target_role, state["skills"], custom_key=saved_key)
    
    catalog = []
    for g in gaps:
        skill = g["skill"]
        score = g["current_score"]
        catalog.append({
            "skill": skill,
            "category": "Target Role Skill",
            "description": f"Evaluate and certify competency in {skill} for the {target_role} role.",
            "questionsCount": 5,
            "estMinutes": 10 if score >= 60 else 15,
            "verifiedScore": score,
            "is_verified": score >= 80,
            "priority": g["priority"]
        })
        
    return {
        "target_role": target_role,
        "catalog": catalog
    }

@app.post("/api/practice/run")
def run_practice_code(payload: CodeExecutionRequest):
    code = payload.code
    lang = payload.language.lower()
    output_buffer = io.StringIO()
    success = True
    error_msg = ""
    
    if lang == "sql":
        import sqlite3
        try:
            conn = sqlite3.connect(":memory:")
            cursor = conn.cursor()
            cursor.execute("CREATE TABLE orders (id INT, customer_id INT, amount REAL);")
            cursor.execute("INSERT INTO orders VALUES (1, 101, 150.0), (2, 102, 85.0), (3, 101, 200.0), (4, 103, 310.0), (5, 102, 120.0);")
            cursor.execute("CREATE TABLE users (id INT, name TEXT, role TEXT);")
            cursor.execute("INSERT INTO users VALUES (101, 'Alice', 'Engineer'), (102, 'Bob', 'Analyst'), (103, 'Charlie', 'Manager');")
            conn.commit()
            
            statements = [s.strip() for s in code.split(";") if s.strip()]
            results = []
            for stmt in statements:
                res = cursor.execute(stmt)
                if res.description:
                    cols = [d[0] for d in res.description]
                    rows = res.fetchall()
                    header = " | ".join(cols)
                    divider = "-" * len(header)
                    row_strs = [" | ".join(str(val) for val in r) for r in rows]
                    results.append("\n".join([header, divider] + row_strs))
                else:
                    results.append(f"Query executed cleanly. ({cursor.rowcount} rows affected)")
            output = "\n\n".join(results) if results else "Query executed successfully."
            conn.close()
        except Exception as e:
            success = False
            error_msg = str(e)
            output = f"SQL Execution Error: {error_msg}"
            
    elif lang == "python":
        try:
            with contextlib.redirect_stdout(output_buffer):
                safe_globals = {"__builtins__": {k: v for k, v in __builtins__.items() if k in {"print", "range", "len", "sum", "max", "min", "abs", "sorted", "list", "dict", "set", "str", "int", "float", "bool", "round", "enumerate", "zip"}}}
                exec(code, safe_globals)
            output = output_buffer.getvalue()
            if not output.strip():
                output = "Code executed successfully (no stdout output)."
        except Exception as e:
            success = False
            error_msg = str(e)
            output = f"Execution Error: {error_msg}"
    else:
        output = f"Executed {payload.language} snippet successfully."
        
    return {
        "success": success,
        "output": output,
        "error": error_msg,
        "language": payload.language
    }

@app.get("/api/assessment/{skill}")
def assessment(skill: str):
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    return {"skill": skill, "questions": questions_for(skill, custom_key=saved_key)}

@app.post("/api/assessment/submit")
def submit_assessment(payload: AssessmentSubmission):
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    questions = questions_for(payload.skill, custom_key=saved_key)
    result = grade(questions, payload.answers)
    current = float(state["skills"].get(payload.skill, 0))
    new_score = round(current * 0.35 + result["score"] * 0.65, 1)
    state["skills"][payload.skill] = new_score
    
    result["new_skill_score"] = new_score
    result["roadmap_action"] = "VERIFY_AND_UNLOCK" if new_score >= 80 else "NEEDS_PRACTICE_AND_REASSESS"
    
    state["assessment_history"].append({
        "skill": payload.skill,
        "score": result["score"],
        "new_skill_score": new_score,
        "date": "Just now"
    })
    
    return result


# ================= PROGRESS & REPORTS =================

@app.get("/api/progress")
def progress():
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    gaps = analyze_gaps(state["profile"]["target_role"], state["skills"], custom_key=saved_key)
    verified = sum(1 for x in gaps if x["current_score"] >= 80)
    overall = round(sum(state["skills"].values()) / max(len(state["skills"]), 1)) if state["skills"] else 0
    
    role_skills = get_role_skills_ai(state["profile"]["target_role"], custom_key=saved_key)
    radar_data = []
    for sk in role_skills:
        radar_data.append({
            "skill": sk,
            "current": state["skills"].get(sk, 0),
            "required": 80
        })

    return {
        "overall": overall,
        "skills": state["skills"],
        "verified": verified,
        "total_role_skills": len(role_skills),
        "remaining_gaps": [x for x in gaps if x["gap"] > 0],
        "completed_tasks": len(state.get("completed_task_ids", [])),
        "radar_data": radar_data
    }

@app.get("/api/reports/weekly")
def report():
    p = progress()
    gaps = p["remaining_gaps"]
    top_focus = gaps[0]["skill"] if gaps else "All Required Skills Verified"
    
    recommendations = []
    if gaps:
        recommendations.append(f"Primary Focus: Work on '{top_focus}' (current score {gaps[0]['current_score']}%, benchmark 80%).")
        recommendations.append("Complete 2 coding challenges in the Practice Hub.")
        recommendations.append("Take the skill assessment to verify your next roadmap node.")
    else:
        recommendations.append("🎉 All target role skills verified! Consider exploring advanced specialization topics.")

    return {
        "title": "Weekly Skill & Progress Report",
        "generated_at": "Today",
        "learner_name": state["profile"]["name"] or "Learner",
        "target_role": state["profile"]["target_role"],
        "overall_progress": p["overall"],
        "verified_skills_count": p["verified"],
        "total_target_skills": p["total_role_skills"],
        "completed_tasks_count": p["completed_tasks"],
        "skills": p["skills"],
        "radar_data": p["radar_data"],
        "top_gap_skill": top_focus,
        "recommendations": recommendations,
        "assessment_history": state.get("assessment_history", [])[-5:]
    }


# ================= SETTINGS & AI ASSISTANT =================

@app.get("/api/settings")
def get_settings():
    s = dict(state.get("settings", {}))
    s["gemini_configured"] = gemini.is_configured(s.get("gemini_api_key", ""))
    # Do not expose raw API keys in response
    s.pop("gemini_api_key", None)
    s.pop("huggingface_token", None)
    return s

@app.put("/api/settings")
def update_settings(payload: SettingsModel):
    for k, v in payload.model_dump().items():
        if v is not None and v != "":
            state["settings"][k] = v
            if k == "gemini_api_key" and v:
                gemini.api_key = v
            if k == "huggingface_token" and v:
                hf.token = v
    return get_settings()

@app.post("/api/settings/reset")
def reset_demo_data():
    state["auth"]["is_authenticated"] = False
    state["auth"]["email"] = ""
    state["profile"] = {
        "name": "",
        "email": "",
        "education": "",
        "experience": "",
        "target_role": "Data Scientist",
        "goal": "",
        "hours_per_week": 10,
    }
    state["skills"] = {}
    state["resume_uploaded"] = False
    state["resume_filename"] = ""
    state["completed_tasks"] = 0
    state["completed_task_ids"] = []
    state["assessment_history"] = []
    return {"status": "reset_success", "profile": state["profile"]}

@app.post("/api/assistant")
def assistant(payload: ChatRequest):
    saved_key = state.get("settings", {}).get("gemini_api_key", "")
    context = {
        "profile": state["profile"],
        "skills": state["skills"],
        "roadmap": build_roadmap(state["profile"]["target_role"], state["skills"], custom_key=saved_key),
        "weekly_plan": weekly_plan()
    }
    return {"answer": answer(payload.question, context, custom_key=saved_key)}
