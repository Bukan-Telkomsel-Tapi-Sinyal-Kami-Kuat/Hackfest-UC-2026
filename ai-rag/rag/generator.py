# rag/generator.py
import os
import json
import re
from dotenv import load_dotenv

from langchain_ollama import OllamaLLM
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import ChatOllama

from .retriever import retrieve_context
from .schemas import GeneratedModule, ModuleRequest

load_dotenv()

LLM_MODEL  = os.getenv("OLLAMA_LLM_MODEL",  "gemma3:4b")
OLLAMA_URL = os.getenv("OLLAMA_BASE_URL",    "http://localhost:11434")

# ── Disability instructions ───────────────────────────────────────────────────

DISABILITY_INSTRUCTIONS: dict[str, str] = {
    "tunanetra": """\
- Konten HARUS bisa dipahami hanya dari audio (tidak ada referensi ke gambar/warna).
- Gunakan deskripsi verbal yang kaya: "bayangkan kamu memegang 3 kelereng..."
- Kalimat pendek, maksimal 15 kata per kalimat.
- Soal latihan berbasis audio: pilihan ganda dengan label A, B, C (bukan visual).
- content_audio_hint: ringkasan 2 kalimat yang akan dibacakan TTS sebelum konten penuh.""",

    "tunarungu": """\
- Konten HARUS visual-friendly: gunakan analogi konkret yang bisa divisualisasikan.
- Tidak ada instruksi yang bergantung pada suara/audio.
- Kalimat singkat dan padat.
- Soal latihan berbasis pilihan visual (deskripsikan elemen visual dengan jelas).
- content_audio_hint: isi dengan string kosong "" (tidak relevan untuk tunarungu).""",

    "disleksia": """\
- Pecah konten jadi paragraf sangat pendek (maksimal 2 kalimat per paragraf).
- Gunakan bahasa sehari-hari, hindari istilah teknis tanpa penjelasan langsung.
- Berikan analogi konkret dari kehidupan sehari-hari anak SD.
- Soal latihan: kalimat pendek, satu ide per soal.
- content_audio_hint: versi ringkas yang bisa dibaca TTS sambil teks di-highlight per kata.""",
}

DIFFICULTY_DESCRIPTIONS: dict[int, str] = {
    1: "sangat mudah — bilangan kecil (1-5), satu langkah",
    2: "mudah — bilangan sedang (1-20), satu langkah",
    3: "sedang — dua langkah, mulai ada variasi",
    4: "sulit — multi-langkah, perlu pemahaman konsep",
    5: "sangat sulit — soal cerita kompleks, aplikasi konsep",
}

# ── JSON schema template ──────────────────────────────────────────────────────

JSON_SCHEMA = """\
{
  "topic": "<string>",
  "grade": <integer>,
  "disability_mode": "<string>",
  "difficulty": <integer>,
  "content": "<string — penjelasan materi utama>",
  "content_audio_hint": "<string — ringkasan 2 kalimat untuk TTS>",
  "exercises": [
    {
      "question": "<string>",
      "options": ["A. ...", "B. ...", "C. ..."],
      "answer": "A",
      "hint": "<string>"
    }
  ],
  "parent_guidance": "<string — tips singkat untuk orang tua>"
}"""

# ── Prompt builder ────────────────────────────────────────────────────────────

def build_prompt(req: ModuleRequest, chunks: list[str]) -> str:
    context_text = "\n\n---\n\n".join(chunks) if chunks else "(tidak ada konteks tambahan)"

    return f"""<start_of_turn>user
Kamu adalah guru SD ahli pendidikan inklusif untuk anak berkebutuhan khusus.

MODE DISABILITAS: {req.disability_mode.upper()}
INSTRUKSI KHUSUS:
{DISABILITY_INSTRUCTIONS[req.disability_mode]}

TINGKAT KESULITAN: {req.difficulty}/5 ({DIFFICULTY_DESCRIPTIONS[req.difficulty]})
NAMA ANAK: {req.child_name}
KELAS: {req.grade}
KONDISI EMOSI ANAK SAAT INI: {req.emotion_state}

KONTEKS MATERI DARI KNOWLEDGE BASE:
{context_text}

TUGAS:
Buat modul belajar untuk topik "{req.topic}" dalam Bahasa Indonesia yang ramah anak.
Buat TEPAT 3 soal latihan.

PENTING: Balas HANYA dengan JSON valid sesuai schema ini, tanpa teks lain, tanpa markdown:
{JSON_SCHEMA}
<end_of_turn>
<start_of_turn>model
"""

# ── JSON extractor (robust) ───────────────────────────────────────────────────

def extract_json(raw: str) -> dict:
    """
    Coba parse JSON dari response LLM.
    Gemma kadang nulis teks sebelum/sesudah JSON — kita strip dulu.
    """
    # Hapus markdown code block kalau ada
    raw = re.sub(r"```(?:json)?", "", raw).strip()

    # Coba langsung parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Coba temukan JSON object di dalam string
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Tidak bisa parse JSON dari response LLM:\n{raw[:300]}")

# ── Main generator ────────────────────────────────────────────────────────────

def generate_module(req: ModuleRequest) -> GeneratedModule:
    # 1. Retrieve context dari vectorstore
    chunks = retrieve_context(
        topic=req.topic,
        grade=req.grade,
        disability_mode=req.disability_mode,
        difficulty=req.difficulty,
    )

    # 2. Build prompt (format Gemma chat)
    prompt = build_prompt(req, chunks)

    # 3. Call Ollama — pakai ChatOllama biar bisa set temperature & format
    llm = ChatOllama(
        model=LLM_MODEL,
        base_url=OLLAMA_URL,
        temperature=0.3,       # rendah biar output konsisten
        num_ctx=4096,          # context window Gemma 4B
        format="json",         # ← Ollama native JSON mode (Ollama ≥ 0.1.9)
    )

    response = llm.invoke(prompt)
    raw_text = response.content if hasattr(response, "content") else str(response)

    # 4. Parse + validasi dengan Pydantic
    data = extract_json(raw_text)

    # Pastikan field wajib yang mungkin tidak di-generate LLM tetap ada
    data.setdefault("topic",             req.topic)
    data.setdefault("grade",             req.grade)
    data.setdefault("disability_mode",   req.disability_mode)
    data.setdefault("difficulty",        req.difficulty)
    data.setdefault("content_audio_hint", "")
    data.setdefault("parent_guidance",   "")

    return GeneratedModule(**data)