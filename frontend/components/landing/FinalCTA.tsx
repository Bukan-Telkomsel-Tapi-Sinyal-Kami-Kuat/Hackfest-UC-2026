"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Rocket, Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useAuthModal } from "@/context/AuthModalContext";

const FLOATERS = [
  { id: "f1", shape: "star", style: { top: "12%", left: "8%", width: 32, height: 32 }, color: "var(--color-kids-sun)", delay: 0 },
  { id: "f2", shape: "circle", style: { bottom: "18%", left: "14%", width: 20, height: 20 }, color: "var(--color-kids-pink)", delay: 0.6 },
  { id: "f3", shape: "circle", style: { top: "20%", right: "10%", width: 28, height: 28 }, color: "var(--color-kids-sky)", delay: 1.1 },
  { id: "f4", shape: "star", style: { bottom: "14%", right: "8%", width: 24, height: 24 }, color: "var(--color-kids-purple)", delay: 0.4 },
  { id: "f5", shape: "plus", style: { top: "55%", left: "6%", width: 22, height: 22 }, color: "var(--color-kids-mint-mid)", delay: 0.9 },
  { id: "f6", shape: "circle", style: { top: "8%", right: "28%", width: 14, height: 14 }, color: "var(--color-kids-peach-mid)", delay: 0.3 },
];

export function FinalCTA() {
  const { openAuthModal } = useAuthModal();

  return (
    <section id="tentang" className="relative px-6 pb-28 pt-4 overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        {/* Main card */}
        <div
          className="relative rounded-[var(--radius-2xl)] overflow-hidden px-8 py-16 md:px-16 md:py-20 text-center"
          style={{
            background: "linear-gradient(135deg, var(--color-kids-purple-light) 0%, var(--color-kids-mint-light) 50%, var(--color-kids-sun-light) 100%)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Blob decorations inside card */}
          <div
            className="absolute top-0 left-0 w-72 h-72 -z-0 blur-3xl opacity-50 blob-1 pointer-events-none"
            style={{ background: "var(--color-kids-purple)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-72 h-72 -z-0 blur-3xl opacity-40 blob-2 pointer-events-none"
            style={{ background: "var(--color-kids-mint)" }}
          />

          {/* Floating shapes */}
          {FLOATERS.map((f) =>
            f.shape === "star" ? (
              <svg
                key={f.id}
                className="absolute animate-float pointer-events-none"
                style={{ ...f.style, animationDelay: `${f.delay}s` }}
                viewBox="0 0 32 32"
              >
                <polygon
                  points="16,1 19.5,11 30,11 21.5,17.5 25,28 16,22 7,28 10.5,17.5 2,11 12.5,11"
                  fill={f.color}
                />
              </svg>
            ) : f.shape === "plus" ? (
              <svg
                key={f.id}
                className="absolute animate-wiggle pointer-events-none"
                style={{ ...f.style, animationDelay: `${f.delay}s` }}
                viewBox="0 0 22 22"
              >
                <path d="M11 2v18M2 11h18" stroke={f.color} strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <div
                key={f.id}
                className="absolute rounded-full animate-float pointer-events-none"
                style={{ ...f.style, background: f.color, animationDelay: `${f.delay}s` }}
              />
            )
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            {/* Icon badge */}
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-6 shadow-[var(--shadow-md)]"
              style={{ background: "white" }}
            >
              <Rocket size={30} weight="duotone" style={{ color: "var(--color-kids-purple-mid)" }} />
            </div>

            <h2
              className="text-3xl md:text-5xl font-extrabold mb-5 max-w-2xl mx-auto leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Mulai perjalanan belajar yang{" "}
              <span style={{ color: "var(--color-kids-purple-dark)" }}>lebih menyenangkan</span>{" "}
              hari ini.
            </h2>

            <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Akses ke katalog modul gratis. Daftar hanya saat Anda siap mulai sesi belajar dengan kamera AI.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => openAuthModal({ mode: "register" })}
                >
                  Daftar Gratis Sekarang
                  <ArrowRight size={16} weight="bold" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link href="/modules">
                  <Button variant="outline" size="lg">
                    Jelajahi Modul
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-1.5 mt-8">
              {[0, 0.15, 0.3].map((d, i) => (
                <Star key={i} size={14} weight="fill" style={{ color: "var(--color-kids-sun-mid)", opacity: 1 - d }} />
              ))}
              <span className="text-xs font-semibold ml-1" style={{ color: "var(--color-text-muted)" }}>
                Dipercaya ratusan orang tua di Indonesia
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
