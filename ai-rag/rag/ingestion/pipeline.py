# pipeline.py
import os
import chromadb
from chromadb.config import Settings
from typing import Dict, Any
import os

from rag.ingestion.parser import parse_markdown
from rag.ingestion.embedder import get_embedding
from rag.utils.chunking import chunk_text


CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "edu_rag"


client = chromadb.Client(
    Settings(persist_directory=CHROMA_DIR)
)

collection = client.get_or_create_collection(COLLECTION_NAME)


def ingest_file(filepath: str) -> None:
    """
    Ingest a single markdown file into ChromaDB.

    Steps:
    1. Parse markdown → content + metadata
    2. Normalize metadata
    3. Chunk content
    4. Generate embeddings
    5. Insert into ChromaDB

    This function is resilient:
    - skips invalid files
    - skips empty chunks
    - skips invalid embeddings
    """

    # ======================
    # 1. PARSE FILE
    # ======================
    try:
        content, metadata = parse_markdown(filepath)
    except Exception as e:
        print(f"[SKIP] Failed to parse file: {filepath} | {e}")
        return

    if not content or not isinstance(content, str):
        print(f"[SKIP] Empty or invalid content: {filepath}")
        return

    if not isinstance(metadata, dict):
        print(f"[SKIP] Invalid metadata format: {filepath}")
        return

    # ======================
    # 2. NORMALIZE METADATA
    # ======================
    metadata = _normalize_metadata(metadata)

    # ======================
    # 3. CHUNKING
    # ======================
    chunks = chunk_text(content)

    if not chunks:
        print(f"[SKIP] No chunks generated: {filepath}")
        return

    filename = os.path.basename(filepath)

    print(f"\n[FILE] {filename}")
    print(f"[INFO] Total chunks: {len(chunks)}")

    # ======================
    # 4. PROCESS CHUNKS
    # ======================
    inserted_count = 0

    for idx, chunk in enumerate(chunks):
        chunk = chunk.strip()

        # Skip empty chunk
        if not chunk:
            print(f"[WARN] Empty chunk skipped: {filename}_{idx}")
            continue

        # ======================
        # 5. EMBEDDING
        # ======================
        try:
            embedding = get_embedding(chunk)
        except Exception as e:
            print(f"[ERROR] Embedding failed: {filename}_{idx} | {e}")
            continue

        if not embedding or not isinstance(embedding, list):
            print(f"[WARN] Invalid embedding skipped: {filename}_{idx}")
            continue

        # ======================
        # 6. INSERT TO CHROMA
        # ======================
        doc_id = f"{filename}_{idx}"

        try:
            collection.add(
                documents=[chunk],
                metadatas=[metadata],
                embeddings=[embedding],
                ids=[doc_id]
            )
            inserted_count += 1

        except Exception as e:
            print(f"[ERROR] Failed to insert: {doc_id} | {e}")
            continue

    # ======================
    # SUMMARY
    # ======================
    print(f"[DONE] Inserted {inserted_count}/{len(chunks)} chunks from {filename}")
def _normalize_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize metadata for consistency across dataset.
    """

    normalized = metadata.copy()

    # Normalize subject
    subject = normalized.get("subject")
    if isinstance(subject, str):
        subject = subject.lower().strip().replace(" ", "_")

        # mapping khusus
        if subject == "ipa":
            subject = "ilmu_pengetahuan_alam"

        normalized["subject"] = subject

    # Normalize grade
    if "grade" in normalized:
        try:
            normalized["grade"] = int(normalized["grade"])
        except Exception:
            pass

    # Normalize difficulty
    if "difficulty" in normalized:
        try:
            normalized["difficulty"] = int(normalized["difficulty"])
        except Exception:
            pass

    return normalized