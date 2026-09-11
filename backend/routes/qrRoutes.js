import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { generateProductQR, getProductByQR } from "../controllers/qrController.js";

const router = express.Router();

router.use(protect); // Secure the routes

// Endpoint to create the image (used when printing labels)
router.get("/generate/:productId", generateProductQR);

// Endpoint to look up the item (used instantly after the camera scans a label)
router.get("/scan/:productId", getProductByQR);

export default router;