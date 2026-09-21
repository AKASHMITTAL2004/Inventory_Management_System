import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  name: { type: String, required: true },
  location: { type: String },
  // ADD THE MISSING FIELDS BELOW:
  capacity: { type: Number, required: true, default: 1000 },
  currentLoad: { type: Number, default: 0 },
  manager: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Warehouse", warehouseSchema);
