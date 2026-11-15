import { z } from "zod";

const businessName = z.string().trim().min(2).max(100);
const bio = z.string().trim().min(20).max(1000);
const yearsOfExperience = z.number().int().min(0).max(60);

// Towns/districts the provider is willing to travel to. Duplicates (case-insensitive) are dropped.
const serviceAreas = z
  .array(z.string().trim().min(2).max(100))
  .min(1)
  .max(20)
  .transform((areas) => {
    const seen = new Set<string>();
    return areas.filter((area) => {
      const key = area.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

const categoryIds = z
  .array(z.uuid())
  .min(1)
  .max(10)
  .transform((ids) => [...new Set(ids)]);

export const createProviderProfileSchema = z.object({
  businessName: businessName.optional(),
  bio,
  yearsOfExperience,
  serviceAreas,
  categoryIds,
});

export type CreateProviderProfileInput = z.infer<typeof createProviderProfileSchema>;

export const updateProviderProfileSchema = z
  .object({
    businessName: businessName.nullable().optional(), // null clears it
    bio: bio.optional(),
    yearsOfExperience: yearsOfExperience.optional(),
    serviceAreas: serviceAreas.optional(),
    categoryIds: categoryIds.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Provide at least one field to update",
  });

export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;
