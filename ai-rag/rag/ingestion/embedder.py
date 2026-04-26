import os
import requests
from dotenv import load_dotenv

load_dotenv()

_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
_EMBED_URL = f"{_BASE_URL}/api/embeddings"


def get_embedding(text: str) -> list:
    try:
        res = requests.post(
            _EMBED_URL,
            json={"model": _EMBED_MODEL, "prompt": text},
            timeout=30,
        )
        res.raise_for_status()
    except requests.exceptions.ConnectionError as e:
        raise RuntimeError(
            f"Cannot reach Ollama embedder at {_EMBED_URL}. "
            f"Ensure Ollama is running (`ollama serve`). Detail: {e}"
        )

    embedding = res.json().get("embedding", [])

    if not embedding:
        raise RuntimeError(
            f"Ollama returned empty embedding for model '{_EMBED_MODEL}'. "
            f"Run: ollama pull {_EMBED_MODEL}"
        )

    return embedding
