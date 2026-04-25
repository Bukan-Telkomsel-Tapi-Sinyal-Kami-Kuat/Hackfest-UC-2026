# rag/schemas.py
from pydantic import BaseModel, Field
from typing import Literal


class Exercise(BaseModel):
    question: str
    options:  list[str] | None = None
    answer:   str
    hint:     str


class GeneratedModule(BaseModel):
    topic:              str
    grade:              int
    disability_mode:    str
    difficulty:         int
    content:            str
    content_audio_hint: str = ""
    exercises:          list[Exercise]
    parent_guidance:    str = ""


class ModuleRequest(BaseModel):
    topic:           str
    grade:           int = Field(default=1, ge=1, le=6)
    disability_mode: Literal["tunanetra", "tunarungu", "disleksia"]
    difficulty:      int = Field(default=3, ge=1, le=5)
    emotion_state:   Literal["overwhelmed", "confused", "engaged", "bored"] = "engaged"
    child_name:      str = "Adik"