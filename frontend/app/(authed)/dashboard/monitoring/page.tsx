"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { useBiometric } from "@/context/BiometricContext";
import { getChildren } from "@/lib/api/children";
import { getSessions, getLogsForSession, getPromptsForSession } from "@/lib/api/sessions";
import { DISABILITY_LABELS } from "@/types/child";
import { INSTRUCTION_LABELS } from "@/types/session";
import type { Child } from "@/types/child";
import type { Session, BehavioralLog, ParentPrompt } from "@/types/session";
import { cn } from "@/lib/utils/cn";

const OVERLOAD_CONFIG = {
  STABLE: { label: "Stabil", className: "bg-[var(--color-focus-high)] text-white" },
  WARNING: { label: "Peringatan", className: "bg-[var(--color-focus-medium)] text-white" },
  OVERLOAD: { label: "Kelebihan Stimulasi", className: "bg-[var(--color-focus-low)] text-white" },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { timeStyle: "short" });
}

function MiniChart({ logs }: { logs: BehavioralLog[] }) {
  if (logs.length < 2) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-[var(--color-text-muted)]">
        Belum cukup data untuk grafik
      </div>
    );
  }
  const recent = logs.slice(-20);
  const max = 1;
  return (
    <div className="flex items-end gap-0.5 h-24">
      {recent.map((log, i) => {
        const pct = Math.round((log.engagementScore / max) * 100);
        const color =
          log.overloadStatus === "OVERLOAD"
            ? "bg-[var(--color-focus-low)]"
            : log.overloadStatus === "WARNING"
            ? "bg-[var(--color-focus-medium)]"
            : "bg-[var(--color-focus-high)]";
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${pct}%`}>
            <div
              className={cn("w-full rounded-t-sm", color)}
              style={{ height: `${pct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function MonitoringPage() {
  const { user } = useAuth();
  const { activeSession, activeChild, prompts: livePrompts, acknowledgePrompt } = useSession();
  const { biometric } = useBiometric();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [denied, setDenied] = useState(false);

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [logs, setLogs] = useState<BehavioralLog[]>([]);
  const [prompts, setPrompts] = useState<ParentPrompt[]>([]);

  // Start webcam
  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => { if (!cancelled) setDenied(true); });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Load children
  useEffect(() => {
    if (!user) return;
    getChildren(user.id).then((list) => {
      setChildren(list);
      if (list.length > 0) setSelectedChildId(list[0].id);
    });
  }, [user]);

  // Load sessions when child changes
  useEffect(() => {
    if (!selectedChildId) return;
    getSessions(selectedChildId).then((list) => {
      setSessions(list);
      if (list.length > 0) setSelectedSessionId(list[0].id);
      else setSelectedSessionId("");
    });
  }, [selectedChildId]);

  // Load logs and prompts when session changes
  useEffect(() => {
    if (!selectedSessionId) { setLogs([]); setPrompts([]); return; }
    Promise.all([
      getLogsForSession(selectedSessionId),
      getPromptsForSession(selectedSessionId),
    ]).then(([l, p]) => {
      setLogs(l);
      setPrompts(p);
    });
  }, [selectedSessionId]);

  // Merge live prompts for active session
  const displayPrompts =
    activeSession?.id === selectedSessionId
      ? livePrompts
      : prompts;

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const isActiveSession = activeSession && activeSession.id === selectedSessionId;

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Monitoring</h1>
        <p className="text-[var(--color-text-muted)]">
          Pantau fokus anak secara real-time selama sesi belajar.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Left: webcam + live stats */}
        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-slate-900 relative">
              {denied ? (
                <div className="absolute inset-0 grid place-items-center text-white/80 text-sm">
                  Izin kamera ditolak.
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}
              {activeSession && activeChild && (
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                  Sesi aktif: {activeChild.name}
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Tingkat Fokus</div>
              <div className="text-xl font-bold capitalize">{biometric.focusLevel}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Arah Pandang</div>
              <div className="text-xl font-bold">{biometric.gazeDirection || "—"}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Eye Openness</div>
              <div className="text-xl font-bold">
                {biometric.eyeOpenness !== null ? biometric.eyeOpenness.toFixed(2) : "—"}
              </div>
            </Card>
          </div>
        </div>

        {/* Right: child/session selector + logs + prompts */}
        <div className="flex flex-col gap-4">
          {/* Selectors */}
          <Card className="p-4 flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Anak</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm bg-white focus:outline-none focus:border-[var(--color-blue-500)]"
              >
                {children.length === 0 && <option value="">— Belum ada anak —</option>}
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({DISABILITY_LABELS[c.disabilityType]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Sesi</label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm bg-white focus:outline-none focus:border-[var(--color-blue-500)]"
              >
                {sessions.length === 0 && <option value="">— Belum ada sesi —</option>}
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.startTime).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                    {!s.endTime ? " (aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Engagement chart */}
          {selectedSessionId && (
            <Card className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                Grafik Fokus {isActiveSession ? "(Live)" : ""}
              </div>
              <MiniChart logs={isActiveSession ? [] : logs} />
            </Card>
          )}

          {/* AI Prompts */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Saran AI ({displayPrompts.length})
            </div>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {displayPrompts.length === 0 ? (
                <Card className="p-4 text-center text-sm text-[var(--color-text-muted)]">
                  Belum ada saran
                </Card>
              ) : (
                displayPrompts.map((p) => (
                  <Card
                    key={p.id}
                    className={cn(
                      "p-4 transition-opacity",
                      p.parentAcknowledged && "opacity-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5",
                          OVERLOAD_CONFIG[
                            p.instructionType === "BREAK" || p.instructionType === "CALMING_MUSIC"
                              ? "OVERLOAD"
                              : "WARNING"
                          ].className
                        )}
                      >
                        {INSTRUCTION_LABELS[p.instructionType]}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-subtle)] flex-shrink-0">
                        {formatTime(p.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-primary)] mb-2">{p.aiMessage}</p>
                    {!p.parentAcknowledged && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => acknowledgePrompt(p.id)}
                        className="text-xs"
                      >
                        Sudah Dilakukan
                      </Button>
                    )}
                    {p.parentAcknowledged && (
                      <span className="text-xs text-[var(--color-focus-high)]">✓ Dilakukan</span>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
