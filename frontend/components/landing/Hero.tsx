"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkle, ArrowRight, ShieldCheck, Star, Brain } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useAuthModal } from "@/context/AuthModalContext";

// Parallax layers — layer 1=far/slow, 3=close/fast
const BLOBS = [
  { id: "b1", style: { top: "6%", left: "3%", width: 260, height: 240 }, color: "var(--color-kids-purple-light)", shape: "blob-1", blur: true },
  { id: "b2", style: { bottom: "8%", right: "2%", width: 320, height: 290 }, color: "var(--color-kids-mint-light)", shape: "blob-2", blur: true },
  { id: "b3", style: { top: "52%", left: "1%", width: 150, height: 150 }, color: "var(--color-kids-sun-light)", shape: "blob-1", blur: true },
  { id: "b4", style: { top: "10%", right: "8%", width: 120, height: 100 }, color: "var(--color-kids-pink-light)", shape: "blob-2", blur: false },
];

const MID_SHAPES = [
  { id: "s1", style: { top: "16%", right: "14%", width: 44, height: 44 }, color: "var(--color-kids-sun)", round: true },
  { id: "s2", style: { bottom: "28%", left: "11%", width: 30, height: 30 }, color: "var(--color-kids-pink)", round: true },
  { id: "s3", style: { top: "38%", right: "7%", width: 18, height: 18 }, color: "var(--color-kids-sky)", round: true },
  { id: "s4", style: { bottom: "18%", left: "22%", width: 22, height: 22 }, color: "var(--color-kids-peach)", round: true },
];

const TRUST_BADGES = [
  { Icon: ShieldCheck, label: "100% Aman & Privat" },
  { Icon: Star, label: "Metode Tervalidasi" },
  { Icon: Brain, label: "Didukung AI" },
];

const LAYER_FACTOR = [0.012, 0.026, 0.046];

export function Hero() {
  const { openAuthModal } = useAuthModal();
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  useEffect(() => {
    let raf = 0;
    let tx = 0, ty = 0;
    const cx = [0, 0, 0], cy = [0, 0, 0];

    function onMove(e: MouseEvent) {
      tx = e.clientX - window.innerWidth / 2;
      ty = e.clientY - window.innerHeight / 2;
    }

    function tick() {
      layerRefs.forEach((ref, i) => {
        cx[i] += (tx * LAYER_FACTOR[i] - cx[i]) * 0.08;
        cy[i] += (ty * LAYER_FACTOR[i] - cy[i]) * 0.08;
        if (ref.current) {
          ref.current.style.transform = `translate3d(${cx[i]}px,${cy[i]}px,0)`;
        }
      });
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section ref={containerRef} className="relative min-h-[93vh] flex items-center justify-center px-6 overflow-hidden">

      {/* Layer 1 — background blobs */}
      <div ref={layerRefs[0]} className="absolute inset-0 pointer-events-none will-change-transform">
        {BLOBS.map((b) => (
          <div
            key={b.id}
            className={`absolute ${b.shape}${b.blur ? " blur-2xl opacity-75" : " opacity-60"}`}
            style={{ ...b.style, background: b.color }}
          />
        ))}
      </div>

      {/* Layer 2 — mid floating shapes + SVG decorations */}
      <div ref={layerRefs[1]} className="absolute inset-0 pointer-events-none will-change-transform">
        {MID_SHAPES.map((s, i) => (
          <div
            key={s.id}
            className="absolute rounded-full animate-float"
            style={{ ...s.style, background: s.color, animationDelay: `${i * 0.6}s` }}
          />
        ))}
        {/* Wavy squiggle top-left */}
        <svg className="absolute top-[28%] left-[7%] opacity-50 animate-wiggle" width="70" height="28" viewBox="0 0 70 28" fill="none">
          <path d="M2 14 Q12 2 24 14 Q36 26 48 14 Q60 2 68 14" stroke="var(--color-kids-purple-mid)" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
        {/* Star burst right */}
        <svg className="absolute top-[20%] right-[22%] animate-float opacity-70" width="40" height="40" viewBox="0 0 40 40" style={{ animationDelay: "1s" }}>
          <polygon points="20,2 24,15 38,15 27,23 31,36 20,29 9,36 13,23 2,15 16,15" fill="var(--color-kids-sun)" />
        </svg>
        {/* Plus bottom-right */}
        <svg className="absolute bottom-[22%] right-[28%] opacity-60 animate-wiggle" width="28" height="28" viewBox="0 0 28 28" style={{ animationDelay: "0.7s" }}>
          <path d="M14 3v22M3 14h22" stroke="var(--color-kids-pink-mid)" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
        {/* Small star top-right */}
        <svg className="absolute top-[55%] right-[5%] animate-float opacity-60" width="24" height="24" viewBox="0 0 24 24" style={{ animationDelay: "1.5s" }}>
          <polygon points="12,1 14.9,8.6 23,9.3 17,14.7 19,22 12,17.8 5,22 7,14.7 1,9.3 9.1,8.6" fill="var(--color-kids-purple)" />
        </svg>
      </div>

      {/* Layer 3 — close tiny dots */}
      <div ref={layerRefs[2]} className="absolute inset-0 pointer-events-none will-change-transform">
        <div className="absolute rounded-full" style={{ top: "22%", left: "18%", width: 12, height: 12, background: "var(--color-kids-purple)" }} />
        <div className="absolute rounded-full" style={{ bottom: "32%", right: "17%", width: 9, height: 9, background: "var(--color-kids-pink-mid)" }} />
        <div className="absolute rounded-full" style={{ top: "65%", left: "30%", width: 7, height: 7, background: "var(--color-kids-mint-mid)" }} />
        <div className="absolute rounded-full" style={{ top: "12%", right: "35%", width: 10, height: 10, background: "var(--color-kids-sun-mid)" }} />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative max-w-3xl text-center z-10"
      >
        {/* Pill badge */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 shadow-[var(--shadow-sm)]"
          style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-dark)" }}
        >
          <Sparkle size={13} weight="fill" />
          Platform Belajar Inklusif Berbasis AI
        </motion.div>

        {/* Heading */}
        <h1 className="text-5xl md:text-[4.25rem] font-extrabold leading-[1.06] mb-6" style={{ color: "var(--color-text-primary)" }}>
          Belajar adaptif,{" "}
          <span className="relative whitespace-nowrap">
            <span style={{ color: "var(--color-kids-purple-dark)" }}>untuk setiap anak.</span>
            {/* Wavy underline */}
            <svg
              aria-hidden="true"
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 320 14"
              preserveAspectRatio="none"
              height="14"
              fill="none"
            >
              <path
                d="M2 7 Q27 1 53 7 Q80 13 107 7 Q133 1 160 7 Q187 13 213 7 Q240 1 267 7 Q293 13 318 7"
                stroke="var(--color-kids-sun-mid)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          VISEA membantu orang tua mendampingi anak berkebutuhan khusus dengan modul belajar yang
          menyesuaikan ekspresi dan fokus anak secara{" "}
          <span className="font-bold" style={{ color: "var(--color-kids-purple-dark)" }}>real-time</span>.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button variant="primary" size="lg" onClick={() => openAuthModal({ mode: "register" })}>
              Mulai Gratis Sekarang
              <ArrowRight size={16} weight="bold" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/modules">
              <Button variant="outline" size="lg">Lihat Modul</Button>
            </Link>
          </motion.div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {TRUST_BADGES.map(({ Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "white",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Icon size={13} weight="duotone" style={{ color: "var(--color-kids-purple-mid)" }} />
              {label}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
