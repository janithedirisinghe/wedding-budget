"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Budget Defaults", href: "/admin/defaults/budget" },
  { label: "Checklist", href: "/admin/defaults/checklist" },
  { label: "Timeline", href: "/admin/defaults/timeline" },
];

export default function AdminShell({ adminName, children }: { adminName: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/30 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/80 shadow-sm transition hover:border-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500 dark:border-white/10 dark:bg-slate-800 lg:hidden"
              aria-label="Toggle navigation"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span className="h-0.5 w-5 rounded bg-slate-700 dark:bg-white" />
              <span className="sr-only">Toggle navigation</span>
            </button>
            <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white shadow-sm">
                <span className="text-sm font-bold">ADM</span>
              </div>
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Console</p>
                <p className="-mt-1 text-base font-semibold">Wedding Admin</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden flex-col text-right text-xs leading-tight text-slate-600 dark:text-slate-300 sm:flex">
              <span className="uppercase tracking-[0.25em]">Admin</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{adminName}</span>
            </div>
            <Button variant="outline" size="sm" loading={loggingOut} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8 lg:py-10">
        <aside
          className={cn(
            "lg:sticky lg:top-20 lg:h-[calc(100vh-120px)] lg:w-64",
            "rounded-3xl border border-white/50 bg-white/80 p-4 shadow-md shadow-rose-100/30 ring-1 ring-white/40 backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none",
            mobileMenuOpen ? "block" : "hidden lg:block",
          )}
        >
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-gradient-to-r from-rose-500 to-amber-400 text-white shadow-sm"
                      : "text-slate-700 hover:bg-white hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-800/60",
                  )}
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{active ? "Active" : ""}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
