import type { Request, Response } from "express";
import * as authService from "./auth.service.ts";
import type { LoginInput } from "./auth.schema.ts";

// No try/catch needed: Express 5 forwards rejected promises to errorHandler.
export async function login(req: Request<{}, {}, LoginInput>, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
}
