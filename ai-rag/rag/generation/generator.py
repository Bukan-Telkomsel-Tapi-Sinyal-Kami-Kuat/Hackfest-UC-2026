import os
import requests
from dotenv import load_dotenv

load_dotenv()

_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
_LLM_MODEL = os.getenv("OLLAMA_LLM_MODEL", "gemma4:e4b")


def generate_answer(prompt: str) -> str:
    url = f"{_BASE_URL}/api/generate"
    payload = {"model": _LLM_MODEL, "prompt": prompt, "stream": False}

    try:
        res = requests.post(url, json=payload, timeout=120)
    except requests.exceptions.ConnectionError as e:
        raise RuntimeError(
            f"Cannot reach Ollama at {_BASE_URL}. "
            f"Ensure Ollama is running (`ollama serve`). Detail: {e}"
        )

    if res.status_code == 404:
        raise RuntimeError(
            f"Model '{_LLM_MODEL}' not found in Ollama. "
            f"Run: ollama pull {_LLM_MODEL}"
        )

    res.raise_for_status()

    data = res.json()
    if "response" not in data:
        raise RuntimeError(
            f"Ollama returned unexpected payload. "
            f"Expected key 'response', got: {list(data.keys())}"
        )

    return data["response"]
