# rag/retriever.py
import os
from dotenv import load_dotenv
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()

CHROMA_PATH = os.getenv("CHROMA_PATH",        "./chroma_db")
EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL",  "nomic-embed-text")
OLLAMA_URL  = os.getenv("OLLAMA_BASE_URL",     "http://localhost:11434")


def get_vectorstore() -> Chroma:
    embeddings = OllamaEmbeddings(
        model=EMBED_MODEL,
        base_url=OLLAMA_URL,
    )
    return Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=embeddings,
        collection_name="adaptive_learning",
    )


def retrieve_context(
    topic: str,
    grade: int,
    disability_mode: str,
    difficulty: int,
    k: int = 4,
) -> list[str]:
    """
    Similarity search dengan filter metadata.
    ChromaDB filter: $and, $eq, $lte, $contains.
    """
    vs = get_vectorstore()

    where_filter: dict = {
        "$and": [
            {"grade":           {"$eq":       grade}},
            {"difficulty":      {"$lte":      difficulty}},
            {"disability_tags": {"$contains": disability_mode}},
        ]
    }

    results = vs.similarity_search(
        query=topic,
        k=k,
        filter=where_filter,
    )

    return [doc.page_content for doc in results]