"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { LearningModule } from "@/types/module";

export function ModuleCard({ module: m }: { module: LearningModule }) {
  return (
    <Link href={`/modules/${m.slug}`}>
      <Card interactive className="overflow-hidden h-full">
        <div className="aspect-[5/3] w-full" style={{ background: m.cover }} />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-blue-700)] bg-[var(--color-blue-50)] rounded-full px-2 py-0.5">
              {m.category}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] rounded-full px-2 py-0.5">
              {m.level}
            </span>
          </div>
          <h3 className="font-bold text-base mb-1.5">{m.title}</h3>
          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-3">{m.summary}</p>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-subtle)]">
            <Clock className="w-3.5 h-3.5" />
            {m.duration}
          </div>
        </div>
      </Card>
    </Link>
  );
}
