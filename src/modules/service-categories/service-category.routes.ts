import { Router } from "express";
import { listActiveCategories } from "./service-category.repository.ts";

const router = Router();

// Public: the app needs this list for the "become a service provider" form.
// The list is small and admin-curated, so it is not paginated.
router.get("/", async (_req, res) => {
  const categories = await listActiveCategories();
  res.status(200).json({ success: true, data: categories });
});

export default router;
