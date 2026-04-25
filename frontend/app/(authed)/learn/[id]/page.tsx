"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, X, Check, Camera, CameraOff, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getModuleBySlug } from "@/lib/modules/data";
import { useSession } from "@/context/SessionContext";
import { useAuth } from "@/context/AuthContext";
import { useBiometric } from "@/context/BiometricContext";
import { getChildren } from "@/lib/api/children";
import { DISABILITY_LABELS } from "@/types/child";
import { INSTRUCTION_LABELS } from "@/types/session";
import type { Child } from "@/types/child";
import type { OverloadStatus } from "@/types/session";
import { cn } from "@/lib/utils/cn";

const VisionTracker = dynamic(() => import("@/components/VisionTracker"), { ssr: false });

const OVERLOAD_COLORS: Record<OverloadStatus, string> = {
  STABLE: "border-[var(--color-focus-high)] bg-green-50",
  WARNING: "border-[var(--color-focus-medium)] bg-yellow-50",
  OVERLOAD: "border-[var(--color-focus-low)] bg-red-50",
};

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const m = getModuleBySlug(id);
  const router = useRouter();
  const { user } = useAuth();
  const { activeSession, activeChild, prompts, begin, finish, logBehavior, acknowledgePrompt } = useSession();
  const { biometric } = useBiometric();
  const [step, setStep] = useState(0);
  const [showTracker, setShowTracker] = useState(false);

  // Child selector state
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [showSelector, setShowSelector] = useState(false);
  const [starting, setStarting] = useState(false);
  const sessionStarted = !!activeSession;

  // Load children on mount
  useEffect(() => {
    if (!user) return;
    getChildren(user.id).then((list) => {
      setChildren(list);
      if (list.length > 0) setSelectedChildId(list[0].id);
      // If no active session, show selector
      if (!activeSession) setShowSelector(true);
    });
  }, [user, activeSession]);

  // Auto-show AI Vision tracker when session starts
  useEffect(() => {
    setShowTracker(sessionStarted);
  }, [sessionStarted]);

  // Bridge real biometric data → session behavioral logs
  useEffect(() => {
    if (!sessionStarted || biometric.engagementScore === null) return;
    const status: OverloadStatus =
      biometric.engagementScore >= 0.65 ? "STABLE"
      : biometric.engagementScore >= 0.38 ? "WARNING"
      : "OVERLOAD";
    logBehavior(biometric.engagementScore, biometric.gazeDirection ?? "unknown", status);
  }, [biometric.lastUpdatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStartSession() {
    const child = children.find((c) => c.id === selectedChildId);
    if (!child) return;
    setStarting(true);
    await begin(child, id);
    setShowSelector(false);
    setStarting(false);
  }

  async function handleExit() {
    if (sessionStarted) await finish();
    router.push(`/modules/${m?.slug ?? ""}`);
  }

  function handleFinish() {
    // Navigate to complete page; it will call finish() on mount
    router.push(`/learn/${id}/complete`);
  }

  if (!m) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-3">Modul tidak ditemukan</h1>
          <Button variant="primary" onClick={() => router.push("/modules")}>
            Kembali ke Katalog
          </Button>
        </div>
      </div>
    );
  }

  const total = m.steps.length;
  const current = m.steps[step];
  const progress = ((step + 1) / total) * 100;
  const unacknowledgedPrompts = prompts.filter((p) => !p.parentAcknowledged);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-border)] px-6 h-16 flex items-center gap-4">
        <button
          onClick={handleExit}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-blue-700)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Keluar
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold truncate">{m.title}</span>
            <div className="flex items-center gap-3 flex-shrink-0">
              {activeChild && (
                <span className="text-[var(--color-blue-700)] font-medium">
                  {activeChild.name}
                </span>
              )}
              <span className="text-[var(--color-text-muted)]">
                Langkah {step + 1} dari {total}
              </span>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-blue-600)]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 grid place-items-center px-6 py-12 relative">
        <Card className="w-full max-w-2xl p-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-blue-700)] mb-3">
                Langkah {step + 1}
              </div>
              <h2 className="text-3xl font-bold mb-4">{current.title}</h2>
              <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">{current.body}</p>
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* AI Prompt toast stack */}
        <AnimatePresence>
          {unacknowledgedPrompts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="fixed bottom-24 right-6 w-80 flex flex-col gap-2 z-50"
            >
              {unacknowledgedPrompts.slice(0, 2).map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-[var(--radius-xl)] border-l-4 bg-white shadow-[var(--shadow-lg)] p-4",
                    OVERLOAD_COLORS[
                      p.instructionType === "BREAK" || p.instructionType === "CALMING_MUSIC"
                        ? "OVERLOAD"
                        : "WARNING"
                    ]
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Saran AI · {INSTRUCTION_LABELS[p.instructionType]}
                    </span>
                    <button
                      onClick={() => acknowledgePrompt(p.id)}
                      className="text-[var(--color-text-subtle)] hover:text-[var(--color-text-primary)]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-[var(--color-text-primary)] mb-3">{p.aiMessage}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => acknowledgePrompt(p.id)}
                    className="text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Sudah Dilakukan
                  </Button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating VisionTracker — only when session is active */}
      <AnimatePresence>
        {sessionStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 left-5 z-40 flex flex-col"
            style={{ width: showTracker ? 240 : "auto" }}
          >
            {showTracker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-t-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-lg)]"
                style={{ background: "#0f172a" }}
              >
                {/* Engagement bar at top */}
                <div
                  className="flex items-center justify-between px-3 py-1.5"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-white/70">AI Vision</span>
                  </div>
                  {biometric.engagementScore !== null && (
                    <span
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          biometric.engagementScore >= 0.65
                            ? "var(--color-focus-high)"
                            : biometric.engagementScore >= 0.38
                            ? "var(--color-focus-medium)"
                            : "var(--color-focus-low)",
                        color: "white",
                      }}
                    >
                      Fokus {Math.round(biometric.engagementScore * 100)}%
                    </span>
                  )}
                </div>
                {/* Camera feed */}
                <div style={{ height: 135 }}>
                  <VisionTracker />
                </div>
              </motion.div>
            )}

            {/* Toggle button */}
            <button
              onClick={() => setShowTracker((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-b-[var(--radius-lg)] text-xs font-bold shadow-[var(--shadow-md)] transition-colors"
              style={{
                background: showTracker ? "#1e293b" : "var(--color-kids-purple-mid)",
                color: "white",
                borderTopLeftRadius: showTracker ? 0 : undefined,
                borderTopRightRadius: showTracker ? 0 : undefined,
                borderRadius: showTracker ? "0 0 var(--radius-lg) var(--radius-lg)" : "var(--radius-lg)",
              }}
            >
              {showTracker ? (
                <><CameraOff className="w-3.5 h-3.5" /> Tutup Kamera</>
              ) : (
                <><Camera className="w-3.5 h-3.5" /> AI Vision</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus level indicator pill — shown when tracker is on */}
      <AnimatePresence>
        {sessionStarted && showTracker && biometric.focusLevel && biometric.focusLevel !== "unknown" && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="fixed bottom-24 left-[260px] z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-[var(--shadow-sm)]"
            style={{
              background: "white",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <Eye className="w-3.5 h-3.5" style={{ color: "var(--color-kids-purple-mid)" }} />
            <span className="capitalize">{biometric.gazeDirection ?? "—"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer nav */}
      <footer className="bg-white border-t border-[var(--color-border)] px-6 h-20 flex items-center justify-between">
        <Button
          variant="outline"
          size="md"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ChevronLeft className="w-4 h-4" />
          Sebelumnya
        </Button>
        {step === total - 1 ? (
          <Button variant="primary" size="md" onClick={sessionStarted ? handleFinish : handleExit}>
            Selesai 🎉
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </footer>

      {/* Child selector overlay */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center px-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="w-full max-w-md p-7">
                <h2 className="text-xl font-bold mb-1">Pilih Profil Anak</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-5">
                  Pilih anak yang akan belajar modul "{m.title}" hari ini.
                </p>

                {children.length === 0 ? (
                  <div className="text-sm text-[var(--color-text-muted)] mb-5">
                    Belum ada profil anak.{" "}
                    <button
                      onClick={() => router.push("/dashboard/children/new")}
                      className="text-[var(--color-blue-700)] underline"
                    >
                      Tambah sekarang
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mb-5">
                    {children.map((child) => (
                      <label
                        key={child.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border cursor-pointer transition-colors",
                          selectedChildId === child.id
                            ? "border-[var(--color-blue-500)] bg-[var(--color-blue-50)]"
                            : "border-[var(--color-border)] hover:border-[var(--color-blue-200)]"
                        )}
                      >
                        <input
                          type="radio"
                          name="child"
                          value={child.id}
                          checked={selectedChildId === child.id}
                          onChange={() => setSelectedChildId(child.id)}
                          className="accent-[var(--color-blue-600)]"
                        />
                        <div>
                          <div className="font-semibold text-sm">{child.name}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {DISABILITY_LABELS[child.disabilityType]}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => router.push(`/modules/${m.slug}`)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleStartSession}
                    loading={starting}
                    disabled={!selectedChildId || children.length === 0}
                    className="flex-1"
                  >
                    Mulai Sesi
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
