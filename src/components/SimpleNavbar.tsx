import Image from "next/image";
import Link from "next/link";

export function SimpleNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/30 bg-white/50 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/70">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-md dark:bg-slate-800">
            <Image src="/logo.png" alt="Serenité logo" width={40} height={40} className="h-10 w-10 object-contain" />
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
