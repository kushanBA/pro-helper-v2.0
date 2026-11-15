import type { findUserById } from "./user.repository.ts";

export type UserRecord = NonNullable<Awaited<ReturnType<typeof findUserById>>>;

// Public shape of the signed-in user. `isProvider` replaces the raw relation.
export function toMeResponse(user: UserRecord) {
  const { providerProfile, ...rest } = user;
  return { ...rest, isProvider: providerProfile !== null };
}
