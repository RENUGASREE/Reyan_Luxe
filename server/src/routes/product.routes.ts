import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  createProductSchema,
  idParamSchema,
  productQuerySchema,
  slugParamSchema,
  updateProductSchema,
} from "../validators/catalog.validators.js";

const router = Router();

router.get("/", validateQuery(productQuerySchema), productController.listProducts);
router.get("/search", validateQuery(productQuerySchema), productController.searchProducts);
router.get("/inventory/low-stock", requireAuth, requireAdmin, productController.listLowStock);
router.get("/slug/:slug", validateParams(slugParamSchema), productController.getProductBySlug);
router.get("/:id", validateParams(idParamSchema), productController.getProduct);

router.post("/", requireAuth, requireAdmin, validateBody(createProductSchema), productController.createProduct);
router.post(
  "/:id/adjust-stock",
  requireAuth,
  requireAdmin,
  validateParams(idParamSchema),
  productController.adjustStock
);
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateProductSchema),
  productController.updateProduct
);
router.delete("/:id", requireAuth, requireAdmin, validateParams(idParamSchema), productController.deleteProduct);

export default router;
