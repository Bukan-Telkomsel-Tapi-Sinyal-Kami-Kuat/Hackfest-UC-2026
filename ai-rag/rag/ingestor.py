# rag/ingestor.py
import os
from pathlib import Path
from dotenv import load_dotenv

import frontmatter
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings          # ← ganti
from langchain_community.vectorstores import Chroma

load_dotenv()

CHROMA_PATH  = os.getenv("CHROMA_PATH",  "./chroma_db")
CORPUS_PATH  = os.getenv("CORPUS_PATH",  "./data/corpus")
EMBED_MODEL  = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
OLLAMA_URL   = os.getenv("OLLAMA_BASE_URL",    "http://localhost:11434")


def get_embeddings() -> OllamaEmbeddings:
    return OllamaEmbeddings(
        model=EMBED_MODEL,
        base_url=OLLAMA_URL,
    )


def load_documents() -> list[Document]:
    docs: list[Document] = []
    for filepath in Path(CORPUS_PATH).glob("**/*.md"):
        post = frontmatter.load(filepath)
        metadata = {
            "subject":         str(post.get("subject", "")),
            "topic":           str(post.get("topic",   "")),
            "grade":           int(post.get("grade",    1)),
            "difficulty":      int(post.get("difficulty", 1)),
            # ChromaDB hanya terima string/int/float/bool di metadata
            "disability_tags": ",".join(post.get("disability_tags", [])),
            "source":          str(filepath),
        }
        docs.append(Document(page_content=post.content, metadata=metadata))

    print(f"[ingestor] Loaded {len(docs)} documents")
    return docs


def chunk_documents(docs: list[Document]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,       # lebih kecil biar cocok konteks Gemma 4B
        chunk_overlap=60,
        separators=["\n\n", "\n", ". ", " "],
    )
    chunks = splitter.split_documents(docs)
    print(f"[ingestor] Total chunks: {len(chunks)}")
    return chunks


def build_vectorstore(chunks: list[Document]) -> Chroma:
    embeddings = get_embeddings()
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH,
        collection_name="adaptive_learning",
    )
    print(f"[ingestor] Vectorstore saved → {CHROMA_PATH}")
    return vectorstore


def ingest() -> None:
    docs   = load_documents()
    chunks = chunk_documents(docs)
    build_vectorstore(chunks)
    print("[ingestor] Done.")


if __name__ == "__main__":
    ingest()