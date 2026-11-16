import { AppError } from "../../common/errors/app-error.ts";
import { isForeignKeyError, isUniqueConstraintError } from "../../common/errors/prisma-errors.ts";
import { fileStorage } from "../../common/storage/storage.ts";
import { imageExtension } from "../../common/middleware/upload.middleware.ts";
import { generateJson } from "../../common/ai/gemini.ts";
import {
  countActiveCategoriesByIds,
  listActiveCategories,
} from "../service-categories/service-category.repository.ts";
import { getActiveUser } from "../users/user.service.ts";
import {
  createProfileForUser,
  findProfileByUserId,
  updateProfileByUserId,
} from "./provider.repository.ts";
import { geminiSuggestionSchema } from "./provider.schema.ts";
import type { CreateProviderProfileInput, UpdateProviderProfileInput } from "./provider.schema.ts";

const MAX_SKILLS = 8;

export type NicImages = { front: Express.Multer.File; back: Express.Multer.File };

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
export async function createMyProfile(
  userId: string,
  input: CreateProviderProfileInput,
  images: NicImages,
) {
  const user = await getActiveUser(userId);
  if (user.providerProfile !== null) {
    throw new AppError(409, "You already have a provider profile");
  }

  await assertCategoriesActive(input.categoryIds);

  // Save NIC images first; only their paths go into the database.
  const nicFrontImagePath = await fileStorage.save(
    "nic",
    images.front.buffer,
    imageExtension(images.front.mimetype),
  );
  const nicBackImagePath = await fileStorage.save(
    "nic",
    images.back.buffer,
    imageExtension(images.back.mimetype),
  );

  try {
    const { activeMode, profile } = await createProfileForUser(userId, {
      businessName: input.businessName,
      bio: input.bio,
      yearsOfExperience: input.yearsOfExperience,
      hourlyRate: input.hourlyRate,
      location: input.location,
      serviceCoverage: input.serviceCoverage,
      categoryIds: input.categoryIds,
      nicNumber: input.nicNumber,
      nicFrontImagePath,
      nicBackImagePath,
    });
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

// Suggests specialization, skills and categories from the free-text description.
// Only SUGGESTS — the user edits/confirms, and the real validation is the submit.
export async function suggestFromDescription(description: string) {
  const categories = await listActiveCategories();

  const prompt = [
    "You categorize home-service providers in Sri Lanka.",
    "Read the provider's description and respond with JSON ONLY, shaped exactly as:",
    '{"specialization": string, "skills": string[], "categorySlugs": string[]}',
    "- specialization: a short 2-4 word label of their main trade.",
    `- skills: up to ${MAX_SKILLS} short skill tags.`,
    "- categorySlugs: pick ONLY from this exact list (use the slug, left side):",
    categories.map((c) => `    ${c.slug}: ${c.name}`).join("\n"),
    "Do not invent categories. Use [] if none fit.",
    "",
    `Description: """${description}"""`,
  ].join("\n");

  const raw = await generateJson(prompt);

  const parsed = geminiSuggestionSchema.safeParse(raw);
  if (!parsed.success) {
    // Unexpected shape from the model: return nothing rather than failing.
    return { specialization: "", skills: [], suggestedCategories: [] };
  }

  // Dedupe skills (case-insensitive) and cap the count.
  const seen = new Set<string>();
  const skills: string[] = [];
  for (const skill of parsed.data.skills) {
    const key = skill.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    skills.push(skill);
    if (skills.length >= MAX_SKILLS) break;
  }

  // Keep only slugs that are real, active categories; map to full records.
  const suggestedSlugs = new Set(parsed.data.categorySlugs);
  const suggestedCategories = categories
    .filter((c) => suggestedSlugs.has(c.slug))
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

  return { specialization: parsed.data.specialization, skills, suggestedCategories };
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
        hourlyRate: input.hourlyRate,
        location: input.location,
        serviceCoverage: input.serviceCoverage,
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
