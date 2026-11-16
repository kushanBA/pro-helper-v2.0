import type { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error.ts";
import { getAuthUser } from "../../common/middleware/auth.middleware.ts";
import * as providerService from "./provider.service.ts";
import type {
  CreateProviderProfileInput,
  SuggestionRequestInput,
  UpdateProviderProfileInput,
} from "./provider.schema.ts";

export async function createMyProfile(
  req: Request<{}, {}, CreateProviderProfileInput>,
  res: Response,
): Promise<void> {
  // multer .fields() puts files under req.files keyed by field name.
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const front = files?.nicFront?.[0];
  const back = files?.nicBack?.[0];
  if (!front || !back) {
    throw new AppError(400, "NIC front and back images are required");
  }

  const result = await providerService.createMyProfile(getAuthUser(req).id, req.body, {
    front,
    back,
  });
  res.status(201).json({ success: true, data: result });
}

export async function suggestProfile(
  req: Request<{}, {}, SuggestionRequestInput>,
  res: Response,
): Promise<void> {
  const suggestions = await providerService.suggestFromDescription(req.body.description);
  res.status(200).json({ success: true, data: suggestions });
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
