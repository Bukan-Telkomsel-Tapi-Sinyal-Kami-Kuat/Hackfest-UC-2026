# rag/generator.py
from langchain_openai import ChatOpenAI
# New way
from langchain_core.messages import SystemMessage, HumanMessage
from .retriever import retrieve_context
from .schemas import GeneratedModule, ModuleRequest
import json

DISABILITY_INSTRUCTIONS = {
    "tunanetra": """
- Konten HARUS bisa dipahami hanya dari audio (tidak ada referensi ke gambar/warna).
- Gunakan deskripsi verbal yang kaya: "bayangkan kamu memegang 3 kelereng..."
- Kalimat pendek, maksimal 15 kata per kalimat.
- Soal latihan berbasis audio: pilihan ganda dengan huruf (A, B, C) bukan visual.
- content_audio_hint: ringkasan 2 kalimat yang akan dibacakan TTS sebelum konten penuh.
""",
    "tunarungu": """
- Konten HARUS visual-friendly: gunakan analogi konkret yang bisa divisualisasikan.
- Tidak ada instruksi yang bergantung pada suara/audio.
- Kalimat singkat dan padat.
- Soal latihan bisa berbasis gambar/pilihan visual (deskripsikan elemen visual).
- content_audio_hint: kosongkan (tidak relevan untuk tunarungu).
""",
    "disleksia": """
- Pecah konten jadi paragraf sangat pendek (maksimal 2 kalimat per paragraf).
- Gunakan bahasa sehari-hari, hindari istilah teknis tanpa penjelasan.
- Berikan analogi dan contoh konkret dari kehidupan sehari-hari anak.
- Soal latihan: satu pertanyaan per layar, kalimat pendek.
- content_audio_hint: versi audio yang bisa dibaca TTS sambil teks di-highlight per kata.
""",
}

DIFFICULTY_DESCRIPTIONS = {
    1: "sangat mudah, bilangan kecil (1-5), satu langkah",
    2: "mudah, bilangan sedang (1-20), satu langkah",
    3: "sedang, dua langkah, mulai ada variasi soal",
    4: "sulit, multi-langkah, perlu pemahaman konsep",
    5: "sangat sulit, aplikasi konsep, soal cerita kompleks",
}

def build_prompt(req: ModuleRequest, context_chunks: list[str]) -> tuple[str, str]:
    context_text = "\n\n---\n\n".join(context_chunks) if context_chunks else "Tidak ada konteks tambahan."

    system = f"""Kamu adalah guru SD yang ahli dalam pendidikan inklusif untuk anak berkebutuhan khusus.
Kamu membuat modul belajar yang ramah dan menyenangkan untuk anak-anak.

Mode disabilitas: {req.disability_mode.upper()}
Instruksi khusus untuk mode ini:
{DISABILITY_INSTRUCTIONS[req.disability_mode]}

Tingkat kesulitan: {req.difficulty}/5 ({DIFFICULTY_DESCRIPTIONS[req.difficulty]})
Nama anak: {req.child_name}
Kelas: {req.grade}

Kamu HARUS merespons dalam format JSON yang valid sesuai schema berikut (tanpa markdown, langsung JSON):
{{
  "topic": "...",
  "grade": {req.grade},
  "disability_mode": "{req.disability_mode}",
  "difficulty": {req.difficulty},
  "content": "...",
  "content_audio_hint": "...",
  "exercises": [
    {{
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ..."],
      "answer": "A",
      "hint": "..."
    }}
  ],
  "parent_guidance": "..."
}}

Buat minimal 3 soal latihan.
"""

    human = f"""Konteks materi dari knowledge base:

{context_text}

---

Buatkan modul belajar untuk topik: "{req.topic}"
Pastikan konten sesuai dengan instruksi disability mode dan tingkat kesulitan yang ditentukan.
"""
    return system, human

def generate_module(req: ModuleRequest) -> GeneratedModule:
    # 1. Retrieve relevant context
    chunks = retrieve_context(
        topic=req.topic,
        grade=req.grade,
        disability_mode=req.disability_mode,
        difficulty=req.difficulty,
    )

    # 2. Build prompt
    system_msg, human_msg = build_prompt(req, chunks)

    # 3. Call LLM
    llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
    response = llm.invoke([
        SystemMessage(content=system_msg),
        HumanMessage(content=human_msg),
    ])

    # 4. Parse JSON output
    raw = response.content.strip()
    data = json.loads(raw)
    return GeneratedModule(**data)