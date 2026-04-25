# rag/ingestor.py
import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader
# New way
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings
import frontmatter  # pip install python-frontmatter

load_dotenv()

CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")
CORPUS_PATH = os.getenv("CORPUS_PATH", "./data/corpus")

def load_documents():
    """Load semua file .md dari corpus folder"""
    docs = []
    for filepath in Path(CORPUS_PATH).glob("**/*.md"):
        post = frontmatter.load(filepath)
        # Metadata dari YAML frontmatter
        metadata = {
            "subject":         post.get("subject", ""),
            "topic":           post.get("topic", ""),
            "grade":           int(post.get("grade", 1)),
            "difficulty":      int(post.get("difficulty", 1)),
            "disability_tags": ",".join(post.get("disability_tags", [])),
            "source":          str(filepath),
        }
        from langchain_core.documents import Document
        docs.append(Document(page_content=post.content, metadata=metadata))
    print(f"Loaded {len(docs)} documents")
    return docs

def chunk_documents(docs):
    """Split dokumen jadi chunks yang lebih kecil"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=512,       # karakter per chunk — cukup untuk 1 paragraf
        chunk_overlap=64,     # overlap biar konteks tidak putus
        separators=["\n\n", "\n", ". ", " "],
    )
    chunks = splitter.split_documents(docs)
    print(f"Total chunks: {len(chunks)}")
    return chunks

def build_vectorstore(chunks):
    """Embed chunks dan simpan ke ChromaDB"""
    embeddings = OllamaEmbeddings(model="gemma4:e4b")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=OllamaEmbeddings(model="nomic-embed-text"),
        persist_directory=CHROMA_PATH,
        collection_name="adaptive_learning",
    )
    print(f"Vectorstore built at {CHROMA_PATH}")
    return vectorstore

def ingest():
    docs   = load_documents()
    chunks = chunk_documents(docs)
    build_vectorstore(chunks)
    print("Ingestion complete.")

if __name__ == "__main__":
    ingest()