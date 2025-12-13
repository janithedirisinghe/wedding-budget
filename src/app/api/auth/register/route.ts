import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { attachAuthCookie, hashPassword } from "@/lib/auth";
import { handleApiError, validationError } from "@/lib/http";

const registerSchema = z.object({
  fullName: z.string().min(2),
  partnerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

function buildBaseUsername(fullName: string) {
  const normalized = fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalized || `user${Math.floor(Math.random() * 10000)}`;
}

async function generateUniqueUsername(fullName: string) {
  const base = buildBaseUsername(fullName);
  let candidate = base;
  let counter = 1;

  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${counter}`;
    counter += 1;
  }

  return candidate;
}

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
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        partnerName: true,
      },
    });

    const response = NextResponse.json({ user }, { status: 201 });
    await attachAuthCookie(response, user.id);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
