import { AppError } from "../../common/errors/app-error.ts";
import { isForeignKeyError, isUniqueConstraintError } from "../../common/errors/prisma-errors.ts";
import { countActiveCategoriesByIds } from "../service-categories/service-category.repository.ts";
import { getActiveUser } from "../users/user.service.ts";
import {
  createProfileForUser,
  findProfileByUserId,
  updateProfileByUserId,
} from "./provider.repository.ts";
import type { CreateProviderProfileInput, UpdateProviderProfileInput } from "./provider.schema.ts";

type ProfileRecord = NonNullable<Awaited<ReturnType<typeof findProfileByUserId>>>;

// Flatten the join table: categories: [{ category: {...} }] -> categories: [{...}]
function toProfileResponse(profile: ProfileRecord) {
  return { ...profile, categories: profile.categories.map((entry) => entry.category) };
}

const invalidCategoriesError = () =>
  new AppError(400, "One or more service categories are invalid or inactive");

async function assertCategoriesActive(categoryIds: string[]): Promise<void> {
  const activeCount = await countActiveCategoriesByIds(categoryIds);
  if (activeCount !== categoryIds.length) {
    throw invalidCategoriesError();
  }
}

// "Become a service provider": the user keeps their customer side and gains a provider side.
export async function createMyProfile(userId: string, input: CreateProviderProfileInput) {
  const user = await getActiveUser(userId);
  if (user.providerProfile !== null) {
    throw new AppError(409, "You already have a provider profile");
  }

  await assertCategoriesActive(input.categoryIds);

  try {
    const { activeMode, profile } = await createProfileForUser(userId, input);
    if (!profile) {
      throw new Error("Provider profile was not returned after creation");
    }
    return { activeMode, profile: toProfileResponse(profile) };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AppError(409, "You already have a provider profile"); // concurrent request won
    }
    if (isForeignKeyError(err)) {
      throw invalidCategoriesError(); // category removed between check and insert
    }
    throw err;
  }
}

export async function getMyProfile(userId: string) {
  await getActiveUser(userId);
  const profile = await findProfileByUserId(userId);
  if (!profile) {
    throw new AppError(404, "Provider profile not found");
  }
  return toProfileResponse(profile);
}

export async function updateMyProfile(userId: string, input: UpdateProviderProfileInput) {
  const user = await getActiveUser(userId);
  if (user.providerProfile === null) {
    throw new AppError(404, "Provider profile not found");
  }

  if (input.categoryIds) {
    await assertCategoriesActive(input.categoryIds);
  }

  try {
    return toProfileResponse(
      await updateProfileByUserId(userId, {
        businessName: input.businessName,
        bio: input.bio,
        yearsOfExperience: input.yearsOfExperience,
        serviceAreas: input.serviceAreas,
        categoryIds: input.categoryIds,
      }),
    );
  } catch (err) {
    if (isForeignKeyError(err)) {
      throw invalidCategoriesError();
    }
    throw err;
  }
}
