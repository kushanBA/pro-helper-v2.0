import { prisma } from "../../database/client.ts";
import type { ActiveMode } from "../../generated/prisma/enums.ts";

const meSelect = {
  id: true,
  email: true,
  name: true,
  mobileNumber: true,
  gender: true,
  role: true,
  status: true,
  activeMode: true,
  createdAt: true,
  providerProfile: { select: { id: true } },
} as const;

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, select: meSelect });
}

export function updateActiveMode(id: string, activeMode: ActiveMode) {
  return prisma.user.update({ where: { id }, data: { activeMode }, select: meSelect });
}
