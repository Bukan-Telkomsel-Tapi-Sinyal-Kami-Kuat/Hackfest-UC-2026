# rag/schemas.py
from pydantic import BaseModel

class Exercise(BaseModel):
    question: str
    options: list[str] | None = None   # None kalau open-ended
    answer: str
    hint: str

class GeneratedModule(BaseModel):
    topic: str
    grade: int
    disability_mode: str
    difficulty: int
    content: str           # Penjelasan materi utama
    content_audio_hint: str  # Versi pendek untuk TTS (tunanetra/disleksia)
    exercises: list[Exercise]
    parent_guidance: str   # Tips untuk orang tua

class ModuleRequest(BaseModel):
    topic: str
    grade: int
    disability_mode: str   # "tunanetra" | "tunarungu" | "disleksia"
    difficulty: int = 3    # 1=sangat mudah, 5=sulit
    emotion_state: str = "engaged"  # akan dipakai di Tahap 2
    child_name: str = "Adik"