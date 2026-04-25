"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MODULES } from "@/lib/modules/data";

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  bahasa:     { bg: "var(--color-kids-pink-light)",   text: "var(--color-kids-pink-mid)" },
  matematika: { bg: "var(--color-kids-sky-light)",    text: "var(--color-kids-sky-mid)" },
  komunikasi: { bg: "var(--color-kids-purple-light)", text: "var(--color-kids-purple-mid)" },
  motorik:    { bg: "var(--color-kids-mint-light)",   text: "var(--color-kids-mint-mid)" },
};

function handleTilt(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  el.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateZ(8px) scale(1.02)`;
  el.style.transition = "transform 0.06s ease";
}

function handleTiltLeave(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)";
  el.style.transition = "transform 0.45s ease";
}

export function ModulePreview() {
  const featured = MODULES.slice(0, 4);

  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute bottom-0 right-0 w-96 h-96 -z-10 blur-3xl opacity-25 blob-1"
        style={{ background: "var(--color-kids-sun-light)" }}
      />
      <div
        className="absolute top-0 left-0 w-64 h-64 -z-10 blur-3xl opacity-20 blob-2"
        style={{ background: "var(--color-kids-pink-light)" }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background: "var(--color-kids-sun-light)", color: "var(--color-kids-sun-mid)" }}
            >
              ✦ Modul Pilihan
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-3">Mulai dari sini</h2>
            <p className="text-lg max-w-md" style={{ color: "var(--color-text-muted)" }}>
              Tidak perlu daftar untuk melihat isi modul. Eksplorasi dulu, belajar kapan siap.
            </p>
          </div>
          <Link
            href="/modules"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
            style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-dark)" }}
          >
            Lihat Semua Modul
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((m, i) => {
            const cc = CAT_COLORS[m.category] ?? CAT_COLORS.bahasa;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.09 }}
                className="cursor-pointer"
                onMouseMove={handleTilt}
                onMouseLeave={handleTiltLeave}
                style={{ willChange: "transform" }}
              >
                <Link href={`/modules/${m.slug}`}>
                  <Card className="overflow-hidden h-full border-[var(--color-border)] hover:shadow-[var(--shadow-md)] transition-shadow">
                    {/* Cover */}
                    <div className="aspect-[5/3] w-full relative overflow-hidden" style={{ background: m.cover }}>
                      {/* Category badge overlaid on cover */}
                      <span
                        className="absolute bottom-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm"
                        style={{ background: cc.bg, color: cc.text }}
                      >
                        {m.category}
                      </span>
                    </div>
                    {/* Body */}
                    <div className="p-5">
                      <h3 className="font-extrabold text-base mb-1.5 leading-snug">{m.title}</h3>
                      <p className="text-sm line-clamp-2 mb-4 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                        {m.summary}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--color-text-subtle)" }}>
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{ background: "var(--color-surface-muted)" }}
                        >
                          {m.level}
                        </span>
                        <span>·</span>
                        <span>{m.duration}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
