import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateBody } from "../../common/middleware/validate.middleware.ts";
import { loginSchema } from "./auth.schema.ts";
import { login } from "./auth.controller.ts";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 attempts per IP per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many login attempts, try again later" } },
});

router.get("/", (_req, res) => {
  res.send("base url");
});

// TODO: replace with the real register flow (schema, controller, service).
router.post("/register", (_req, res) => {
  res.json({ message: "registering user" });
});

router.post("/login", loginLimiter, validateBody(loginSchema), login);

export default router;
