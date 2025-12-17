"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, User, CheckSquare, Clock, CreditCard, Home, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";

const menuItems = [
  { href: "/dashboard", icon: Home, label: "Overview" },
  { href: "/budget", icon: CreditCard, label: "Budgets" },
  { href: "/checklist", icon: CheckSquare, label: "Checklist" },
  { href: "/timeline", icon: Clock, label: "Timeline" },
  { href: "/profile", icon: Settings, label: "Profile" },
];

export function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ fullName?: string | null } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!active) return;
        setSessionUser(data.user);
      } catch {
        if (!active) return;
        setSessionUser(null);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    setSessionUser(null);
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-white/50 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/70">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-md dark:bg-slate-800">
            <Image src="/logo.png" alt="Serenité logo" width={40} height={40} className="h-10 w-10 object-contain" />
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-600 dark:text-amber-300">Serenité</p>
            <p className="text-base text-slate-900 dark:text-white">Wedding Budget</p>
          </div>
        </Link>

        {/* Desktop Profile Icon */}
        <div className="hidden items-center gap-4 lg:flex">
          {sessionUser && (
            <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
              {sessionUser.fullName?.split(" ")[0] ?? "User"}
            </span>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/70 text-slate-700 transition hover:scale-105 hover:text-rose-500 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-200"
              aria-label="Profile menu"
            >
              <User className="h-5 w-5" />
            </button>
            
            {/* Profile Dropdown */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/30 bg-white/90 p-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
                <Link
                  href="/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-rose-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/70 text-slate-700 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/30 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:hidden">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800",
                      active && "bg-white text-rose-500 shadow-sm dark:bg-slate-800",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Profile Section */}
              <div className="mt-4 border-t border-white/30 pt-4 dark:border-white/10">
                {sessionUser && (
                  <div className="mb-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-200">
                    {sessionUser.fullName ?? "User"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-white dark:text-rose-400 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
