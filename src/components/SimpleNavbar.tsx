import Link from "next/link";
import { Heart } from "lucide-react";

export function SimpleNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/30 bg-white/50 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/70">
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
      </nav>
    </header>
  );
}
