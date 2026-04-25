# rag/retriever.py
import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()

CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")

def get_vectorstore():
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    return Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=embeddings,
        collection_name="adaptive_learning",
    )

def retrieve_context(
    topic: str,
    grade: int,
    disability_mode: str,   # "tunanetra" | "tunarungu" | "disleksia"
    difficulty: int,        # 1-5
    k: int = 4,
) -> list[str]:
    """
    Query vectorstore dengan filter metadata.
    Return list of relevant text chunks.
    """
    vs = get_vectorstore()

    # Filter: grade sesuai, disability_tags mengandung mode yang diminta,
    # difficulty tidak lebih tinggi dari yang diminta
    where_filter = {
        "$and": [
            {"grade":      {"$eq": grade}},
            {"difficulty": {"$lte": difficulty}},
            {"disability_tags": {"$contains": disability_mode}},
        ]
    }

    results = vs.similarity_search(
        query=topic,
        k=k,
        filter=where_filter,
    )

    return [doc.page_content for doc in results]