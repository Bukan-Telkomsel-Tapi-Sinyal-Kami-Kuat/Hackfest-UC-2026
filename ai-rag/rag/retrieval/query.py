from typing import Optional, Dict, Any
import requests
import chromadb
from chromadb.config import Settings

from rag.retrieval.filter import build_filter

# ======================
# CONFIG
# ======================

CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "edu_rag"

OLLAMA_URL = "http://localhost:11434/api/embeddings"
EMBED_MODEL = "nomic-embed-text"

# ======================
# INIT CHROMA
# ======================

client = chromadb.Client(
    Settings(persist_directory=CHROMA_DIR)
)

collection = client.get_or_create_collection(COLLECTION_NAME)

# ======================
# EMBEDDING
# ======================

def get_embedding(text: str) -> list[float]:
    """
    Generate embedding vector for query using Ollama.
    """
    try:
        res = requests.post(
            OLLAMA_URL,
            json={
                "model": EMBED_MODEL,
                "prompt": text
            },
            timeout=30
        )
        res.raise_for_status()
        return res.json()["embedding"]

    except Exception as e:
        raise RuntimeError(f"Query embedding failed: {e}")

# ======================
# MAIN QUERY FUNCTION
# ======================

def query_rag(
    query: str,
    grade: Optional[int] = None,
    subject: Optional[str] = None,
    top_k: int = 5
) -> Dict[str, Any]:
    """
    Query vector database with optional metadata filtering.

    Args:
        query: user question
        grade: filter by grade (optional)
        subject: filter by subject (optional)
        top_k: number of results

    Returns:
        dict with documents, metadata, distances
    """

    if not query.strip():
        raise ValueError("Query cannot be empty")

    # 1. Embed query
    query_embedding = get_embedding(query)

    # 2. Build metadata filter
    where_filter = build_filter(grade=grade, subject=subject)

    # 3. Query Chroma
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where_filter if where_filter else None
    )

    return results

# ======================
# HELPER (OPTIONAL)
# ======================

def format_context(results: Dict[str, Any]) -> str:
    """
    Convert retrieved documents into a single context string for LLM.
    """
    docs = results.get("documents", [[]])[0]

    if not docs:
        return ""

    return "\n\n".join(docs)