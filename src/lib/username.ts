import { prisma } from "@/lib/prisma";

export function buildBaseUsername(fullName: string) {
  const normalized = fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalized || `user${Math.floor(Math.random() * 10000)}`;
}

export async function generateUniqueUsername(fullName: string) {
  const base = buildBaseUsername(fullName);
  let candidate = base;
  let counter = 1;

  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${counter}`;
    counter += 1;
  }

  return candidate;
}
