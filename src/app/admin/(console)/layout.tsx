import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import AdminShell from "./AdminShell";

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { fullName: true },
  });

  return <AdminShell adminName={adminUser?.fullName ?? "Admin"}>{children}</AdminShell>;
}
