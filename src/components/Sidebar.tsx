"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Clock, CreditCard, Home, Settings } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/dashboard", icon: Home, label: "Overview" },
  { href: "/budget", icon: CreditCard, label: "Budgets" },
  { href: "/checklist", icon: CheckSquare, label: "Checklist" },
  { href: "/timeline", icon: Clock, label: "Timeline" },
  { href: "/profile", icon: Settings, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col rounded-3xl border border-white/30 bg-white/80 p-6 shadow-lg shadow-rose-100/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:w-64">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-amber-600 dark:text-amber-300">Navigate</p>
      </div>
      <div className="mt-6 flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-rose-500 dark:text-slate-200 dark:hover:bg-slate-800",
                active && "bg-white text-rose-500 shadow-sm dark:bg-slate-800",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto rounded-2xl bg-gradient-to-br from-rose-200 to-amber-100 p-4 text-slate-800 dark:from-rose-500/30 dark:to-amber-400/30 dark:text-white">
        <p className="text-sm font-semibold">Need a PDF export?</p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-200">Download a beautifully formatted budget report.</p>
        <Button className="mt-4 w-full" variant="secondary">
          Download Report
        </Button>
      </div>
    </aside>
  );
}
