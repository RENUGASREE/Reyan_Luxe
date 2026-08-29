import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service.js";
import * as userService from "../services/user.service.js";

export async function getDashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.listUsers(req.query as unknown as Parameters<typeof userService.listUsers>[0]);
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
