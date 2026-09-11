import express from "express";
import { signup, login, setup2FA, verify2FA } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-2fa", verify2FA); // Used during login if 2FA is required

// Protected routes (must be logged in)
router.post("/setup-2fa", protect, setup2FA);

export default router;