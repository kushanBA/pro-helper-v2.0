import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../common/middleware/auth.middleware.ts";
import { validateBody } from "../../common/middleware/validate.middleware.ts";
import { imageUpload } from "../../common/middleware/upload.middleware.ts";
import {
  createProviderProfileSchema,
  suggestionRequestSchema,
  updateProviderProfileSchema,
} from "./provider.schema.ts";
import {
  createMyProfile,
  getMyProfile,
  suggestProfile,
  updateMyProfile,
} from "./provider.controller.ts";

const router = Router();

router.use(requireAuth);

// AI calls use quota, so limit them per IP.
const suggestionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many suggestion requests, try again later" } },
});

// AI helper: suggest specialization/skills/categories from the description.
router.post("/me/suggestions", suggestionLimiter, validateBody(suggestionRequestSchema), suggestProfile);

// "Become a service provider". multer parses the multipart form first so the
// text fields are on req.body for validateBody and the images on req.files.
router.post(
  "/me",
  imageUpload.fields([
    { name: "nicFront", maxCount: 1 },
    { name: "nicBack", maxCount: 1 },
  ]),
  validateBody(createProviderProfileSchema),
  createMyProfile,
);

router.get("/me", getMyProfile);

router.patch("/me", validateBody(updateProviderProfileSchema), updateMyProfile);

export default router;
