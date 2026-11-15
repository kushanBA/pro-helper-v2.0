import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.ts";
import { verifyAccessToken, type AuthUser } from "../auth/jwt.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Verifies the "Authorization: Bearer <token>" header and sets req.user.
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required");
  }

  try {
    req.user = await verifyAccessToken(header.slice("Bearer ".length).trim());
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  next();
}

// For handlers behind requireAuth: returns the user or fails with 401.
export function getAuthUser(req: Request): AuthUser {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }
  return req.user;
}
