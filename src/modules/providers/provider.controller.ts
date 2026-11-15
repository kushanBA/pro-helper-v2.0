import type { Request, Response } from "express";
import { getAuthUser } from "../../common/middleware/auth.middleware.ts";
import * as providerService from "./provider.service.ts";
import type { CreateProviderProfileInput, UpdateProviderProfileInput } from "./provider.schema.ts";

export async function createMyProfile(
  req: Request<{}, {}, CreateProviderProfileInput>,
  res: Response,
): Promise<void> {
  const result = await providerService.createMyProfile(getAuthUser(req).id, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  const profile = await providerService.getMyProfile(getAuthUser(req).id);
  res.status(200).json({ success: true, data: profile });
}

export async function updateMyProfile(
  req: Request<{}, {}, UpdateProviderProfileInput>,
  res: Response,
): Promise<void> {
  const profile = await providerService.updateMyProfile(getAuthUser(req).id, req.body);
  res.status(200).json({ success: true, data: profile });
}
