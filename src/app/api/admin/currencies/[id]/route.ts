import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/http";
import { requireAdminSession } from "@/lib/auth";

interface RouteContext {
  params: { id: string } | Promise<{ id: string }>;
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;

    const userCount = await prisma.user.count({ where: { currencyId: id } });
    if (userCount > 0) {
      return NextResponse.json({ message: "Currency is in use by users" }, { status: 409 });
    }

    await prisma.currency.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
