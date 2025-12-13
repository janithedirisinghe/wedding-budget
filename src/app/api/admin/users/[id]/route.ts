import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleApiError, validationError } from "@/lib/http";
import { hashPassword, requireAdminSession } from "@/lib/auth";

const adminUserInclude = {
  budgets: {
    include: {
      categories: true,
      expenses: true,
      checklist: {
        include: {
          items: true,
        },
      },
      timeline: true,
    },
  },
};

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  partnerName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  username: z.string().min(2).optional(),
});

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: adminUserInclude,
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const data: Prisma.UserUpdateInput = {};
    if (parsed.data.fullName !== undefined) data.fullName = parsed.data.fullName;
    if (parsed.data.partnerName !== undefined) data.partnerName = parsed.data.partnerName;
    if (parsed.data.email !== undefined) data.email = parsed.data.email;
    if (parsed.data.role !== undefined) data.role = parsed.data.role;
    if (parsed.data.username !== undefined) data.username = parsed.data.username;
    if (parsed.data.password) {
      data.passwordHash = await hashPassword(parsed.data.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      include: adminUserInclude,
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
