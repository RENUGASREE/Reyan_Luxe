import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category.service.js";

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const active = req.query.active === "true" ? true : req.query.active === "false" ? false : undefined;
    const menu = req.query.menu === "true" ? true : req.query.menu === "false" ? false : undefined;

    const categories = await categoryService.listCategories({
      active,
      menu,
      productType: req.query.productType as string | undefined,
      parentId: req.query.parentId as string | undefined,
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
}
