from copy import deepcopy
from app.services.gemini_service import gemini

ROLES = {
    "Data Scientist": ["Python", "NumPy", "Pandas", "SQL", "Statistics", "Machine Learning", "Data Visualization", "Model Evaluation", "Projects"],
    "AI/ML Engineer": ["Python", "NumPy", "Pandas", "Statistics", "Machine Learning", "Deep Learning", "PyTorch", "APIs", "Deployment", "Projects"],
    "Data Analyst": ["Excel", "SQL", "Python", "Pandas", "Statistics", "Data Visualization", "Power BI", "Projects"],
    "Full Stack Developer": ["HTML/CSS", "JavaScript", "TypeScript", "React", "Node.js", "REST APIs", "SQL", "Git", "Projects"],
    "Backend Developer": ["Python", "Java", "SQL", "FastAPI", "REST APIs", "Authentication", "Testing", "Docker", "Git", "Projects"],
    "Cloud & DevOps Engineer": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Python", "Git", "Projects"],
    "Cybersecurity Analyst": ["Networking", "Linux", "Python", "Cryptography", "Vulnerability Assessment", "SIEM Tools", "Web Security", "Projects"],
    "Software Engineer": ["Python", "Java", "SQL", "JavaScript", "TypeScript", "C++", "Git", "Projects"],
}

TOPICS = {
    "Python": ["Syntax & Control Flow", "Functions & Modules", "Lists, Dicts & Sets", "Object-Oriented Programming", "Error Handling & Clean Code"],
    "NumPy": ["Multi-dimensional ndarray", "Vectorized Array Math", "Matrix Slicing & Broadcasting", "Z-Score Normalization", "Linear Algebra"],
    "Pandas": ["DataFrames & Series", "Data Cleaning & Missing Data", "GroupBy & Pivot Tables", "Merging & Concat", "Time-Series Handling"],
    "SQL": ["SELECT, WHERE & ORDER BY", "GROUP BY & Aggregates", "INNER, LEFT & RIGHT JOINs", "Subqueries & CTEs", "Window Functions (ROW_NUMBER, RANK)"],
    "Statistics": ["Mean, Median, Standard Deviation", "Probability & Bayes Theorem", "Normal & Binomial Distributions", "Hypothesis Testing & p-values", "Correlation vs Causation"],
    "Machine Learning": ["Supervised vs Unsupervised", "Linear & Logistic Regression", "Decision Trees & Random Forests", "Feature Scaling & Encoding", "Model Validation & Metrics"],
    "Deep Learning": ["Neural Network Architecture", "Activation Functions", "Backpropagation", "Convolutional Networks (CNN)", "Transformers & LLM Basics"],
    "PyTorch": ["Tensors & GPU Operations", "Autograd & Gradients", "Building nn.Module Architectures", "Training Loops & Loss Functions", "Pretrained Model Fine-tuning"],
    "Data Visualization": ["Matplotlib Fundamentals", "Seaborn Statistical Plots", "Correlation Heatmaps", "Interactive Plotly Dashboards", "Visual Storytelling"],
    "Model Evaluation": ["Confusion Matrix & Metrics", "Precision, Recall & F1-Score", "ROC-AUC Curves", "Cross-Validation Techniques", "Model Drift & Monitoring"],
    "JavaScript": ["ES6+ Syntax & Scope", "Array Methods (map, filter, reduce)", "Async/Await & Promises", "DOM Manipulation", "Event Handling"],
    "TypeScript": ["Static Typing & Interfaces", "Generics & Utility Types", "Union & Intersection Types", "Type Narrowing", "TSConfig & Build Pipeline"],
    "React": ["Components & JSX", "State & Props", "Hooks (useState, useEffect, useMemo)", "Component Architecture", "Routing & Context API"],
    "Node.js": ["Event Loop & Async I/O", "File System & Streams", "Express/Fastify Server", "Middleware Architecture", "NPM Ecosystem"],
    "HTML/CSS": ["Semantic HTML5 Tags", "CSS Flexbox & CSS Grid", "Responsive Design & Media Queries", "CSS Variables & Utility Classes", "Accessibility (a11y)"],
    "Java": ["Object-Oriented OOP Principles", "Classes & Interfaces", "Collections Framework (List, Map, Set)", "Concurrency & Multi-threading", "JVM & Memory Management"],
    "C++": ["Pointers, References & Memory", "RAII & Smart Pointers", "STL Vectors, Maps & Algorithms", "Templates & OOP", "Performance Optimization"],
    "Git": ["Repository Setup & Commits", "Branching & Merging", "Merge Conflicts & Rebasing", "Pull Requests & Code Review", "Git Stash & Reset"],
    "REST APIs": ["HTTP Methods & Status Codes", "RESTful Resource Architecture", "JSON Payloads & Headers", "Authentication & JWT", "API Rate Limiting & Versioning"],
    "Docker": ["Container Fundamentals", "Writing Dockerfiles", "Image Layer Optimization", "Docker Compose Multi-Service", "Port Mapping & Volumes"],
    "Linux": ["Shell Navigation & Core Commands", "File Permissions & Chmod", "Process Management (ps, top, kill)", "Bash Scripting Basics", "SSH & Networking"],
    "AWS": ["EC2 Virtual Compute", "S3 Object Storage", "Lambda Serverless Functions", "RDS Cloud Databases", "IAM Security Policies"],
    "Testing": ["Unit Testing Principles", "PyTest & Jest Frameworks", "Mocking & Test Fixtures", "Integration Testing", "TDD Best Practices"],
    "Power BI": ["Power Query Data Prep", "DAX Formulas & Measures", "Interactive Visual Reports", "Data Modeling & Relationships", "Dashboard Publishing"],
    "Excel": ["Formulas (VLOOKUP, XLOOKUP)", "Pivot Tables & Slicers", "Conditional Formatting", "Data Validation & Cleansing", "Index Match & Macros"],
    "Projects": ["Problem Formulation & Scoping", "Architecture & Data Pipeline", "Implementation & Clean Code", "Testing & Performance Benchmarks", "Documentation & GitHub Portfolio"],
}

