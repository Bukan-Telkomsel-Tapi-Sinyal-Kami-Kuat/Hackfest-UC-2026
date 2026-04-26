import { Injectable, Logger } from '@nestjs/common';

const AI_RAG_BASE = process.env.AI_RAG_URL ?? 'http://localhost:8000';

const SUBJECT_ALIASES: Record<string, string> = {
  ipa: 'ilmu_pengetahuan_alam',
};

const EMOTION_DELTA: Record<string, number> = {
  overwhelmed: -2,
  confused: -1,
  engaged: 0,
  bored: +1,
};

function normalizeSubject(subject?: string): string | undefined {
  if (!subject) return undefined;
  const s = subject.toLowerCase().trim().replace(/\s+/g, '_');
  return SUBJECT_ALIASES[s] ?? s;
}

function adjustDifficulty(base: number, emotion?: string): number {
  const delta = EMOTION_DELTA[emotion ?? 'engaged'] ?? 0;
  return Math.max(1, Math.min(5, base + delta));
}

export interface AskPayload {
  question: string;
  grade?: number;
  subject?: string;
  emotion_state?: string;
}

export interface AskResponse {
  answer: string;
  context_used: string[];
}

export interface ModulePayload {
  subject: string;
  topic: string;
  grade: number;
  difficulty: number;
  emotion_state?: string;
}

export interface GeneratedModule {
  title: string;
  explanation: string;
  examples: string[];
  exercise: { question: string; answer: string }[];
  accessibility: {
    tunanetra: string;
    tunarungu: string;
    disleksia: string;
  };
}

@Injectable()
export class AiRagService {
  private readonly logger = new Logger(AiRagService.name);

  async callAsk(payload: AskPayload): Promise<AskResponse> {
    const normalized = {
      question: payload.question,
      grade: payload.grade !== undefined ? Number(payload.grade) : undefined,
      subject: normalizeSubject(payload.subject),
      emotion_state: payload.emotion_state ?? 'engaged',
    };

    this.logger.log(`[ask] ${JSON.stringify(normalized)}`);

    const res = await fetch(`${AI_RAG_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized),
      signal: AbortSignal.timeout(150_000),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`AI-RAG /ask ${res.status}: ${detail}`);
    }

    return res.json() as Promise<AskResponse>;
  }

  async callGenerateModule(payload: ModulePayload): Promise<GeneratedModule> {
    const adjustedDifficulty = adjustDifficulty(
      Number(payload.difficulty),
      payload.emotion_state,
    );

    const normalized = {
      subject: normalizeSubject(payload.subject) ?? payload.subject,
      topic: payload.topic,
      grade: Number(payload.grade),
      difficulty: adjustedDifficulty,
      emotion_state: payload.emotion_state ?? 'engaged',
    };

    this.logger.log(`[generate-module] ${JSON.stringify(normalized)}`);

    const res = await fetch(`${AI_RAG_BASE}/generate-module`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized),
      signal: AbortSignal.timeout(150_000),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`AI-RAG /generate-module ${res.status}: ${detail}`);
    }

    return res.json() as Promise<GeneratedModule>;
  }
}
