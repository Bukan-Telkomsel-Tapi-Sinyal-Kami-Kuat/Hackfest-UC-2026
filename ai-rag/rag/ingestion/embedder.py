import requests
from typing import List


OLLAMA_URL = "http://localhost:11434/api/embeddings"
MODEL = "nomic-embed-text"


def get_embedding(text: str):
    res = requests.post(
        "http://localhost:11434/api/embeddings",
        json={
            "model": "nomic-embed-text",
            "prompt": text
        }
    )

    data = res.json()

    print("EMBED RAW:", data)

    return data.get("embedding", [])