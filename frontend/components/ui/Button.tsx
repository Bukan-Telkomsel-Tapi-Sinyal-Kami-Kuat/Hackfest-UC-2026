"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--color-blue-600)] text-white hover:bg-[var(--color-blue-700)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]",
  secondary:
    "bg-[var(--color-blue-50)] text-[var(--color-blue-700)] hover:bg-[var(--color-blue-100)]",
  ghost:
    "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]",
  outline:
    "bg-white text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-blue-400)] hover:text-[var(--color-blue-700)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, disabled, children, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {loading ? <span className="animate-pulse">…</span> : children}
    </button>
  )
);
Button.displayName = "Button";
