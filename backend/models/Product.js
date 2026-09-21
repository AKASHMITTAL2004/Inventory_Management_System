import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  
  // REMOVED 'required: true' so you can save a product without selecting a warehouse first
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" }, 
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  
  name: { type: String, required: true },
  sku: { type: String, required: true },
  category: { type: String },
  
  // CHANGED to default values so the database fills them in automatically if left blank
  unit: { type: String, default: 'piece' }, 
  cost: { type: Number, default: 0 }, 
  
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  minThreshold: { type: Number, default: 10 },
  
  extraFields: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ organization_id: 1, sku: 1 });
productSchema.index({ organization_id: 1, category: 1 });

export default mongoose.model("Product", productSchema);
