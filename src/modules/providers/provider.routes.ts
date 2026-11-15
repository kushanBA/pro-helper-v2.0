import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.ts";
import { validateBody } from "../../common/middleware/validate.middleware.ts";
import { createProviderProfileSchema, updateProviderProfileSchema } from "./provider.schema.ts";
import { createMyProfile, getMyProfile, updateMyProfile } from "./provider.controller.ts";

const router = Router();

router.use(requireAuth);

// "Become a service provider"
router.post("/me", validateBody(createProviderProfileSchema), createMyProfile);

router.get("/me", getMyProfile);

router.patch("/me", validateBody(updateProviderProfileSchema), updateMyProfile);

export default router;
