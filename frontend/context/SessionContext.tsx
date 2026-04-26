"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, ParentPrompt, OverloadStatus } from "@/types/session";
import type { Child } from "@/types/child";
import {
  startSession,
  endSession,
  addBehavioralLog,
  acknowledgePrompt as persistAcknowledge,
} from "@/lib/api/sessions";
import { getSocket, disconnectSocket } from "@/lib/socket";

interface AiAnswer {
  answer: string;
  context_used: string[];
  timestamp: string;
}

interface GeneratedModule {
  title: string;
  explanation: string;
  examples: string[];
  exercise: { question: string; answer: string }[];
  accessibility: { tunanetra: string; tunarungu: string; disleksia: string };
}

interface SessionContextValue {
  activeSession: Session | null;
  activeChild: Child | null;
  prompts: ParentPrompt[];
  lastAnswer: AiAnswer | null;
  lastModule: GeneratedModule | null;
  begin: (child: Child, moduleSlug?: string) => Promise<Session>;
  finish: () => Promise<void>;
  logBehavior: (
    engagementScore: number,
    gazeDirection: string,
    overloadStatus: OverloadStatus
  ) => Promise<void>;
  acknowledgePrompt: (promptId: string) => void;
  askQuestion: (question: string, grade?: number, subject?: string) => void;
  requestModule: (subject: string, topic: string, grade: number, difficulty: number) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [prompts, setPrompts] = useState<ParentPrompt[]>([]);
  const [lastAnswer, setLastAnswer] = useState<AiAnswer | null>(null);
  const [lastModule, setLastModule] = useState<GeneratedModule | null>(null);
  const lastStatusRef = useRef<OverloadStatus>("STABLE");
  const lastPromptTimeRef = useRef<number>(0);

  useEffect(() => {
    const socket = getSocket();

    socket.on("ai_feedback", (data: ParentPrompt) => {
      setPrompts((prev) => [data, ...prev]);
    });

    socket.on("ai_answer", (data: AiAnswer) => {
      setLastAnswer(data);
    });

    socket.on("module_ready", (data: { module: GeneratedModule | null }) => {
      if (data.module) setLastModule(data.module);
    });

    return () => {
      socket.off("ai_feedback");
      socket.off("ai_answer");
      socket.off("module_ready");
    };
  }, []);

  const begin = useCallback(async (child: Child, moduleSlug?: string) => {
    const session = await startSession(child.id, moduleSlug);
    setActiveSession(session);
    setActiveChild(child);
    setPrompts([]);
    setLastAnswer(null);
    setLastModule(null);
    lastStatusRef.current = "STABLE";
    lastPromptTimeRef.current = 0;
    return session;
  }, []);

  const finish = useCallback(async () => {
    if (!activeSession) return;
    await endSession(activeSession.id);
    setActiveSession(null);
    setActiveChild(null);
    setPrompts([]);
  }, [activeSession]);

  const logBehavior = useCallback(
    async (
      engagementScore: number,
      gazeDirection: string,
      overloadStatus: OverloadStatus
    ) => {
      if (!activeSession) return;
      await addBehavioralLog(activeSession.id, { engagementScore, gazeDirection, overloadStatus });

      const now = Date.now();
      const isEscalating =
        (overloadStatus === "OVERLOAD" || overloadStatus === "WARNING") &&
        overloadStatus !== lastStatusRef.current &&
        now - lastPromptTimeRef.current > 30_000;

      if (isEscalating) {
        lastStatusRef.current = overloadStatus;
        lastPromptTimeRef.current = now;
      } else if (overloadStatus === "STABLE") {
        lastStatusRef.current = "STABLE";
      }
    },
    [activeSession]
  );

  const acknowledgePrompt = useCallback((promptId: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === promptId ? { ...p, parentAcknowledged: true } : p))
    );
    persistAcknowledge(promptId);
  }, []);

  const askQuestion = useCallback(
    (question: string, grade?: number, subject?: string) => {
      const socket = getSocket();
      socket.emit("ask_question", {
        question,
        grade,
        subject,
        emotion_state: "engaged",
      });
    },
    []
  );

  const requestModule = useCallback(
    (subject: string, topic: string, grade: number, difficulty: number) => {
      const socket = getSocket();
      socket.emit("request_module", { subject, topic, grade, difficulty, emotion_state: "engaged" });
    },
    []
  );

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        activeChild,
        prompts,
        lastAnswer,
        lastModule,
        begin,
        finish,
        logBehavior,
        acknowledgePrompt,
        askQuestion,
        requestModule,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
