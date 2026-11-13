import { prisma } from "../../database/client.ts";
import type { Gender } from "../../generated/prisma/enums.ts";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true, role: true, status: true },
  });
}

// No `role` here on purpose: new accounts always get the database default (USER).
type CreateUserData = {
  email: string;
  passwordHash: string;
  name: string;
  mobileNumber: string;
  gender: Gender;
};

export function createUser(data: CreateUserData) {
  return prisma.user.create({
    data,
    select: { id: true, email: true, name: true, role: true, status: true },
  });
}
