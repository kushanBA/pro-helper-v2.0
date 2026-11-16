import { z } from "zod";

const businessName = z.string().trim().min(2).max(100);
const bio = z.string().trim().min(20).max(1000); // the provider's description of what they do
const yearsOfExperience = z.coerce.number().int().min(0).max(60);
const hourlyRate = z.coerce.number().int().positive().max(1_000_000); // whole rupees, no decimals
const location = z.string().trim().min(2).max(100);
const serviceCoverage = z.enum(["ISLAND_WIDE", "NEARBY"]);

// Sri Lankan NIC: old format (9 digits + V/X) or new format (12 digits).
const nicNumber = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^([0-9]{9}[VX]|[0-9]{12})$/, "Invalid NIC number");

// In multipart forms a single value arrives as a string and several as an array.
// Normalize to an array so one or many category ids both validate.
const categoryIds = z
  .preprocess(
    (value) => (value === undefined ? undefined : Array.isArray(value) ? value : [value]),
    z.array(z.uuid()).min(1).max(10),
  )
  .transform((ids) => [...new Set(ids)]);

// Text fields of the "become a provider" form. NIC images arrive as files
// (handled by multer), not here.
export const createProviderProfileSchema = z.object({
  businessName: businessName.optional(),
  bio,
  yearsOfExperience,
  hourlyRate,
  location,
  serviceCoverage,
  nicNumber,
  categoryIds,
});

export type CreateProviderProfileInput = z.infer<typeof createProviderProfileSchema>;

// NIC is not editable here: changing identity would require re-verification.
export const updateProviderProfileSchema = z
  .object({
    businessName: businessName.nullable().optional(), // null clears it
    bio: bio.optional(),
    yearsOfExperience: yearsOfExperience.optional(),
    hourlyRate: hourlyRate.optional(),
    location: location.optional(),
    serviceCoverage: serviceCoverage.optional(),
    categoryIds: categoryIds.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Provide at least one field to update",
  });

export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;

// Request to the AI helper: just the description text.
export const suggestionRequestSchema = z.object({
  description: z.string().trim().min(20).max(1000),
});

export type SuggestionRequestInput = z.infer<typeof suggestionRequestSchema>;

// Validates Gemini's (untrusted) JSON before we use it. Lenient defaults so a
// partial response still yields something usable instead of throwing.
export const geminiSuggestionSchema = z.object({
  specialization: z.string().trim().max(60).optional().default(""),
  skills: z.array(z.string().trim().min(1).max(40)).optional().default([]),
  categorySlugs: z.array(z.string().trim().min(1).max(60)).optional().default([]),
});
