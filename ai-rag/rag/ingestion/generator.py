from rag.generation.generator import generate_answer


def generate_module(req):
    prompt = f"""
Buatkan materi pembelajaran.

Subject: {req.subject}
Topik: {req.topic}
Kelas: {req.grade}
Difficulty: {req.difficulty}

Format:
- Penjelasan
- Contoh
- Latihan
"""

    result = generate_answer(prompt)

    return {
        "subject": req.subject,
        "topic": req.topic,
        "grade": req.grade,
        "difficulty": req.difficulty,
        "content": result
    }