"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "md" | "lg";
}

export function Modal({ open, onClose, title, description, children, size = "md" }: ModalProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div
        className={cn(
          "glass-panel relative w-full max-w-2xl border border-white/30 bg-white/90 p-8 shadow-2xl dark:border-white/10 dark:bg-slate-900",
          size === "lg" ? "max-w-3xl" : "max-w-xl",
        )}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full border border-rose-100/60 bg-white/80 p-2 text-slate-600 hover:text-rose-500 dark:border-white/10 dark:bg-slate-800 dark:text-white"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="space-y-3 pr-8">
          <p className="section-heading">{description ?? ""}</p>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
