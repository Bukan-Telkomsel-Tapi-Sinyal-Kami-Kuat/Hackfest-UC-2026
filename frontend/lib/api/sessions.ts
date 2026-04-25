import type {
  Session,
  BehavioralLog,
  ParentPrompt,
  OverloadStatus,
  InstructionType,
} from "@/types/session";

const SESSIONS_KEY = "visea_sessions";
const LOGS_KEY = "visea_behavioral_logs";
const PROMPTS_KEY = "visea_prompts";

function readSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeSessions(data: Session[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(data));
}

function readLogs(): BehavioralLog[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeLogs(data: BehavioralLog[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(data));
}

function readPrompts(): ParentPrompt[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PROMPTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writePrompts(data: ParentPrompt[]) {
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(data));
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function startSession(childId: string, moduleSlug?: string): Promise<Session> {
  await delay(300);
  const session: Session = {
    id: `s_${Date.now()}`,
    childId,
    startTime: new Date().toISOString(),
    moduleSlug,
  };
  const all = readSessions();
  all.push(session);
  writeSessions(all);
  return session;
}

export async function endSession(sessionId: string): Promise<Session | null> {
  await delay(300);
  const all = readSessions();
  const idx = all.findIndex((s) => s.id === sessionId);
  if (idx < 0) return null;
  const logs = readLogs().filter((l) => l.sessionId === sessionId);
  const avg = logs.length
    ? logs.reduce((sum, l) => sum + l.engagementScore, 0) / logs.length
    : undefined;
  all[idx] = { ...all[idx], endTime: new Date().toISOString(), averageEngagement: avg };
  writeSessions(all);
  return all[idx];
}

export async function getSessions(childId: string): Promise<Session[]> {
  await delay(200);
  return readSessions()
    .filter((s) => s.childId === childId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export async function getAllSessions(): Promise<Session[]> {
  await delay(200);
  return readSessions().sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

export async function addBehavioralLog(
  sessionId: string,
  data: {
    engagementScore: number;
    gazeDirection: string;
    microExpression?: string;
    overloadStatus: OverloadStatus;
  }
): Promise<BehavioralLog> {
  const log: BehavioralLog = {
    id: `bl_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    sessionId,
    timestamp: new Date().toISOString(),
    ...data,
  };
  const all = readLogs();
  all.push(log);
  writeLogs(all);
  return log;
}

export async function getLogsForSession(sessionId: string): Promise<BehavioralLog[]> {
  await delay(150);
  return readLogs()
    .filter((l) => l.sessionId === sessionId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

const PROMPT_TEMPLATES: Partial<
  Record<OverloadStatus, { aiMessage: string; instructionType: InstructionType }[]>
> = {
  OVERLOAD: [
    {
      aiMessage:
        "Anak terlihat kelelahan. Coba hentikan aktivitas dan berikan jeda 5 menit.",
      instructionType: "BREAK",
    },
    {
      aiMessage:
        "Stimulasi terlalu tinggi. Ganti ke Kartu Visual yang lebih tenang.",
      instructionType: "VISUAL_CARD",
    },
    {
      aiMessage: "Putar musik penenang untuk membantu anak kembali fokus.",
      instructionType: "CALMING_MUSIC",
    },
  ],
  WARNING: [
    {
      aiMessage:
        "Fokus anak mulai menurun. Coba ajak bicara dengan instruksi verbal sederhana.",
      instructionType: "VERBAL",
    },
    {
      aiMessage:
        "Anak terlihat sedikit teralihkan. Tunjukkan kartu visual untuk menarik perhatian kembali.",
      instructionType: "VISUAL_CARD",
    },
  ],
};

export async function generateAIPrompt(
  sessionId: string,
  overloadStatus: OverloadStatus
): Promise<ParentPrompt | null> {
  const templates = PROMPT_TEMPLATES[overloadStatus];
  if (!templates) return null;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const prompt: ParentPrompt = {
    id: `pp_${Date.now()}`,
    sessionId,
    timestamp: new Date().toISOString(),
    aiMessage: template.aiMessage,
    instructionType: template.instructionType,
    parentAcknowledged: false,
  };
  const all = readPrompts();
  all.push(prompt);
  writePrompts(all);
  return prompt;
}

export async function getPromptsForSession(sessionId: string): Promise<ParentPrompt[]> {
  await delay(150);
  return readPrompts()
    .filter((p) => p.sessionId === sessionId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function acknowledgePrompt(promptId: string): Promise<void> {
  const all = readPrompts();
  const idx = all.findIndex((p) => p.id === promptId);
  if (idx >= 0) {
    all[idx] = { ...all[idx], parentAcknowledged: true };
    writePrompts(all);
  }
}
