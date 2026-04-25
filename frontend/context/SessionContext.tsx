"use client";

import {
  createContext,
  useCallback,
  useContext,
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
  generateAIPrompt,
  acknowledgePrompt as persistAcknowledge,
} from "@/lib/api/sessions";

interface SessionContextValue {
  activeSession: Session | null;
  activeChild: Child | null;
  prompts: ParentPrompt[];
  begin: (child: Child, moduleSlug?: string) => Promise<Session>;
  finish: () => Promise<void>;
  logBehavior: (
    engagementScore: number,
    gazeDirection: string,
    overloadStatus: OverloadStatus
  ) => Promise<void>;
  acknowledgePrompt: (promptId: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [prompts, setPrompts] = useState<ParentPrompt[]>([]);
  const lastStatusRef = useRef<OverloadStatus>("STABLE");
  const lastPromptTimeRef = useRef<number>(0);

  const begin = useCallback(async (child: Child, moduleSlug?: string) => {
    const session = await startSession(child.id, moduleSlug);
    setActiveSession(session);
    setActiveChild(child);
    setPrompts([]);
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
      await addBehavioralLog(activeSession.id, {
        engagementScore,
        gazeDirection,
        overloadStatus,
      });

      // Trigger AI prompt on transition to WARNING/OVERLOAD, at most once per 30s
      const now = Date.now();
      const isEscalating =
        (overloadStatus === "OVERLOAD" || overloadStatus === "WARNING") &&
        overloadStatus !== lastStatusRef.current &&
        now - lastPromptTimeRef.current > 30_000;

      if (isEscalating) {
        lastStatusRef.current = overloadStatus;
        lastPromptTimeRef.current = now;
        const prompt = await generateAIPrompt(activeSession.id, overloadStatus);
        if (prompt) setPrompts((prev) => [prompt, ...prev]);
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

  return (
    <SessionContext.Provider
      value={{ activeSession, activeChild, prompts, begin, finish, logBehavior, acknowledgePrompt }}
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
