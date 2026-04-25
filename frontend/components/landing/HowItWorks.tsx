"use client";

import { motion } from "framer-motion";
import { Camera, BookOpen, ChartLineUp } from "@phosphor-icons/react";

const STEPS = [
  {
    Icon: Camera,
    step: "01",
    title: "Kamera Memantau Fokus",
    body: "Computer Vision membaca pose, arah mata, dan ekspresi anak secara real-time tanpa data dikirim ke server.",
    color: "var(--color-kids-purple-light)",
    accent: "var(--color-kids-purple-mid)",
    dark: "var(--color-kids-purple-dark)",
    bg: "var(--color-kids-purple)",
  },
  {
    Icon: BookOpen,
    step: "02",
    title: "Modul Menyesuaikan",
    body: "Konten belajar otomatis disesuaikan saat anak terlihat lelah, terdistraksi, atau kehilangan fokus.",
    color: "var(--color-kids-mint-light)",
    accent: "var(--color-kids-mint-mid)",
    dark: "var(--color-kids-mint-mid)",
    bg: "var(--color-kids-mint)",
  },
  {
    Icon: ChartLineUp,
    step: "03",
    title: "Orang Tua Mendapat Panduan",
    body: "Sistem AI memberi saran konkret: ganti media, beri jeda, atau ulangi konsep — tepat saat dibutuhkan.",
    color: "var(--color-kids-sun-light)",
    accent: "var(--color-kids-sun-mid)",
    dark: "var(--color-kids-sun-mid)",
    bg: "var(--color-kids-sun)",
  },
];

function handleTilt(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  el.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateZ(6px)`;
  el.style.transition = "transform 0.05s ease";
  const shine = el.querySelector<HTMLElement>("[data-shine]");
  if (shine) {
    const sx = ((e.clientX - rect.left) / rect.width) * 100;
    const sy = ((e.clientY - rect.top) / rect.height) * 100;
    shine.style.background = `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.4) 0%, transparent 65%)`;
    shine.style.opacity = "1";
  }
}

function handleTiltLeave(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
  el.style.transition = "transform 0.45s ease";
  const shine = el.querySelector<HTMLElement>("[data-shine]");
  if (shine) shine.style.opacity = "0";
}

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="relative px-6 py-28 overflow-hidden">
      {/* Background accent blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] -z-10 blur-3xl opacity-30 blob-2"
        style={{ background: "var(--color-kids-purple-light)" }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          {/* Section label */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-dark)" }}
          >
            ✦ Cara Kerja
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Tiga langkah sederhana</h2>
          <p className="text-lg" style={{ color: "var(--color-text-muted)" }}>
            Tidak butuh keahlian teknis — cukup kamera dan semangat belajar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-16 left-[calc(16.7%+24px)] right-[calc(16.7%+24px)] h-px opacity-30"
            style={{ background: "linear-gradient(90deg, var(--color-kids-purple), var(--color-kids-mint), var(--color-kids-sun))" }}
          />

          {STEPS.map((s, i) => {
            const Icon = s.Icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white overflow-hidden cursor-default select-none"
                style={{ boxShadow: "var(--shadow-sm)" }}
                onMouseMove={handleTilt}
                onMouseLeave={handleTiltLeave}
              >
                {/* Shine overlay */}
                <div
                  data-shine
                  className="absolute inset-0 pointer-events-none z-10 rounded-[var(--radius-xl)] opacity-0 transition-opacity duration-200"
                />

                {/* Card header with colored bg */}
                <div className="p-6 pb-4" style={{ background: s.color }}>
                  <div className="flex items-center justify-between mb-4">
                    {/* Step pill */}
                    <span
                      className="text-xs font-extrabold px-3 py-1 rounded-full"
                      style={{ background: "white", color: s.dark }}
                    >
                      {s.step}
                    </span>
                    {/* Icon box */}
                    <div
                      className="grid place-items-center w-11 h-11 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]"
                      style={{ background: s.bg }}
                    >
                      <Icon size={22} weight="duotone" color="white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold leading-snug" style={{ color: s.dark }}>{s.title}</h3>
                </div>

                {/* Card body */}
                <div className="p-6 pt-4">
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{s.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
