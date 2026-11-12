import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateBody } from "../../common/middleware/validate.middleware.ts";
import { loginSchema, registerSchema } from "./auth.schema.ts";
import { login, register } from "./auth.controller.ts";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 attempts per IP per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many login attempts, try again later" } },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // 5 sign-ups per IP per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many accounts created, try again later" } },
});

router.get("/", (_req, res) => {
  res.send("base url");
});

router.post("/register", registerLimiter, validateBody(registerSchema), register);

router.post("/login", loginLimiter, validateBody(loginSchema), login);

export default router;
