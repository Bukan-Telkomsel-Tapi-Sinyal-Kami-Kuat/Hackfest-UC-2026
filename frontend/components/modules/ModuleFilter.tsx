"use client";

import { cn } from "@/lib/utils/cn";
import { CATEGORIES } from "@/lib/modules/data";
import type { ModuleCategory } from "@/types/module";

interface Props {
  value: ModuleCategory | "all";
  onChange: (v: ModuleCategory | "all") => void;
}

export function ModuleFilter({ value, onChange }: Props) {
  const items: { value: ModuleCategory | "all"; label: string }[] = [
    { value: "all", label: "Semua" },
    ...CATEGORIES,
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            "px-4 h-9 rounded-full text-sm font-semibold transition-colors border",
            value === it.value
              ? "bg-[var(--color-blue-600)] text-white border-[var(--color-blue-600)]"
              : "bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-blue-700)] hover:border-[var(--color-blue-200)]"
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
