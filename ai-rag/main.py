# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from rag.ingestion.generator import generate_module
from rag.schemas import ModuleRequest, GeneratedModule
import argparse
import sys
from rag.ingestion.pipeline import ingest_folder, ingest_file
from rag.retrieval.query import query_rag
from rag.retrieval.query import query_rag, format_context
from rag.generation.prompt import build_prompt
from rag.generation.generator import generate_answer

from pydantic import BaseModel
from typing import Optional


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


def _cli():
    parser = argparse.ArgumentParser(prog="main.py")
    sub = parser.add_subparsers(dest="cmd")

    p_ingest = sub.add_parser("ingest", help="Ingest markdown files into ChromaDB")
    p_ingest.add_argument("path", nargs="?", default="dataset_md", help="File or folder to ingest")

    p_query = sub.add_parser("query", help="Query the RAG DB")
    p_query.add_argument("q", help="Query text")
    p_query.add_argument("--grade", type=int)
    p_query.add_argument("--subject")

    args = parser.parse_args()
    if args.cmd == "ingest":
        path = args.path
        import os

        if os.path.isdir(path):
            ingest_folder(path)
        elif os.path.isfile(path):
            ingest_file(path)
        else:
            print("Path not found:", path)
            sys.exit(2)

    elif args.cmd == "query":
        res = query_rag(args.q, grade=args.grade, subject=args.subject)
        for r in res:
            print("---")
            print(r.get("id"))
            print(r.get("metadata"))
            print(r.get("document")[:400])
class AskRequest(BaseModel):
    question: str
    grade: Optional[int] = None
    subject: Optional[str] = None
    emotion_state: Optional[str] = "engaged"


class AskResponse(BaseModel):
    answer: str
    context_used: list[str]


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    try:
        # 1. adjust difficulty (optional logic reuse)
        difficulty = adjust_difficulty(3, req.emotion_state)

        # 2. retrieval
        results = query_rag(
            req.question,
            grade=req.grade,
            subject=req.subject,
            top_k=3
        )

        docs = results.get("documents", [[]])[0]

        if not docs:
            return AskResponse(
                answer="Aku belum menemukan jawabannya dari materi yang tersedia.",
                context_used=[]
            )

        # 3. format context
        context = format_context(results)

        # 4. build prompt
        prompt = build_prompt(
            context=context,
            question=req.question,
            grade=req.grade
        )

        # 5. generate answer
        answer = generate_answer(prompt)

        return AskResponse(
            answer=answer,
            context_used=docs
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    _cli()