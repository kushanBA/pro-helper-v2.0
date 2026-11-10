import argon2 from "argon2";
import { SignJWT } from "jose";
import { env } from "../../config/env.ts";
import { AppError } from "../../common/errors/app-error.ts";
import { findUserByEmail } from "../auth/auth.repository.ts";
import type { LoginInput } from "./auth.schema.ts";

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

// Used when the email doesn't exist, so failed logins take the same time
const dummyHash = await argon2.hash("dummy-password-for-timing");

export async function login(input: LoginInput) {
  const user = await findUserByEmail(input.email);

  const passwordOk = await argon2.verify(user?.passwordHash ?? dummyHash, input.password);

  if (!user || !passwordOk) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(403, "Account is not active");
  }

  const accessToken = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(jwtSecret);

  return {
    accessToken,
    user: { id: user.id, email: user.email, role: user.role }, // never return passwordHash
  };
}
