import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDashboardMetrics } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(protect); // Secure the route
router.get("/", getDashboardMetrics);

export default router;
