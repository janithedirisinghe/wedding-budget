import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/admin/login");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      fullName: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Admin Dashboard</p>
        <h1 className="text-4xl font-semibold text-slate-900">Welcome, {user.fullName ?? "Admin"}</h1>
        <p className="text-sm text-slate-600">This is a placeholder admin view. Build your management widgets here.</p>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Getting started</p>
        <p className="text-slate-700">Hook up metrics, approvals, or anything else the admin should manage.</p>
      </div>
    </main>
  );
}
