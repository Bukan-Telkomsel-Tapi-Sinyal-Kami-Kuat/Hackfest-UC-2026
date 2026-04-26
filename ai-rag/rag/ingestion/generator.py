import json
import re
import logging

from rag.generation.generator import generate_answer
from rag.generation.prompt import build_module_prompt

logger = logging.getLogger(__name__)


def generate_module(req) -> dict:
    """
    Generate a structured learning module.

    Flow:
    1. Try RAG retrieval for relevant context (optional — never fails the request)
    2. Build structured JSON prompt
    3. Generate via Ollama
    4. Parse JSON response
    5. Validate and return
    """
    # 1. Retrieve context (required — no context = no hallucination)
    context = ""
    try:
        from rag.retrieval.query import query_rag, format_context
        results = query_rag(
            req.topic,
            grade=req.grade,
            subject=req.subject,
            top_k=3,
        )
        docs = results.get("documents", [[]])[0]
        if docs:
            context = format_context(results)
            logger.info(f"[MODULE] Retrieved {len(docs)} context docs for '{req.topic}'")
        else:
            logger.warning(f"[MODULE] No RAG context for '{req.topic}' — returning explicit fallback")
            return _no_context_fallback(req)
    except Exception as e:
        logger.warning(f"[MODULE] RAG retrieval failed: {e} — returning explicit fallback")
        return _no_context_fallback(req)

    # 2. Build prompt
    prompt = build_module_prompt(
        subject=req.subject,
        topic=req.topic,
        grade=req.grade,
        difficulty=req.difficulty,
        context=context,
    )

    # 3. Generate
    logger.info(f"[MODULE] Generating module: subject={req.subject} topic={req.topic} grade={req.grade} difficulty={req.difficulty}")
    raw = generate_answer(prompt)

    # 4. Parse structured JSON
    parsed = _parse_json_response(raw, req)

    return parsed


def _parse_json_response(raw: str, req) -> dict:
    """
    Extract JSON from LLM response. Falls back to a minimal valid structure on failure.
    Tries in order: raw JSON → ```json block → first {...} block → fallback.
    """
    text = raw.strip()

    # Try 1: entire response is JSON
    try:
        data = json.loads(text)
        return _validate_structure(data, req)
    except (json.JSONDecodeError, ValueError):
        pass

    # Try 2: extract from ```json ... ``` block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(1))
            return _validate_structure(data, req)
        except (json.JSONDecodeError, ValueError):
            pass

    # Try 3: find outermost {...} block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(0))
            return _validate_structure(data, req)
        except (json.JSONDecodeError, ValueError):
            pass

    # Fallback: wrap raw text in minimal valid structure
    logger.warning(f"[MODULE] JSON parse failed — using fallback structure")
    return _fallback_structure(raw, req)


def _validate_structure(data: dict, req) -> dict:
    """Ensure required keys exist, fill missing ones with defaults."""
    defaults = _fallback_structure("", req)
    for key in defaults:
        if key not in data:
            data[key] = defaults[key]

    # Ensure exercise items have question+answer
    if isinstance(data.get("exercise"), list):
        data["exercise"] = [
            e if (isinstance(e, dict) and "question" in e and "answer" in e)
            else {"question": str(e), "answer": "-"}
            for e in data["exercise"]
        ]

    # Ensure accessibility has all three keys
    acc = data.get("accessibility", {})
    for key in ("tunanetra", "tunarungu", "disleksia"):
        if key not in acc:
            acc[key] = defaults["accessibility"][key]
    data["accessibility"] = acc

    return data


def _no_context_fallback(req) -> dict:
    return {
        "title": f"Materi {req.topic.title()} — Kelas {req.grade}",
        "explanation": "Materi tidak ditemukan dalam database. Silakan tambahkan materi terlebih dahulu melalui panel admin.",
        "examples": [],
        "exercise": [{"question": "Materi belum tersedia.", "answer": "-"}],
        "accessibility": {
            "tunanetra": "Materi belum tersedia dalam database.",
            "tunarungu": "Materi belum tersedia dalam database.",
            "disleksia": "Materi belum tersedia dalam database.",
        },
    }


def _fallback_structure(raw_text: str, req) -> dict:
    explanation = raw_text[:400] if raw_text else "Terjadi kesalahan saat memproses materi."
    return {
        "title": f"Materi {req.topic.title()} — Kelas {req.grade}",
        "explanation": explanation,
        "examples": [],
        "exercise": [{"question": "Tidak ada soal tersedia.", "answer": "-"}],
        "accessibility": {
            "tunanetra": "Dengarkan penjelasan dan gunakan alat bantu audio.",
            "tunarungu": "Baca teks dengan perlahan dan perhatikan gambar.",
            "disleksia": "Gunakan huruf besar, baca per kata, dan minta bantuan jika perlu.",
        },
    }
