import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const AUTH_COOKIE_NAME = "serenite_session";
const TOKEN_TTL = "7d";

const rawSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-secret";
const secret = new TextEncoder().encode(rawSecret);

export { AUTH_COOKIE_NAME };

export async function signAuthToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
