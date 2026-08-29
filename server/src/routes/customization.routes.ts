import { Router } from "express";
import {
  getProductCustomization,
  calculateCustomizationPrice,
  validateCustomization,
  getCustomizationPreview,
} from "../controllers/customization.controller.js";
import { validateParams } from "../middleware/validate.js";
import { z } from "zod";

const router = Router();

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
});

// Get customization configuration for a product
router.get(
  "/products/:id/customization",
  validateParams(idParamSchema),
  getProductCustomization
);

// Calculate price for customization selections
router.post(
  "/products/:id/customization/calculate-price",
  validateParams(idParamSchema),
  calculateCustomizationPrice
);

// Validate customization selections
router.post(
  "/products/:id/customization/validate",
  validateParams(idParamSchema),
  validateCustomization
);

// Generate preview for customization
router.post(
  "/products/:id/customization/preview",
  validateParams(idParamSchema),
  getCustomizationPreview
);

export default router;
