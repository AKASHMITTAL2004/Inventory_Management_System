import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getWarehouses, createWarehouse,
  getSuppliers, createSupplier,
  getProducts, createProduct,
  updateProduct, deleteProduct // 1. Import the new controllers
} from "../controllers/inventoryController.js";

const router = express.Router();

router.use(protect);

router.route("/warehouses").get(getWarehouses).post(createWarehouse);
router.route("/suppliers").get(getSuppliers).post(createSupplier);

// 2. Add .put and .delete handlers for products using their ID
router.route("/products")
  .get(getProducts)
  .post(createProduct);

router.route("/products/:id")
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
