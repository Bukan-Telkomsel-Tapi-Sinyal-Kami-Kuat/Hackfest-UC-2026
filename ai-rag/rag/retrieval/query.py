import os
import logging
from typing import Optional, Dict, Any

import requests
import chromadb
from dotenv import load_dotenv

from rag.retrieval.filter import build_filter

load_dotenv()

logger = logging.getLogger(__name__)

# ======================
# CONFIG
# ======================

CHROMA_DIR = os.getenv("CHROMA_PATH", "./chroma_db")
COLLECTION_NAME = "edu_rag"

_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
_EMBED_URL = f"{_BASE_URL}/api/embeddings"

# ======================
# INIT CHROMA
# ======================

client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_or_create_collection(COLLECTION_NAME)

# ======================
# EMBEDDING
# ======================

def get_embedding(text: str) -> list:
    try:
        res = requests.post(
            _EMBED_URL,
            json={"model": _EMBED_MODEL, "prompt": text},
            timeout=30,
        )
        res.raise_for_status()
        embedding = res.json().get("embedding", [])
        if not embedding:
            raise RuntimeError(f"Empty embedding returned for model '{_EMBED_MODEL}'")
        return embedding
    except requests.exceptions.ConnectionError as e:
        raise RuntimeError(f"Cannot reach Ollama embedder at {_EMBED_URL}. Detail: {e}")
    except Exception as e:
        raise RuntimeError(f"Query embedding failed: {e}")

# ======================
# MAIN QUERY FUNCTION
# ======================

_SUBJECT_ALIASES: dict = {
    "ipa": "ilmu_pengetahuan_alam",
}


def _normalize_subject(subject: Optional[str]) -> Optional[str]:
    if subject is None:
        return None
    s = subject.lower().strip().replace(" ", "_")
    return _SUBJECT_ALIASES.get(s, s)


def query_rag(
    query: str,
    grade: Optional[int] = None,
    subject: Optional[str] = None,
    top_k: int = 5,
) -> Dict[str, Any]:
    if not query.strip():
        raise ValueError("Query cannot be empty")

    subject = _normalize_subject(subject)
    query_embedding = get_embedding(query)
    where_filter = build_filter(grade=grade, subject=subject)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where_filter if where_filter else None,
    )

    doc_count = len((results.get("documents") or [[]])[0])
    logger.info(f"[RETRIEVAL] query='{query[:50]}' grade={grade} subject={subject} → {doc_count} docs")

    return results

# ======================
# HELPERS
# ======================

def format_context(results: Dict[str, Any]) -> str:
    docs = (results.get("documents") or [[]])[0]
    if not docs:
        return ""
    return "\n\n".join(docs)
