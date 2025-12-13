import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardNavbar } from "@/components/DashboardNavbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/60 to-rose-100/40 dark:from-slate-950 dark:via-slate-950/80 dark:to-black">
      <DashboardNavbar />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-24 sm:px-6 lg:flex-row lg:py-24">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <section className="flex-1 pb-12">{children}</section>
      </div>
    </div>
  );
}
