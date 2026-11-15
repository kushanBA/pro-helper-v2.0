import { AppError } from "../../common/errors/app-error.ts";
import { findUserById, updateActiveMode } from "./user.repository.ts";
import { toMeResponse, type UserRecord } from "./user.types.ts";
import type { ActiveModeInput } from "./user.schema.ts";

// Loads the signed-in user and rejects deleted or suspended accounts.
export async function getActiveUser(userId: string): Promise<UserRecord> {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(401, "Account no longer exists");
  }
  if (user.status !== "ACTIVE") {
    throw new AppError(403, "Account is not active");
  }
  return user;
}

export async function getMe(userId: string) {
  return toMeResponse(await getActiveUser(userId));
}

// Switch between the customer and provider side of the app.
// Only users who have completed a provider profile can switch to PROVIDER.
export async function setActiveMode(userId: string, input: ActiveModeInput) {
  const user = await getActiveUser(userId);

  if (input.mode === "PROVIDER" && user.providerProfile === null) {
    throw new AppError(403, "Create a provider profile before switching to provider mode");
  }

  if (user.activeMode === input.mode) {
    return toMeResponse(user);
  }

  return toMeResponse(await updateActiveMode(userId, input.mode));
}
