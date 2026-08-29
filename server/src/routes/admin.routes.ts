import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  adminUpdateUserRoleSchema,
  adminUsersQuerySchema,
} from "../validators/auth.validators.js";
import { idParamSchema } from "../validators/catalog.validators.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/dashboard", adminController.getDashboard);
router.get("/users", validateQuery(adminUsersQuerySchema), adminController.listUsers);
router.patch(
  "/users/:id/role",
  validateParams(idParamSchema),
  validateBody(adminUpdateUserRoleSchema),
  adminController.updateUserRole
);

export default router;
