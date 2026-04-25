"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-11 px-4 rounded-[var(--radius-md)] border bg-white text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)] transition-all duration-150 focus:outline-none focus:shadow-[var(--shadow-focus)]",
            error
              ? "border-[var(--color-focus-low)]"
              : "border-[var(--color-border)] focus:border-[var(--color-blue-500)]",
            className
          )}
          {...rest}
        />
        {error && <span className="text-xs text-[var(--color-focus-low)]">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
