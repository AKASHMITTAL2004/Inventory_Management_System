import express from "express";
import { protect } from "../middleware/authMiddleware.js";
// Make sure you add updateOrderStatus to your imports here:
import { createOrder, getOrders, updateOrderStatus } from "../controllers/orderController.js"; 

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);

// ADD THIS NEW ROUTE:
router.put("/:id", protect, updateOrderStatus);

export default router;
