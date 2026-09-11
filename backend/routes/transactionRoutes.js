import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  createTransaction, 
  getTransactions, 
  approveTransaction 
} from "../controllers/transactionController.js";

const router = express.Router();

router.use(protect); // Secure all routes

router.route("/")
  .get(getTransactions)
  .post(createTransaction);

// The :id in the URL acts as a variable we grab in the controller
router.patch("/:id/approve", approveTransaction);

export default router;