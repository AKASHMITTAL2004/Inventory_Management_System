import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { exportPDF, exportExcel } from "../controllers/exportController.js";

const router = express.Router();

router.use(protect);
router.get("/pdf", exportPDF);
router.get("/excel", exportExcel);

export default router;