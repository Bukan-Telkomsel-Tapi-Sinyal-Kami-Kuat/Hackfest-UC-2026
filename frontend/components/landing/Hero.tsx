"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useAuthModal } from "@/context/AuthModalContext";

export function Hero() {
  const blobRef = useRef<HTMLDivElement>(null);
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    let raf = 0;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };

    function onMove(e: MouseEvent) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      target = { x: (e.clientX - cx) / 30, y: (e.clientY - cy) / 30 };
    }

    function tick() {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center px-6 overflow-hidden">
      <div
        ref={blobRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full blur-[120px] opacity-70 -z-10"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, var(--color-blue-200), transparent 60%), radial-gradient(circle at 70% 70%, var(--color-blue-100), transparent 60%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative max-w-3xl text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-blue-50)] text-[var(--color-blue-700)] text-xs font-semibold mb-6">
          <Sparkle size={14} weight="duotone" />
          Pendidikan Inklusif Berbasis AI
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] leading-[1.1] mb-6">
          Belajar adaptif,
          <br />
          <span className="text-[var(--color-blue-600)]">untuk setiap anak.</span>
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto mb-10">
          VISEA membantu orang tua mendampingi anak berkebutuhan khusus dengan modul belajar yang
          menyesuaikan ekspresi dan fokus anak secara real-time.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/modules">
            <Button variant="primary" size="lg">
              Lihat Modul
              <ArrowRight size={16} weight="bold" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => openAuthModal({ mode: "register" })}>
            Daftar Gratis
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
