import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getOrders, createOrder } from "../controllers/orderController.js";

const router = express.Router();

router.use(protect); // Secure these routes

router.route("/")
  .get(getOrders)
  .post(createOrder);

export default router;
