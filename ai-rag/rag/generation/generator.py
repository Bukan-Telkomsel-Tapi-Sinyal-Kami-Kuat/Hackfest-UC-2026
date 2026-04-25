import requests

GEMINI_API_KEY = "AIzaSyDQft5GBPJxscBy6fz9fr2wmUURP4rbjfY"


def generate_answer(prompt: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    res = requests.post(url, json=payload)
    res.raise_for_status()

    return res.json()["candidates"][0]["content"]["parts"][0]["text"]