import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-panel border border-white/40 bg-white/80 shadow-lg shadow-rose-100/50 dark:border-white/5 dark:bg-slate-900/50 dark:shadow-black/30",
        className,
      )}
      {...props}
    />
  );
}
