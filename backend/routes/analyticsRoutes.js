import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getReorderSuggestions, getAnomalies } from "../controllers/analyticsController.js";

const router = express.Router();

router.use(protect);

router.get("/reorder-suggestions", getReorderSuggestions);
router.get("/anomalies", getAnomalies);

export default router;