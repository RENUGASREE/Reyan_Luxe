import { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordPaymentFailure,
  processRefund,
} from "../services/payment.service.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// All payment routes require authentication
router.use(requireAuth);

// Create Razorpay order for an existing order
router.post("/razorpay/create-order", async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: "Order ID is required" });
    }

    const result = await createRazorpayOrder(userId, orderId, req.body.amount);
    return res.json(result);
  } catch (error) {
    next(error);
    return;
  }
});

// Verify Razorpay payment
router.post("/razorpay/verify", async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing payment verification data" });
    }

    const result = await verifyRazorpayPayment(userId, {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return res.json(result);
  } catch (error) {
    next(error);
    return;
  }
});

// Record payment failure
router.post("/razorpay/failure", async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const { orderId, reason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: "Order ID is required" });
    }

    const result = await recordPaymentFailure(userId, orderId, reason);
    return res.json(result);
  } catch (error) {
    next(error);
    return;
  }
});

// Admin: Process refund
router.post("/refund", requireAdmin, async (req, res, next) => {
  try {
    const { orderId, amount, reason } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: "Order ID is required" });
    }

    const result = await processRefund(orderId, amount, reason);
    return res.json(result);
  } catch (error) {
    next(error);
    return;
  }
});

export default router;
