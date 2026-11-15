import { prisma } from "../../database/client.ts";
import { categorySummarySelect } from "../service-categories/service-category.repository.ts";

const profileSelect = {
  id: true,
  businessName: true,
  bio: true,
  yearsOfExperience: true,
  serviceAreas: true,
  createdAt: true,
  updatedAt: true,
  categories: {
    select: { category: { select: categorySummarySelect } },
    orderBy: { category: { name: "asc" } },
  },
} as const;

export function findProfileByUserId(userId: string) {
  return prisma.providerProfile.findUnique({ where: { userId }, select: profileSelect });
}

type CreateProfileData = {
  businessName?: string | undefined;
  bio: string;
  yearsOfExperience: number;
  serviceAreas: string[];
  categoryIds: string[];
};

// Creates the profile and switches the user into provider mode in one atomic write.
export async function createProfileForUser(userId: string, data: CreateProfileData) {
  const { categoryIds, ...fields } = data;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      activeMode: "PROVIDER",
      providerProfile: {
        create: {
          ...fields,
          categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
        },
      },
    },
    select: { activeMode: true, providerProfile: { select: profileSelect } },
  });

  return { activeMode: user.activeMode, profile: user.providerProfile };
}

type UpdateProfileData = {
  businessName?: string | null | undefined;
  bio?: string | undefined;
  yearsOfExperience?: number | undefined;
  serviceAreas?: string[] | undefined;
  categoryIds?: string[] | undefined;
};

export function updateProfileByUserId(userId: string, data: UpdateProfileData) {
  const { categoryIds, ...fields } = data;

  return prisma.providerProfile.update({
    where: { userId },
    data: {
      ...fields,
      // Replace the whole category list when one is sent.
      ...(categoryIds && {
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      }),
    },
    select: profileSelect,
  });
}
