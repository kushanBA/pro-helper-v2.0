import { SignJWT, jwtVerify } from "jose";
import { env } from "../../config/env.ts";
import type { UserRole } from "../../generated/prisma/enums.ts";

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

export type AuthUser = {
  id: string;
  role: UserRole;
};

export function signAccessToken(user: AuthUser): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(jwtSecret);
}

// Throws if the signature, issuer, audience, expiry or claims are invalid.
export async function verifyAccessToken(token: string): Promise<AuthUser> {
  const { payload } = await jwtVerify(token, jwtSecret, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    algorithms: ["HS256"],
  });

  if (typeof payload.sub !== "string" || (payload.role !== "USER" && payload.role !== "ADMIN")) {
    throw new Error("Invalid token claims");
  }

  return { id: payload.sub, role: payload.role };
}