RESOURCES = {
    "Python": [
        {"title": "Official Python 3 Documentation", "url": "https://docs.python.org/3/tutorial/", "type": "Documentation"},
        {"title": "Real Python - Interactive Guides & Tutorials", "url": "https://realpython.com/", "type": "Interactive"},
        {"title": "CS50's Introduction to Programming with Python", "url": "https://cs50.harvard.edu/python/", "type": "Course"}
    ],
    "NumPy": [
        {"title": "NumPy Official User Guide & Quickstart", "url": "https://numpy.org/doc/stable/user/quickstart.html", "type": "Documentation"},
        {"title": "100 NumPy Exercises with Solutions", "url": "https://github.com/rougier/numpy-100", "type": "Exercises"}
    ],
    "Pandas": [
        {"title": "Pandas 10-Minute Official Guide", "url": "https://pandas.pydata.org/docs/user_guide/10min.html", "type": "Documentation"},
        {"title": "Kaggle Pandas Interactive Course", "url": "https://www.kaggle.com/learn/pandas", "type": "Course"}
    ],
    "SQL": [
        {"title": "SQLBolt - Interactive SQL Lessons", "url": "https://sqlbolt.com/", "type": "Interactive"},
        {"title": "Mode Analytics SQL Tutorial for Data Analysis", "url": "https://mode.com/sql-tutorial/", "type": "Tutorial"},
        {"title": "PostgreSQL Official Documentation", "url": "https://www.postgresql.org/docs/", "type": "Documentation"}
    ],
    "Machine Learning": [
        {"title": "Scikit-Learn User Guide & API Reference", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "Documentation"},
        {"title": "StatQuest with Josh Starmer - ML Fundamentals", "url": "https://www.youtube.com/c/joshstarmer", "type": "Video"},
        {"title": "Google Machine Learning Crash Course", "url": "https://developers.google.com/machine-learning/crash-course", "type": "Course"}
    ],
    "Deep Learning": [
        {"title": "DeepLearning.AI - Neural Networks Specialization", "url": "https://www.deeplearning.ai/", "type": "Course"},
        {"title": "Fast.ai - Practical Deep Learning for Coders", "url": "https://course.fast.ai/", "type": "Course"}
    ],
    "PyTorch": [
        {"title": "Official PyTorch 60-Minute Blitz Tutorial", "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", "type": "Documentation"},
        {"title": "PyTorch Examples & Model Hub", "url": "https://github.com/pytorch/examples", "type": "Repository"}
    ],
    "Data Visualization": [
        {"title": "Seaborn Tutorial & Gallery", "url": "https://seaborn.pydata.org/tutorial.html", "type": "Documentation"},
        {"title": "Plotly Python Interactive Graphing Library", "url": "https://plotly.com/python/", "type": "Documentation"}
    ],
    "Statistics": [
        {"title": "Khan Academy - Statistics & Probability", "url": "https://www.khanacademy.org/math/statistics-probability", "type": "Course"},
        {"title": "Seeing Theory - Visual Introduction to Probability", "url": "https://seeing-theory.brown.edu/", "type": "Interactive"}
    ],
    "React": [
        {"title": "React.dev - Modern Official React Documentation", "url": "https://react.dev/learn", "type": "Documentation"},
        {"title": "Full Stack Open - Modern Web Development", "url": "https://fullstackopen.com/en/", "type": "Course"}
    ],
    "TypeScript": [
        {"title": "TypeScript Official Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "type": "Documentation"},
        {"title": "Total TypeScript Interactive Tutorials", "url": "https://www.totaltypescript.com/tutorials", "type": "Interactive"}
    ],
    "JavaScript": [
        {"title": "MDN Web Docs - JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "Documentation"},
        {"title": "JavaScript.info - The Modern JavaScript Tutorial", "url": "https://javascript.info/", "type": "Tutorial"}
    ]
}

def get_role_skills_ai(role: str, custom_key: str = "") -> list[str]:
    """Dynamically get role skills using Gemini AI or curated fallback."""
    if role in ROLES:
        return ROLES[role]
    if gemini.is_configured(custom_key):
        prompt = f"Identify 7 to 9 essential core technical skills required for the career role: '{role}'. Return JSON list of skill strings e.g. [\"Skill 1\", \"Skill 2\"]."
        res = gemini.json("Return ONLY JSON array of strings", prompt, custom_key=custom_key)
        if isinstance(res, list) and len(res) >= 3:
            return [str(s).strip() for s in res]
        elif isinstance(res, dict) and "skills" in res:
            return [str(s).strip() for s in res["skills"]]
    return ROLES.get(role, ROLES["Data Scientist"])

def build_roadmap(role: str, user_skills: dict[str, float], custom_key: str = "") -> list[dict]:
    required = get_role_skills_ai(role, custom_key)
    nodes = []
    previous = None
    
    for idx, skill in enumerate(required):
        score = float(user_skills.get(skill, 0))
        status = "VERIFIED" if score >= 80 else ("IN_PROGRESS" if score > 0 else "LOCKED")
        if idx == 0 and status == "LOCKED":
            status = "AVAILABLE"
        if previous and nodes[-1]["status"] not in {"VERIFIED"}:
            status = "LOCKED"
            
        topics = TOPICS.get(skill, [f"{skill} Core Syntax", f"{skill} Core Patterns", f"{skill} Advanced Applications", "Practice & Real-World Projects"])
        resources = RESOURCES.get(skill, [
            {"title": f"Official {skill} Core Documentation & Guide", "url": f"https://www.google.com/search?q={skill}+official+documentation", "type": "Documentation"},
            {"title": f"{skill} Interactive Exercises & Practice", "url": f"https://www.google.com/search?q={skill}+tutorial+exercises", "type": "Tutorial"}
        ])

        node = {
            "id": skill.lower().replace(" ", "-").replace("/", "-"),
            "title": skill,
            "skill": skill,
            "status": status,
            "score": score,
            "required_score": 80,
            "topics": topics,
            "estimated_hours": 2 + len(topics),
            "prerequisites": [previous] if previous else [],
            "resources": resources
        }
        nodes.append(node)
        previous = node["id"]
    return nodes

def analyze_gaps(role: str, user_skills: dict[str, float], custom_key: str = "") -> list[dict]:
    required = get_role_skills_ai(role, custom_key)
    result = []
    for skill in required:
        current = float(user_skills.get(skill, 0))
        gap = max(0, 80 - current)
        priority = "HIGH" if gap >= 30 else ("MEDIUM" if gap >= 10 else "LOW")
        result.append({
            "skill": skill, 
            "current_score": current, 
            "required_score": 80, 
            "gap": round(gap, 1), 
            "priority": priority,
            "is_verified": current >= 80
        })
    return sorted(result, key=lambda x: (-x["gap"], x["skill"]))

def get_learning_tools(role: str, user_skills: dict[str, float], custom_key: str = "") -> dict:
    """Generate dynamic curated learning tools, interactive sandboxes, docs, and cheat sheets for the candidate."""
    gaps = analyze_gaps(role, user_skills, custom_key)
    all_role_skills = get_role_skills_ai(role, custom_key)
    
    tools = []
    for g in gaps:
        skill = g["skill"]
        score = g["current_score"]
        gap_val = g["gap"]
        topics = TOPICS.get(skill, [f"{skill} Basics", f"{skill} Intermediate Patterns", f"{skill} Project Applications"])
        res_list = RESOURCES.get(skill, [
            {"title": f"Official {skill} Guide", "url": f"https://www.google.com/search?q={skill}+documentation", "type": "Documentation"},
            {"title": f"Interactive {skill} Tutorial", "url": f"https://www.google.com/search?q={skill}+tutorial", "type": "Tutorial"}
        ])
        
        tool_entry = {
            "skill": skill,
            "target_role": role,
            "current_score": score,
            "gap": gap_val,
            "priority": g["priority"],
            "status": "Verified" if score >= 80 else ("Needs Practice" if score > 0 else "Unstarted"),
            "topics": topics,
            "resources": res_list,
            "playground_type": "python" if skill in ["Python", "NumPy", "Pandas", "Machine Learning", "Statistics", "Deep Learning", "PyTorch", "Data Visualization", "Model Evaluation"] else ("sql" if skill == "SQL" else "code"),
            "interactive_challenge_count": 4 if gap_val > 0 else 2,
            "estimated_study_hours": 3 if gap_val >= 30 else (2 if gap_val > 0 else 1),
            "recommendation": f"Focus on {skill} to reduce your {gap_val}% deficit. Work through the interactive playground and verify with assessment."
        }
        tools.append(tool_entry)
        
    return {
        "target_role": role,
        "total_skills": len(all_role_skills),
        "high_priority_count": sum(1 for g in gaps if g["priority"] == "HIGH"),
        "verified_count": sum(1 for g in gaps if g["current_score"] >= 80),
        "tools": tools
    }

def get_dynamic_projects(role: str, user_skills: dict[str, float], custom_key: str = "") -> list[dict]:
    """Dynamically generate hands-on project deliverables for target role skills."""
    gaps = analyze_gaps(role, user_skills, custom_key)
    projects = []
    
    for g in gaps:
        skill = g["skill"]
        score = g["current_score"]
        difficulty = "Beginner" if score < 40 else ("Intermediate" if score < 75 else "Advanced")
        
        projects.append({
            "id": f"proj-{skill.lower().replace(' ', '-').replace('/', '-')}",
            "skill": skill,
            "title": f"End-to-End {skill} Real-World Implementation",
            "tagline": f"Hands-on Portfolio Project for {role}",
            "description": f"Build and deploy a production-grade portfolio project utilizing {skill}. Follow enterprise design patterns, write clean tests, and optimize execution performance.",
            "techStack": [skill, role, "Git", "Testing"],
            "difficulty": difficulty,
            "estHours": "3-4 hrs" if g["priority"] == "HIGH" else "2 hrs",
            "deliverables": [f"{skill} Architecture Pipeline", f"Unit Tests & Validations", "Portfolio GitHub Markdown Report"],
            "codeStarterKey": skill,
            "current_score": score,
            "gap": g["gap"],
            "priority": g["priority"]
        })
    return projects
