# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from rag.generator import generate_module
from rag.schemas import ModuleRequest, GeneratedModule

app = FastAPI(title="Adaptive Learning RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/generate-module", response_model=GeneratedModule)
def generate(req: ModuleRequest):
    try:
        module = generate_module(req)
        return module
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))