"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<string, string> = {
  primary: "btn-gradient text-white focus-visible:outline-rose-500",
  secondary:
    "bg-white/80 text-slate-800 shadow-md shadow-rose-100/60 hover:bg-white focus-visible:outline-amber-500 dark:bg-slate-900/60 dark:text-white",
  outline:
    "border border-rose-200/70 bg-transparent text-rose-500 hover:bg-rose-50 focus-visible:outline-rose-500 dark:border-white/20 dark:text-white",
  ghost: "text-slate-600 hover:text-rose-500 dark:text-slate-200",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", leftIcon, rightIcon, loading, children, disabled, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(baseStyles, variants[variant], className, (disabled || loading) && "pointer-events-none opacity-60")}
        {...(!asChild && { disabled: disabled || loading })}
        {...props}
      >
        {leftIcon}
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
        ) : (
          children
        )}
        {rightIcon}
      </Comp>
    );
  },
);

Button.displayName = "Button";
