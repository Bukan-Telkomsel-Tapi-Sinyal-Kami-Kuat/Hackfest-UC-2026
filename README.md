# VISEA — Adaptive Learning Platform for Children with Special Needs

Real-time adaptive learning platform for children with autism, ADHD, Down Syndrome, and dyslexia. Uses computer vision to monitor engagement, triggers AI-generated parent guidance, and generates adaptive lessons via local LLM.

---

## Architecture

```
Browser (Parent)
│
├── Next.js Frontend :3067
│   ├── MediaPipe (webcam) ──→ engagement score, gaze, EAR
│   ├── Socket.io client ────→ streams send_log to backend
│   └── REST client ─────────→ auth / children / sessions
│
├── NestJS Backend :3000
│   ├── REST API ────────────→ PostgreSQL (Supabase/local) via Prisma
│   ├── WebSocket Gateway ───→ receives send_log, triggers Gemini
│   │                          handles ask_question → ai_answer
│   │                          handles request_module → module_ready
│   └── Gemini 1.5 Flash ────→ parent instruction generation
│
└── FastAPI AI/RAG :8000
    ├── ChromaDB ────────────→ educational corpus vector search
    └── Ollama gemma4:e4b ───→ adaptive module generation
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| Python | ≥ 3.10 | https://python.org |
| PostgreSQL | any | local or Supabase |
| Ollama | latest | https://ollama.com |

---

## 1. Ollama Setup

```bash
# Start Ollama server
ollama serve

# Pull required models (do this once)
ollama pull gemma4:e4b
ollama pull nomic-embed-text
```

Verify:
```bash
curl http://localhost:11434/api/tags
```

---

## 2. Backend (NestJS :3000)

### Install

```bash
cd backend
npm install
```

### Configure

Create `backend/.env`:

```env
# Supabase (pooled — used at runtime)
DATABASE_URL="postgresql://postgres.<project>:<password>@aws-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase (direct — used for migrations)
DIRECT_URL="postgresql://postgres.<project>:<password>@aws-<region>.pooler.supabase.com:5432/postgres"

# For local PostgreSQL instead:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/visea_db"
# DIRECT_URL="postgresql://postgres:password@localhost:5432/visea_db"

GEMINI_API_KEY=your_google_gemini_api_key
PORT=3000

# Optional — defaults to http://localhost:8000
AI_RAG_URL=http://localhost:8000
```

### Migrate & Generate

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

> First run creates all tables: User, Child, Session, BehavioralLog, ParentPrompt, RAGReference, AdminModule.

### Run

```bash
npm run start:dev   # dev with hot-reload
# or
npm run build && npm run start:prod
```

---

## 3. AI/RAG Service (FastAPI :8000)

### Install

```bash
cd ai-rag
pip install -r requirements.txt
```

### Configure

`ai-rag/.env` already exists with defaults:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_LLM_MODEL=gemma4:e4b
OLLAMA_EMBED_MODEL=nomic-embed-text
CHROMA_PATH=./chroma_db
```

### Ingest Corpus (first time only)

```bash
cd ai-rag
python main.py ingest dataset_md
```

Ingests 15 Markdown files (math, science, Indonesian language — grades 1–6) into ChromaDB.

### Run

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Verify:
```bash
curl http://localhost:8000/health
# {"status":"ok","models":{"llm":"gemma4:e4b","embed":"nomic-embed-text"}}
```

---

## 4. Frontend (Next.js :3067)

### Install

```bash
cd frontend
npm install
```

### Configure

`frontend/.env.local` already exists. Verify:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Run

```bash
npm run dev   # http://localhost:3067
```

---

## Start Order

Services must start in this order:

```
1. ollama serve
2. uvicorn main:app --host 0.0.0.0 --port 8000 --reload   (cd ai-rag)
3. npm run start:dev                                        (cd backend)
4. npm run dev                                              (cd frontend)
```

---

## Usage

