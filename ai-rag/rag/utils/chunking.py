from typing import List
import re


def chunk_text(text: str, chunk_size: int = 300) -> List[str]:
    """
    Split text into chunks using sentence + newline aware splitting.
    """

    # 🔥 split by:
    # - titik
    # - newline
    sentences = re.split(r'[.\n]', text)

    chunks = []
    current = ""

    for s in sentences:
        s = s.strip()
        if not s:
            continue

        if len(current) + len(s) < chunk_size:
            current += s + ". "
        else:
            chunks.append(current.strip())
            current = s + ". "

    if current:
        chunks.append(current.strip())

    return chunks