"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ModuleFilter } from "@/components/modules/ModuleFilter";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { getModulesByCategory } from "@/lib/modules/data";
import type { ModuleCategory } from "@/types/module";

export default function ModulesPage() {
  const [filter, setFilter] = useState<ModuleCategory | "all">("all");
  const list = getModulesByCategory(filter);

  return (
    <section className="px-6 py-12 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Katalog Modul</h1>
        <p className="text-[var(--color-text-muted)] max-w-xl">
          Jelajahi modul belajar yang dirancang untuk anak berkebutuhan khusus. Tidak perlu daftar untuk melihat.
        </p>
      </header>
      <div className="mb-8">
        <ModuleFilter value={filter} onChange={setFilter} />
      </div>
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {list.map((m) => (
          <motion.div key={m.id} layout>
            <ModuleCard module={m} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
