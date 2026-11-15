import type { Request, Response } from "express";
import { getAuthUser } from "../../common/middleware/auth.middleware.ts";
import * as userService from "./user.service.ts";
import type { ActiveModeInput } from "./user.schema.ts";

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await userService.getMe(getAuthUser(req).id);
  res.status(200).json({ success: true, data: user });
}

export async function setActiveMode(req: Request<{}, {}, ActiveModeInput>, res: Response): Promise<void> {
  const user = await userService.setActiveMode(getAuthUser(req).id, req.body);
  res.status(200).json({ success: true, data: user });
}
