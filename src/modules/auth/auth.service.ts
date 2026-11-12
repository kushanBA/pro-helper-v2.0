import argon2 from "argon2";
import { SignJWT } from "jose";
import { env } from "../../config/env.ts";
import { AppError } from "../../common/errors/app-error.ts";
import { findUserByEmail, createUser } from "../auth/auth.repository.ts";
import type { LoginInput, RegisterInput } from "./auth.schema.ts";

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

// Prisma throws this code when a unique constraint (here: email) is violated.
function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "P2002"
  );
}

export async function register(input: RegisterInput) {
  const passwordHash = await argon2.hash(input.password);

  try {
    return await createUser({
      email: input.email,
      passwordHash,
      role: "CUSTOMER", // hard-coded: clients can never choose their role
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AppError(409, "Email is already registered");
    }
    throw err;
  }
}

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
