import { Router } from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All address routes require authentication
router.use(requireAuth);

// Get all addresses for the current user
router.get("/", getAddresses);

// Create a new address
router.post("/", createAddress);

// Update an existing address
router.patch("/:addressId", updateAddress);

// Delete an address
router.delete("/:addressId", deleteAddress);

// Set an address as default
router.patch("/:addressId/default", setDefaultAddress);

export default router;
