import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service.js";
import type { productQuerySchema } from "../validators/catalog.validators.js";
import type { z } from "zod";

type ProductQuery = z.infer<typeof productQuerySchema>;

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productService.listProducts(req.query as unknown as ProductQuery);
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function searchProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string) || "";
    const { q: _removed, ...rest } = req.query as Record<string, unknown>;
    const result = await productService.searchProducts(q, rest as ProductQuery);
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
}

export async function listLowStock(req: Request, res: Response, next: NextFunction) {
  try {
    const threshold = req.query.threshold ? Number(req.query.threshold) : undefined;
    const products = await productService.listLowStockProducts(threshold);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function adjustStock(req: Request, res: Response, next: NextFunction) {
  try {
    const { quantityChange, action, reason } = req.body;
    const result = await productService.adjustStock(req.params.id, {
      quantityChange,
      action,
      reason,
      performedBy: req.user?.id,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
