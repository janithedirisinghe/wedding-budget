import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import AdminDashboardClient from "@/app/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { fullName: true },
  });

  return <AdminDashboardClient adminName={adminUser?.fullName ?? "Admin"} />;
}
