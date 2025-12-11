import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OverviewCardProps {
  label: string;
  value: string;
  change: string;
  trend?: "up" | "down";
  icon: ReactNode;
}

export function OverviewCard({ label, value, change, trend = "up", icon }: OverviewCardProps) {
  return (
    <div className="rounded-[28px] border border-white/50 bg-white/80 p-6 shadow-lg shadow-rose-100/50 backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/70">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-rose-100 p-3 text-rose-500 dark:bg-rose-500/20 dark:text-rose-100">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
      <p className={cn("mt-4 text-sm font-semibold", trend === "up" ? "text-emerald-500" : "text-rose-500")}>{change}</p>
    </div>
  );
}
