import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.ts";
import { validateBody } from "../../common/middleware/validate.middleware.ts";
import { activeModeSchema } from "./user.schema.ts";
import { getMe, setActiveMode } from "./user.controller.ts";

const router = Router();

router.use(requireAuth);

router.get("/me", getMe);

router.patch("/me/active-mode", validateBody(activeModeSchema), setActiveMode);

export default router;
