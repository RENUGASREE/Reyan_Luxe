import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  categoryQuerySchema,
  createCategorySchema,
  idParamSchema,
  slugParamSchema,
  updateCategorySchema,
} from "../validators/catalog.validators.js";

const router = Router();

router.get("/", validateQuery(categoryQuerySchema), categoryController.listCategories);
router.get("/slug/:slug", validateParams(slugParamSchema), categoryController.getCategoryBySlug);
router.get("/:id", validateParams(idParamSchema), categoryController.getCategory);

router.post("/", requireAuth, requireAdmin, validateBody(createCategorySchema), categoryController.createCategory);
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateCategorySchema),
  categoryController.updateCategory
);
router.delete("/:id", requireAuth, requireAdmin, validateParams(idParamSchema), categoryController.deleteCategory);

export default router;
