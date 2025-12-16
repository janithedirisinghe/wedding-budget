import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { attachAuthCookie, hashPassword } from "@/lib/auth";
import { handleApiError, validationError } from "@/lib/http";
import { generateUniqueUsername } from "@/lib/username";

const adminRegisterSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = adminRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const existingByEmail = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existingByEmail) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const username = await generateUniqueUsername(parsed.data.fullName);

    const adminUser = await prisma.user.create({
      data: {
        username,
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        passwordHash,
        partnerName: null,
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    const response = NextResponse.json({ user: adminUser }, { status: 201 });
    await attachAuthCookie(response, adminUser.id, adminUser.role);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
