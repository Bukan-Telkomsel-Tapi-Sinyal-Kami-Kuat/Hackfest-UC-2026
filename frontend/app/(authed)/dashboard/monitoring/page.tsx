"use client";

import { useEffect, useState } from "react";
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
import { Activity, Camera } from "lucide-react";
import dynamic from "next/dynamic";

const VisionTracker = dynamic(() => import("@/components/VisionTracker"), { ssr: false });

const OVERLOAD_CONFIG = {
  STABLE:   { label: "Stabil",             bg: "var(--color-kids-mint-light)",  text: "var(--color-kids-mint-mid)",  dot: "var(--color-focus-high)" },
  WARNING:  { label: "Peringatan",          bg: "var(--color-kids-sun-light)",   text: "var(--color-kids-sun-mid)",   dot: "var(--color-focus-medium)" },
  OVERLOAD: { label: "Kelebihan Stimulasi", bg: "var(--color-kids-pink-light)",  text: "var(--color-kids-pink-mid)",  dot: "var(--color-focus-low)" },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { timeStyle: "short" });
}

function FocusGauge({ score }: { score: number | null }) {
  const pct = score !== null ? Math.round(score * 100) : 0;
  const color = pct >= 65 ? "var(--color-focus-high)" : pct >= 38 ? "var(--color-focus-medium)" : "var(--color-focus-low)";
  const label = score === null ? "—" : pct >= 65 ? "Tinggi" : pct >= 38 ? "Sedang" : "Rendah";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-border)" strokeWidth="6" />
          <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${(pct / 100) * (2 * Math.PI * 32)} ${2 * Math.PI * 32}`}
            strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-extrabold" style={{ color }}>
            {score !== null ? `${pct}%` : "—"}
          </span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function MiniChart({ logs }: { logs: BehavioralLog[] }) {
  if (logs.length < 2) {
    return (
      <div className="flex items-center justify-center h-24 text-sm" style={{ color: "var(--color-text-muted)" }}>
        Belum cukup data
      </div>
    );
  }
  const recent = logs.slice(-24);
  return (
    <div className="flex items-end gap-0.5 h-24">
      {recent.map((log, i) => {
        const pct = Math.round(log.engagementScore * 100);
        const color = log.overloadStatus === "OVERLOAD"
          ? "var(--color-focus-low)"
          : log.overloadStatus === "WARNING"
          ? "var(--color-focus-medium)"
          : "var(--color-focus-high)";
        return (
          <div key={i} className="flex-1 flex items-end" title={`${pct}%`}>
            <div className="w-full rounded-t-sm" style={{ height: `${Math.max(pct, 4)}%`, background: color, opacity: 0.8 }} />
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

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [logs, setLogs] = useState<BehavioralLog[]>([]);
  const [prompts, setPrompts] = useState<ParentPrompt[]>([]);
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    if (!user) return;
    getChildren(user.id).then((list) => {
      setChildren(list);
      if (list.length > 0) setSelectedChildId(list[0].id);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedChildId) return;
    getSessions(selectedChildId).then((list) => {
      setSessions(list);
      setSelectedSessionId(list.length > 0 ? list[0].id : "");
    });
  }, [selectedChildId]);

  useEffect(() => {
    if (!selectedSessionId) { setLogs([]); setPrompts([]); return; }
    Promise.all([
      getLogsForSession(selectedSessionId),
      getPromptsForSession(selectedSessionId),
    ]).then(([l, p]) => { setLogs(l); setPrompts(p); });
  }, [selectedSessionId]);

  const displayPrompts = activeSession?.id === selectedSessionId ? livePrompts : prompts;
  const isActiveSession = !!(activeSession && activeSession.id === selectedSessionId);

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold mb-1 flex items-center gap-3">
          Monitoring
          <Activity className="w-6 h-6" style={{ color: "var(--color-kids-purple-mid)" }} />
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Pantau fokus anak secara real-time selama sesi belajar.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* Camera / AI Vision card */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: isActiveSession ? "var(--color-focus-high)" : "var(--color-text-subtle)" }} />
                <span className="text-sm font-bold">
                  {isActiveSession ? `Sesi Aktif · ${activeChild?.name}` : "AI Vision"}
                </span>
              </div>
              <Button variant={showTracker ? "outline" : "primary"} size="sm" onClick={() => setShowTracker((v) => !v)}>
                {showTracker ? "Tutup Kamera" : "Aktifkan AI Vision"}
              </Button>
            </div>

            {showTracker ? (
              <div className="aspect-video">
                <VisionTracker />
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3"
                style={{ background: "var(--color-surface-muted)" }}>
                <div
                  className="grid place-items-center w-16 h-16 rounded-2xl"
                  style={{ background: "var(--color-kids-purple-light)" }}
                >
                  <Camera className="w-8 h-8" style={{ color: "var(--color-kids-purple-mid)" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
                  Aktifkan kamera untuk tracking fokus real-time
                </p>
              </div>
            )}
          </Card>

          {/* Live status banner */}
          {isActiveSession ? (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] text-sm font-semibold"
              style={{ background: "var(--color-kids-mint-light)", color: "var(--color-kids-mint-mid)" }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              AI Vision aktif · data diperbarui dari halaman belajar
            </div>
          ) : (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] text-sm"
              style={{ background: "var(--color-surface-muted)", color: "var(--color-text-muted)" }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--color-text-subtle)" }} />
              Data AI Vision tersedia saat sesi belajar aktif
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 flex items-center gap-4">
              <FocusGauge score={biometric.engagementScore} />
              <div>
                <div className="text-xs font-bold mb-1" style={{ color: "var(--color-text-muted)" }}>Engagement</div>
                <div className="text-lg font-extrabold capitalize">{biometric.focusLevel}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-text-subtle)" }}>
                  {biometric.lastUpdatedAt ? "Diperbarui baru saja" : "Menunggu data..."}
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="text-xs font-bold mb-3" style={{ color: "var(--color-text-muted)" }}>Detail Biometrik</div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Arah Pandang", value: biometric.gazeDirection || "—" },
                  { label: "Keterbukaan Mata", value: biometric.eyeOpenness !== null ? biometric.eyeOpenness.toFixed(2) : "—" },
                  { label: "Skor Fokus", value: biometric.engagementScore !== null ? `${Math.round(biometric.engagementScore * 100)}%` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
                    <span className="font-bold capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Session chart in left column */}
          {selectedSessionId && (
            <Card className="p-5">
              <div className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                Grafik Fokus Sesi
                {isActiveSession && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "#EF4444" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                    Live
                  </span>
                )}
              </div>
              <MiniChart logs={isActiveSession ? [] : logs} />
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <Card className="p-4 flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Anak</label>
              <select value={selectedChildId} onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full h-10 px-3 rounded-[var(--radius-xl)] border text-sm focus:outline-none"
                style={{ borderColor: "var(--color-border)" }}>
                {children.length === 0 && <option value="">— Belum ada anak —</option>}
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({DISABILITY_LABELS[c.disabilityType]})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Sesi</label>
              <select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full h-10 px-3 rounded-[var(--radius-xl)] border text-sm focus:outline-none"
                style={{ borderColor: "var(--color-border)" }}>
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

          {selectedSessionId && (
            <Card className="p-4">
              <div className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                Grafik Fokus
                {isActiveSession && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "#EF4444" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                    Live
                  </span>
                )}
              </div>
              <MiniChart logs={isActiveSession ? [] : logs} />
            </Card>
          )}

          <div>
            <div className="text-xs font-bold mb-2" style={{ color: "var(--color-text-muted)" }}>
              Saran AI ({displayPrompts.length})
            </div>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {displayPrompts.length === 0 ? (
                <Card className="p-4 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Belum ada saran
                </Card>
              ) : (
                displayPrompts.map((p) => {
                  const cfg = OVERLOAD_CONFIG[
                    p.instructionType === "BREAK" || p.instructionType === "CALMING_MUSIC" ? "OVERLOAD" : "WARNING"
                  ];
                  return (
                    <Card key={p.id}
                      className={cn("p-4 transition-opacity border-l-4", p.parentAcknowledged && "opacity-50")}
                      style={{ borderLeftColor: cfg.dot }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
                          style={{ background: cfg.bg, color: cfg.text }}>
                          {INSTRUCTION_LABELS[p.instructionType]}
                        </span>
                        <span className="text-[10px] shrink-0" style={{ color: "var(--color-text-subtle)" }}>
                          {formatTime(p.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{p.aiMessage}</p>
                      {!p.parentAcknowledged ? (
                        <Button variant="secondary" size="sm" onClick={() => acknowledgePrompt(p.id)} className="text-xs">
                          Sudah Dilakukan ✓
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold" style={{ color: "var(--color-focus-high)" }}>✓ Dilakukan</span>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
