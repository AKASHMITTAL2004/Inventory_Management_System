import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
  // Links this warehouse to a specific business
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  name: { type: String, required: true },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Warehouse", warehouseSchema);