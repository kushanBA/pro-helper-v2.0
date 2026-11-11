import type { NextFunction, Request, Response } from "express";
import { AppError } from "./app-error.ts";

// Errors thrown by Express's body parser (bad JSON, body too large, ...)
// carry a 4xx `status` and `expose: true`.
function isClientHttpError(err: unknown): err is { status: number } {
  if (typeof err !== "object" || err === null) return false;
  const { status, expose } = err as { status?: unknown; expose?: unknown };
  return typeof status === "number" && status >= 400 && status < 500 && expose === true;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    return;
  }

  if (isClientHttpError(err)) {
    const message = err.status === 413 ? "Request body too large" : "Malformed request body";
    res.status(err.status).json({ success: false, error: { message } });
    return;
  }

  console.error(err); // replace with Pino later
  res.status(500).json({ success: false, error: { message: "Internal server error" } });
}
