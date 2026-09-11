import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getWarehouses, createWarehouse, 
  getSuppliers, createSupplier, 
  getProducts, createProduct 
} from "../controllers/inventoryController.js";

const router = express.Router();

// This single line protects ALL routes below it. 
// A user must pass a valid JWT to proceed.
router.use(protect); 

// .route() lets us chain GET and POST to the same URL
router.route("/warehouses").get(getWarehouses).post(createWarehouse);
router.route("/suppliers").get(getSuppliers).post(createSupplier);
router.route("/products").get(getProducts).post(createProduct);

export default router;