import type { Session, BehavioralLog, ParentPrompt, OverloadStatus } from "@/types/session";
import { apiFetch } from "./auth";
import { getSocket } from "@/lib/socket";

export async function startSession(childId: string, moduleSlug?: string): Promise<Session> {
  return apiFetch<Session>("/sessions/start", {
    method: "POST",
    body: JSON.stringify({ childId, moduleSlug }),
  });
}

export async function endSession(sessionId: string): Promise<Session | null> {
  return apiFetch<Session>(`/sessions/${sessionId}/end`, { method: "PATCH" });
}

export async function getSessions(childId: string): Promise<Session[]> {
  return apiFetch<Session[]>(`/children/${childId}`).then((child: any) =>
    (child.sessions ?? []).sort(
      (a: Session, b: Session) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  );
}

export async function getAllSessions(): Promise<Session[]> {
  return apiFetch<Session[]>("/sessions");
}

export async function addBehavioralLog(
  sessionId: string,
  childId: string,
  data: {
    engagementScore: number;
    gazeDirection: string;
    microExpression?: string;
    overloadStatus: OverloadStatus;
  }
): Promise<BehavioralLog> {
  const socket = getSocket();
  socket.emit("send_log", { sessionId, childId, ...data });
  return {
    id: `bl_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    sessionId,
    timestamp: new Date().toISOString(),
    ...data,
  } as BehavioralLog;
}

export async function getLogsForSession(_sessionId: string): Promise<BehavioralLog[]> {
  return [];
}

export async function generateAIPrompt(
  _sessionId: string,
  _overloadStatus: OverloadStatus
): Promise<ParentPrompt | null> {
  return null;
}

export async function getPromptsForSession(_sessionId: string): Promise<ParentPrompt[]> {
  return [];
}

export async function acknowledgePrompt(_promptId: string): Promise<void> {
  // Acknowledged locally via socket state; no REST endpoint needed
}
