"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/Button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/budget", label: "Budgets" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/30 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/70">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-amber-300 text-white shadow-md">
            <Heart className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-600 dark:text-amber-300">Serenité</p>
            <p className="text-base text-slate-900 dark:text-white">Wedding Budget</p>
          </div>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-slate-600 transition hover:text-rose-500 dark:text-slate-300",
                pathname === link.href && "text-rose-500",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {sessionUser ? (
            <>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
                Hi, {sessionUser.fullName?.split(" ")[0] ?? "friend"}
              </span>
              <Button variant="ghost" href="/dashboard">
                Dashboard
              </Button>
              <Button type="button" variant="secondary" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" href="/login">
                Log in
              </Button>
              <Button href="/register">Create Account</Button>
            </>
          )}
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-100/60 text-slate-700 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open ? (
        <div className="border-t border-white/50 bg-white/90 px-4 py-6 shadow-lg dark:border-white/10 dark:bg-slate-950/90 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-sm font-medium text-slate-700",
                  pathname === link.href && "text-rose-500",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              {sessionUser ? (
                <>
                  <Button variant="ghost" href="/dashboard">
                    Dashboard
                  </Button>
                  <Button type="button" onClick={handleLogout}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" href="/login">
                    Log in
                  </Button>
                  <Button href="/register">Create Account</Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
