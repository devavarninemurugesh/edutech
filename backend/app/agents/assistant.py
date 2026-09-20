from app.services.gemini_service import gemini

def answer(question: str, context: dict, custom_key: str = None) -> str:
    system = (
        "You are EduPath AI, an adaptive learning assistant and expert career mentor powered by Google Gemini API. "
        "Use the provided learner context (profile, target role, skill scores, roadmap nodes, and weekly tasks) to provide "
        "concise, practical, encouraging, and highly actionable advice. Use bullet points or code snippets where appropriate."
    )
    user = f"Learner Context:\n{context}\n\nUser Question:\n{question}"
    return gemini.chat(system, user, custom_key=custom_key)
