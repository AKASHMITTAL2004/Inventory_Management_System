import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  
  // ADDED THIS LINE:
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: false },
  
  quantity: { type: Number, required: true },
  expectedDate: { type: Date },
  notes: { type: String },
  
  status: { 
    type: String, 
    enum: ['PENDING', 'ORDERED', 'RECEIVED'], 
    default: 'PENDING' 
  },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", orderSchema);
