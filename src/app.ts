import express from "express";
import authRoutes from "./modules/auth/auth.routes.ts";
import userRoutes from "./modules/users/user.routes.ts";
import providerRoutes from "./modules/providers/provider.routes.ts";
import serviceCategoryRoutes from "./modules/service-categories/service-category.routes.ts";
import { errorHandler } from "./common/errors/error-handler.ts";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/providers", providerRoutes);
app.use("/api/v1/service-categories", serviceCategoryRoutes);

// Must be registered after all routes.
app.use(errorHandler);

export default app;
