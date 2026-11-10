import express from "express";
import authRoutes from "./modules/auth/auth.routes.ts";
import { errorHandler } from "./common/errors/error-handler.ts";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

// Must be registered after all routes.
app.use(errorHandler);

export default app;
