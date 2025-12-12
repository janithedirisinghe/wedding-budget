"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode, HTMLAttributeAnchorTarget } from "react";
import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const sizes: Record<string, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

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
  size?: keyof typeof sizes;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", leftIcon, rightIcon, loading, children, disabled, href, target, rel, ...props },
    ref,
  ) => {
    const { onClick, type = "button", ...buttonProps } = props;
    const content = (
      <>
        {leftIcon}
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
        ) : (
          children
        )}
        {rightIcon}
      </>
    );

    const classes = cn(
      baseStyles,
      sizes[size],
      variants[variant],
      className,
      (disabled || loading) && "pointer-events-none opacity-60",
    );

    if (href) {
      return (
        <Link href={href} className={classes} target={target} rel={rel} aria-disabled={disabled || loading}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
        type={type}
        {...buttonProps}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
