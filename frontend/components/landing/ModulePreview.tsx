"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MODULES } from "@/lib/modules/data";

export function ModulePreview() {
  const featured = MODULES.slice(0, 4);
  return (
    <section className="px-6 py-24 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Modul Pilihan</h2>
          <p className="text-[var(--color-text-muted)] max-w-md">
            Mulai dengan modul rekomendasi kami. Tidak perlu daftar untuk melihat isinya.
          </p>
        </div>
        <Link
          href="/modules"
          className="text-sm font-semibold text-[var(--color-blue-700)] hover:text-[var(--color-blue-800)] inline-flex items-center gap-1.5"
        >
          Lihat Semua Modul
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featured.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Link href={`/modules/${m.slug}`}>
              <Card interactive className="overflow-hidden h-full">
                <div className="aspect-[5/3] w-full" style={{ background: m.cover }} />
                <div className="p-5">
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-blue-700)] bg-[var(--color-blue-50)] rounded-full px-2 py-0.5 mb-2">
                    {m.category}
                  </span>
                  <h3 className="font-bold text-base mb-1.5">{m.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">{m.summary}</p>
                  <div className="flex items-center gap-3 mt-4 text-xs text-[var(--color-text-subtle)]">
                    <span>{m.level}</span>
                    <span>•</span>
                    <span>{m.duration}</span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
