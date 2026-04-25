# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from rag.generator import generate_module
from rag.schemas import ModuleRequest, GeneratedModule

app = FastAPI(title="Adaptive Learning RAG — Ollama")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Emotion → difficulty adjustment table
EMOTION_DELTA: dict[str, int] = {
    "overwhelmed": -2,
    "confused":    -1,
    "engaged":      0,
    "bored":       +1,
}

def adjust_difficulty(base: int, emotion: str) -> int:
    delta = EMOTION_DELTA.get(emotion, 0)
    return max(1, min(5, base + delta))


@app.get("/health")
def health():
    return {"status": "ok", "models": {"llm": "gemma3:4b", "embed": "nomic-embed-text"}}


@app.post("/generate-module", response_model=GeneratedModule)
def generate(req: ModuleRequest) -> GeneratedModule:
    # Sesuaikan difficulty berdasarkan emotion state
    adjusted = adjust_difficulty(req.difficulty, req.emotion_state)

    if adjusted != req.difficulty:
        print(f"[main] Emotion '{req.emotion_state}' → difficulty {req.difficulty} → {adjusted}")

    req_adjusted = req.model_copy(update={"difficulty": adjusted})

    try:
        return generate_module(req_adjusted)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))