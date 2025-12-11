"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className, ...props }, ref) => {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        ref={ref}
        className={cn(
          "rounded-2xl border border-rose-100/70 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40 dark:text-white",
          error && "border-rose-400 focus:ring-rose-200",
          className,
        )}
        {...props}
      />
      {hint && !error ? <span className="text-xs text-slate-500">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  );
});

Input.displayName = "Input";
