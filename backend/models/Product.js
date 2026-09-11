import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  
  // Standard fields every industry uses
  name: { type: String, required: true },
  sku: { type: String, required: true },
  category: { type: String },
  unit: { type: String, required: true }, // e.g., 'piece', 'box', 'litre'
  cost: { type: Number, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  minThreshold: { type: Number, default: 10 },
  
  // THE TEMPLATE ENGINE: This flexible field stores industry-specific data.
  // Pharmacy stores { batchNumber: "123", expiryDate: "2027" } here.
  // Electronics stores { serialNumber: "ABC", warrantyMonths: 12 } here.
  extraFields: { type: mongoose.Schema.Types.Mixed, default: {} },

  createdAt: { type: Date, default: Date.now }
});

// Indexes speed up database queries drastically when users search by SKU or Category
productSchema.index({ organization_id: 1, sku: 1 });
productSchema.index({ organization_id: 1, category: 1 });

export default mongoose.model("Product", productSchema);