1. Open `http://localhost:3067`
2. Register as **PARENT** or log in
3. Add a child profile (name, birth date, disability type)
4. Start a learning session from dashboard
5. Grant webcam permission — MediaPipe begins tracking
6. Live panel shows: engagement score, gaze direction, overload status
7. When overload/low-engagement detected → Gemini generates parent instruction → appears in overlay
8. Navigate to a learning module → RAG generates adaptive content (topic + grade + difficulty)

---

## API Reference

### Backend REST

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register user |
| POST | `/auth/login` | — | Login → returns JWT |
| GET | `/children` | JWT | List children (current user) |
| POST | `/children` | JWT | Create child profile |
| GET | `/children/:id` | JWT | Child detail + sessions |
| POST | `/sessions/start` | JWT | Start session |
| PATCH | `/sessions/:id/end` | JWT | End session |
| GET | `/admin/modules` | JWT + ADMIN | List learning modules |
| POST | `/admin/modules` | JWT + ADMIN | Create module |
| PUT | `/admin/modules/:id` | JWT + ADMIN | Update module |
| DELETE | `/admin/modules/:id` | JWT + ADMIN | Delete module |

### Socket.io Events

| Event (emit) | Payload | Response event | Description |
|---|---|---|---|
| `send_log` | `{sessionId, engagementScore, gazeDirection, overloadStatus}` | `ai_feedback` | Behavioral log — triggers Gemini if overloaded |
| `ask_question` | `{question, grade?, subject?, emotion_state?}` | `ai_answer` | RAG-based question answering |
| `request_module` | `{subject, topic, grade, difficulty, emotion_state?}` | `module_ready` | Generate adaptive learning module |

### AI/RAG REST (direct)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Status check |
| POST | `/ask` | RAG question answering |
| POST | `/generate-module` | Generate structured learning module |

---

## Dataset

Educational corpus in `ai-rag/dataset_md/`. Markdown files with YAML frontmatter:

```markdown
---
subject: matematika
topic: pecahan
grade: 5
difficulty: 4
---
# Pecahan
...
```

Subjects available: `matematika`, `ipa` (→ `ilmu_pengetahuan_alam`), `bahasa_indonesia`  
Grades: 1–6  
Difficulty: 1–5

To add new material: create a `.md` file in `dataset_md/` then re-run `python main.py ingest dataset_md`.

---

## Environment Variables Summary

### `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL pooled connection (PgBouncer) |
| `DIRECT_URL` | Yes | PostgreSQL direct connection (for migrations) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `PORT` | No | Default: 3000 |
| `AI_RAG_URL` | No | Default: http://localhost:8000 |

### `frontend/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend URL |

### `ai-rag/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `OLLAMA_BASE_URL` | No | Default: http://localhost:11434 |
| `OLLAMA_LLM_MODEL` | No | Default: gemma4:e4b |
| `OLLAMA_EMBED_MODEL` | No | Default: nomic-embed-text |
| `CHROMA_PATH` | No | Default: ./chroma_db |

---

## Troubleshooting

**Ollama model not found**
```bash
ollama pull gemma4:e4b
ollama pull nomic-embed-text
```

**ChromaDB empty — modules return "Materi tidak ditemukan"**
```bash
cd ai-rag && python main.py ingest dataset_md
```

**Prisma generate fails**
```bash
cd backend && npx prisma generate
```

**Backend won't start — missing env**
Create `backend/.env` from `backend/.env.example`.

**CORS errors from frontend**
Backend runs `app.enableCors({ origin: '*' })` — ensure backend is actually running on :3000.

**Camera not working**
Browser requires HTTPS or localhost for `getUserMedia`. Use `http://localhost:3067`.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, MediaPipe, Socket.io-client |
| Backend | NestJS 11, TypeScript, Prisma 7, PostgreSQL, Socket.io, Gemini 1.5 Flash, Passport JWT |
| AI/RAG | FastAPI, Ollama (gemma4:e4b), ChromaDB, nomic-embed-text |

> JWT secret is `'KODE_RAHASIA_HACKATHON'` — demo only. Replace before any production deployment.
