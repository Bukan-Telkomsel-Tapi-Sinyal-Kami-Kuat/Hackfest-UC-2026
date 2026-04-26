# System Run Guide — VISEA

Three services must run simultaneously for full system operation.

---

## 1. AI-RAG Service (port 8000)

Handles Q&A and module generation via Ollama + ChromaDB.

```bash
cd ai-rag

# Install dependencies (already has venv)
# Ensure Ollama is installed: https://ollama.com

# Pull required models
ollama serve
ollama pull gemma4:e4b
ollama pull nomic-embed-text

# Ingest dataset (first time only)
python main.py ingest dataset_md

# Start FastAPI server
python main.py
# Runs on http://localhost:8000
```

---

## 2. Backend (port 3000)

NestJS API + WebSocket server.

```bash
cd backend

npm install
npx prisma generate
npx prisma migrate deploy
# Seed admin account
npx prisma db seed

npm run start:dev
# Runs on http://localhost:3000
```

**Default admin credentials:**
- Email: `admin@visea.id`
- Password: `admin123`

---

## 3. Frontend (port 3067)

Next.js UI.

```bash
cd frontend

npm install
npm run dev
# Opens on http://localhost:3067
```

---

## Environment Variables

**Backend** (`backend/.env`):
```
DATABASE_URL=<your-supabase-postgres-url>
DIRECT_URL=<your-supabase-direct-url>
GEMINI_API_KEY=<your-gemini-api-key>
AI_RAG_URL=http://localhost:8000
PORT=3000
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

**AI-RAG** (`ai-rag/.env`):
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_LLM_MODEL=gemma4:e4b
OLLAMA_EMBED_MODEL=nomic-embed-text
CHROMA_PATH=./chroma_db
CORPUS_PATH=./data/corpus
```

---

## System Flow

1. Open `http://localhost:3067` in browser
2. Camera activates → MediaPipe tracks face
3. User authenticates (register/login)
4. Select or create child profile
5. Start learning session — behavior logs stream to backend via WebSocket
6. Ask questions → backend calls AI-RAG → answer returned via `ai_answer` socket event
7. Generate module → backend calls AI-RAG → module returned via `module_ready` socket event
8. Overload detection triggers `ai_feedback` prompts for parent guidance

---

## Ports Summary

| Service | Port | URL |
|---------|------|-----|
| Frontend (Next.js) | 3067 | http://localhost:3067 |
| Backend (NestJS) | 3000 | http://localhost:3000 |
| AI-RAG (FastAPI) | 8000 | http://localhost:8000 |
| Ollama | 11434 | http://localhost:11434 |

---

## Troubleshooting

**AI-RAG not responding:**
- Verify Ollama is running: `ollama list`
- Check model is pulled: `ollama pull gemma4:e4b`
- Run ingestion: `python main.py ingest dataset_md`

**WebSocket connection refused:**
- Ensure backend is running on port 3000
- Check CORS settings in backend

**Database connection error:**
- Verify DATABASE_URL in `backend/.env`
- Run `npx prisma migrate deploy` to apply migrations

**Module generation returns empty:**
- AI-RAG must be running on port 8000
- ChromaDB must have ingested data: `python main.py ingest dataset_md`