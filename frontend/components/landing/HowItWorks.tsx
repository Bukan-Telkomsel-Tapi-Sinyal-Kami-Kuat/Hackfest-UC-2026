"use client";

import { motion } from "framer-motion";
import { Camera, BookOpen, ChartLineUp } from "@phosphor-icons/react";

const STEPS = [
  {
    icon: Camera,
    title: "Kamera Memantau Fokus",
    body: "Computer Vision membaca pose, arah mata, dan ekspresi anak secara real-time.",
  },
  {
    icon: BookOpen,
    title: "Modul Menyesuaikan",
    body: "Konten otomatis disesuaikan saat anak terlihat lelah atau kehilangan fokus.",
  },
  {
    icon: ChartLineUp,
    title: "Orang Tua Mendapat Panduan",
    body: "Sistem memberi saran konkret: ganti media, beri jeda, atau ulangi konsep.",
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="px-6 py-24 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Cara Kerja</h2>
        <p className="text-[var(--color-text-muted)]">
          Tiga langkah sederhana — tidak butuh keahlian teknis.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative p-7 rounded-[var(--radius-xl)] bg-white border border-[var(--color-border)] hover:border-[var(--color-blue-200)] hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className="absolute -top-3 -left-3 grid place-items-center w-10 h-10 rounded-full bg-[var(--color-blue-600)] text-white text-sm font-bold shadow-[var(--shadow-md)]">
                {i + 1}
              </div>
              <Icon size={28} weight="duotone" className="text-[var(--color-blue-600)] mb-4" />
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{s.body}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
