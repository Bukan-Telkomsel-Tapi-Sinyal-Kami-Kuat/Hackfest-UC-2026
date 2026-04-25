"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface TabsProps<T extends string> {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  return (
    <div
      className={cn(
        "relative inline-flex p-1 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)]",
        className
      )}
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative z-10 px-5 h-9 text-sm font-semibold rounded-full transition-colors duration-200",
              active ? "text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {active && (
              <motion.span
                layoutId="tabs-indicator"
                className="absolute inset-0 -z-10 bg-[var(--color-blue-600)] rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
