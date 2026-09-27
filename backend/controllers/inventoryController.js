import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import Warehouse from "../models/Warehouse.js";

// --- WAREHOUSES ---
export const getWarehouses = async (req, res) => {
  try {
    // req.user.orgId comes from our authMiddleware. 
    // This ensures Company A can never accidentally see Company B's warehouses.
    const warehouses = await Warehouse.find({ organization_id: req.user.orgId });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching warehouses" });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.create({ ...req.body, organization_id: req.user.orgId });
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: "Error creating warehouse" });
  }
};

// --- SUPPLIERS ---
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ organization_id: req.user.orgId });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching suppliers" });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create({ ...req.body, organization_id: req.user.orgId });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Error creating supplier" });
  }
};

// --- PRODUCTS ---
export const getProducts = async (req, res) => {
  try {
    // .populate() is a Mongoose feature that replaces the raw warehouse_id 
    // with the actual warehouse object (name, location) in the final JSON response.
    const products = await Product.find({ organization_id: req.user.orgId })
      .populate("warehouse_id", "name location")
      .populate("supplier_id", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, organization_id: req.user.orgId });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creating product" });
  }
};

// --- UPDATE PRODUCT ---
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, organization_id: req.user.orgId },
      req.body,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// --- DELETE PRODUCT ---
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findOneAndDelete({ 
      _id: id, 
      organization_id: req.user.orgId 
    });
    
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};
