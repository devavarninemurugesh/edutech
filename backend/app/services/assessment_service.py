from typing import Any
from app.services.gemini_service import gemini

QUESTION_BANK: dict[str, list[dict[str, Any]]] = {
    "SQL": [
        {"id": "sql1", "type": "mcq", "question": "Which clause filters individual rows before GROUP BY aggregation?", "options": ["WHERE", "HAVING", "ORDER BY", "JOIN"], "answer": "WHERE", "topic": "SELECT, WHERE & ORDER BY", "explanation": "WHERE filters raw rows before aggregation occurs, while HAVING filters aggregated results."},
        {"id": "sql2", "type": "mcq", "question": "Which JOIN returns all records from the left table and matched records from the right table?", "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], "answer": "LEFT JOIN", "topic": "INNER, LEFT & RIGHT JOINs", "explanation": "LEFT JOIN preserves all rows from the left table regardless of whether a match exists on the right table."},
        {"id": "sql3", "type": "mcq", "question": "Which clause is specifically used to filter aggregated group values?", "options": ["WHERE", "HAVING", "LIMIT", "FROM"], "answer": "HAVING", "topic": "GROUP BY & Aggregates", "explanation": "HAVING is evaluated after GROUP BY to filter aggregate values like COUNT(), SUM(), AVG()."},
        {"id": "sql4", "type": "mcq", "question": "Which feature computes calculations across a set of table rows related to the current row without collapsing them?", "options": ["GROUP BY", "Window Function", "DISTINCT", "UNION"], "answer": "Window Function", "topic": "Window Functions (ROW_NUMBER, RANK)", "explanation": "Window functions (using OVER clause) calculate aggregates across partitions while preserving individual row identity."},
    ],
    "Python": [
        {"id": "py1", "type": "mcq", "question": "Which Python data type is mutable?", "options": ["tuple", "list", "str", "int"], "answer": "list", "topic": "Lists, Dicts & Sets", "explanation": "Lists can be modified in-place (append, pop, item assignment), making them mutable. Tuples, strings, and ints are immutable."},
        {"id": "py2", "type": "mcq", "question": "Which keyword is used to define a function in Python?", "options": ["func", "define", "def", "function"], "answer": "def", "topic": "Functions & Modules", "explanation": "In Python, functions are defined using the 'def' keyword."},
        {"id": "py3", "type": "mcq", "question": "What is the result of [x * 2 for x in range(3)]?", "options": ["[0, 2, 4]", "[2, 4, 6]", "[0, 1, 2]", "[1, 2, 3]"], "answer": "[0, 2, 4]", "topic": "Syntax & Control Flow", "explanation": "range(3) yields 0, 1, 2. Multiplying each by 2 yields 0, 2, 4 in a new list."},
        {"id": "py4", "type": "mcq", "question": "Which method is called automatically when an object is instantiated from a class?", "options": ["__start__", "__init__", "__create__", "__main__"], "answer": "__init__", "topic": "Object-Oriented Programming", "explanation": "__init__ is Python's constructor method executed upon class instance creation."},
    ]
}

def questions_for(skill: str, custom_key: str = "") -> list[dict[str, Any]]:
    if gemini.is_configured(custom_key):
        prompt = (
            f"Generate 4 high-quality technical multiple-choice assessment questions for the skill '{skill}'.\n"
            "Return JSON array of objects with schema:\n"
            "[\n"
            '  {\n'
            '    "id": "q1",\n'
            '    "type": "mcq",\n'
            '    "question": "Question text?",\n'
            '    "options": ["Option A", "Option B", "Option C", "Option D"],\n'
            '    "answer": "Option A",\n'
            '    "topic": "Topic Name",\n'
            '    "explanation": "Why Option A is correct"\n'
            '  }\n'
            "]"
        )
        res = gemini.json("Return ONLY JSON array of assessment objects", prompt, custom_key=custom_key)
        if isinstance(res, list) and len(res) >= 2:
            cleaned = []
            for idx, q in enumerate(res):
                if isinstance(q, dict) and "question" in q and "options" in q:
                    q["id"] = f"{skill.lower()[:4]}_{idx+1}"
                    q["type"] = "mcq"
                    cleaned.append(q)
            if cleaned:
                return cleaned

    if skill in QUESTION_BANK:
        return QUESTION_BANK[skill]
    
    return [
        {
            "id": f"{skill.lower()}_q1",
            "type": "mcq",
            "question": f"What is a core fundamental practice when working with {skill}?",
            "options": [
                f"Following {skill} modular design patterns and clear documentation",
                f"Ignoring error handling and type checks in {skill}",
                f"Hardcoding all credentials and static configurations",
                f"Avoid testing {skill} logic before production deployment"
            ],
            "answer": f"Following {skill} modular design patterns and clear documentation",
            "topic": "Fundamentals",
            "explanation": f"Best practices for {skill} emphasize modular architecture, robust error checking, and code documentation."
        },
        {
            "id": f"{skill.lower()}_q2",
            "type": "mcq",
            "question": f"How do developers measure proficiency and quality in {skill} applications?",
            "options": [
                "Through code readability, unit tests, and performance metrics",
                "By writing the longest single file possible",
                "By disabling all warnings and logging output",
                "By avoiding version control system usage"
            ],
            "answer": "Through code readability, unit tests, and performance metrics",
            "topic": "Skill Assessment",
            "explanation": "High quality software engineering requires test coverage, maintainability, and clean code."
        }
    ]

def grade(questions: list[dict], answers: dict[str, str]) -> dict:
    correct = 0
    feedback = []
    weak = []
    
    for q in questions:
        user_ans = answers.get(q["id"])
        is_correct = user_ans == q["answer"]
        if is_correct:
            correct += 1
        else:
            if q.get("topic"):
                weak.append(q["topic"])
        feedback.append({
            "question_id": q["id"],
            "question": q["question"],
            "user_answer": user_ans,
            "correct_answer": q["answer"],
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    score = round(correct / len(questions) * 100) if questions else 0
    return {
        "score": score,
        "correct": correct,
        "total": len(questions),
        "weak_topics": list(set(weak)),
        "feedback": feedback
    }
