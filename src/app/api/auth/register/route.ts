import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { attachAuthCookie, hashPassword } from "@/lib/auth";
import { handleApiError, validationError } from "@/lib/http";
import { generateUniqueUsername } from "@/lib/username";

const registerSchema = z.object({
  fullName: z.string().min(2),
  partnerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const username = await generateUniqueUsername(parsed.data.fullName);

    const user = await prisma.user.create({
      data: {
        username,
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        partnerName: parsed.data.partnerName,
        passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        partnerName: true,
        role: true,
      },
    });

    const response = NextResponse.json({ user }, { status: 201 });
    await attachAuthCookie(response, user.id, user.role);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
