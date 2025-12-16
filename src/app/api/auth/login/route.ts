import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { attachAuthCookie, verifyPassword } from "@/lib/auth";
import { handleApiError, validationError } from "@/lib/http";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const userRecord = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!userRecord) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const passwordValid = await verifyPassword(parsed.data.password, userRecord.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.fullName,
      partnerName: userRecord.partnerName,
      role: userRecord.role,
    };

    const response = NextResponse.json({ user });
    await attachAuthCookie(response, user.id, user.role);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
