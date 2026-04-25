"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/context/SessionContext";
import { motion } from "framer-motion";

export default function SessionCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { activeSession, finish } = useSession();
  const [engagement, setEngagement] = useState<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setEngagement(activeSession?.averageEngagement ?? null);
    if (activeSession) finish();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = engagement !== null ? Math.round(engagement * 100) : null;
  const stars = pct !== null ? (pct >= 80 ? 3 : pct >= 50 ? 2 : 1) : 1;
  const message =
    pct === null ? "Sesi selesai! Anak sudah belajar hari ini."
    : pct >= 80 ? "Luar biasa! Anak sangat fokus hari ini! 🎉"
    : pct >= 50 ? "Kerja bagus! Anak cukup fokus hari ini. 👍"
    : "Sesi selesai. Coba lagi besok dengan semangat baru! 💪";

  const focusColor =
    pct === null ? "var(--color-text-muted)"
    : pct >= 65 ? "var(--color-focus-high)"
    : pct >= 38 ? "var(--color-focus-medium)"
    : "var(--color-focus-low)";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg, var(--color-kids-purple-light), var(--color-kids-mint-light), var(--color-kids-sun-light))" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[var(--radius-2xl)] p-10 text-center shadow-[var(--shadow-lg)]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-7xl mb-6"
          >
            🎊
          </motion.div>

          <h1 className="text-3xl font-extrabold mb-2">Sesi Selesai!</h1>

          {/* Stars */}
          <div className="flex items-center justify-center gap-2 my-5">
            {[1, 2, 3].map((s) => (
              <motion.span
                key={s}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: s <= stars ? 1 : 0.5, rotate: 0 }}
                transition={{ delay: 0.3 + s * 0.15, type: "spring", stiffness: 300 }}
                className="text-4xl"
                style={{ opacity: s <= stars ? 1 : 0.3 }}
              >
                ⭐
              </motion.span>
            ))}
          </div>

          {/* Focus ring */}
          {pct !== null && (
            <div className="flex flex-col items-center mb-5">
              <div className="relative w-24 h-24 mb-2">
                <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="38" fill="none" stroke="var(--color-border)" strokeWidth="7" />
                  <circle cx="48" cy="48" r="38" fill="none" stroke={focusColor} strokeWidth="7"
                    strokeDasharray={`${(pct / 100) * (2 * Math.PI * 38)} ${2 * Math.PI * 38}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-extrabold" style={{ color: focusColor }}>{pct}%</span>
                </div>
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Rata-rata Fokus</span>
            </div>
          )}

          <p className="text-base mb-8" style={{ color: "var(--color-text-muted)" }}>{message}</p>

          <div className="flex flex-col gap-3">
            <Link href="/modules">
              <Button variant="primary" size="lg" className="w-full">
                Modul Berikutnya 🚀
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="md" className="w-full">
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
