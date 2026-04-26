from pydantic import BaseModel, Field
from typing import List


class ModuleRequest(BaseModel):
    subject: str
    topic: str
    grade: int
    difficulty: int = Field(..., ge=1, le=5)
    emotion_state: str = "engaged"


class Exercise(BaseModel):
    question: str
    answer: str


class Accessibility(BaseModel):
    tunanetra: str
    tunarungu: str
    disleksia: str


class GeneratedModule(BaseModel):
    title: str
    explanation: str
    examples: List[str]
    exercise: List[Exercise]
    accessibility: Accessibility
