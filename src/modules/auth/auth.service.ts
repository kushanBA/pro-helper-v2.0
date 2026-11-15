import argon2 from "argon2";
import { AppError } from "../../common/errors/app-error.ts";
import { isUniqueConstraintError } from "../../common/errors/prisma-errors.ts";
import { signAccessToken } from "../../common/auth/jwt.ts";
import { findUserByEmail, createUser } from "../auth/auth.repository.ts";
import type { LoginInput, RegisterInput } from "./auth.schema.ts";

export async function register(input: RegisterInput) {
  const passwordHash = await argon2.hash(input.password);

  try {
    // role is not passed: the database default (USER) applies, so clients can never choose it
    return await createUser({
      email: input.email,
      passwordHash,
      name: input.name,
      mobileNumber: input.mobileNumber,
      gender: input.gender,
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

  const accessToken = await signAccessToken({ id: user.id, role: user.role });

  return {
    accessToken,
    // never return passwordHash
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      activeMode: user.activeMode,
      isProvider: user.providerProfile !== null,
    },
  };
}
