"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]",
        interactive &&
          "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-[var(--color-blue-200)] cursor-pointer",
        className
      )}
      {...rest}
    />
  )
);
Card.displayName = "Card";
