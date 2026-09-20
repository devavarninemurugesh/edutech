# EduPath — Adaptive AI Learning & Skill-Gap Agent

EduPath is a full-stack prototype for personalized career learning. It connects learner profiling, resume analysis, skill-gap detection, an adaptive roadmap, weekly tasks, practice, assessment, performance analysis, and an AI learning assistant.

## Architecture

```text
Learner
  ↓
Profile + Resume
  ↓
AI Profile Analysis
  ↓
Skill Gap
  ↓
Adaptive Roadmap
  ↓
Resources + Weekly Tasks
  ↓
Practice + Assessment
  ↓
Performance Analysis
  ↓
Adaptive Learning Agent
  ↓
Updated Roadmap + Weekly Plan
```

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios, React Flow, Monaco Editor, Recharts
- Backend: FastAPI, Pydantic, SQLAlchemy-ready architecture
- AI: Hugging Face Inference API
- Document extraction: pypdf
- Database: SQLite by default for quick development; PostgreSQL-ready via `DATABASE_URL`

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate       # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
copy .env.example .env          # Windows
# cp .env.example .env          # macOS/Linux
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs

### Frontend

```bash
cd frontend
npm install
copy .env.example .env         # Windows
# cp .env.example .env         # macOS/Linux
npm run dev
```

Frontend: http://localhost:5173

## Hugging Face

Set these in `backend/.env`:

```env
HF_TOKEN=your_token
HF_MODEL=Qwen/Qwen2.5-7B-Instruct
```

The token remains backend-only. If no token is configured, EduPath uses deterministic demo fallbacks for the prototype instead of pretending an external model was called.

## Current working prototype

- FastAPI backend and API documentation
- Profile and skill editing
- PDF/text resume extraction and AI-ready skill analysis
- Target-role skill-gap engine
- Adaptive roadmap data model and UI
- Weekly plan and task completion
- Practice hub
- MCQ assessment and deterministic scoring
- Skill score updates from assessments
- Progress dashboard
- Context-aware AI assistant
- Hugging Face service abstraction

## Production next steps

1. Add real authentication and persistent PostgreSQL repositories.
2. Persist roadmap/weekly-task/assessment history per user.
3. Connect a sandboxed code execution provider such as Judge0/Piston.
4. Expand the resource catalog and add retrieval/search.
5. Implement full React Flow dependency graph and node detail drawer.
6. Add generated coding/SQL assessments with hidden test cases.
7. Implement the full adaptive agent as a persisted state transition service.
8. Add report generation and richer analytics.

## Security

Never expose `HF_TOKEN` to the frontend. Do not execute arbitrary learner code in the FastAPI process; use an isolated code-execution service before enabling arbitrary code submissions in production.
