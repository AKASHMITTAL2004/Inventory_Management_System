import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  name: { type: String, required: true },
  contactName: { type: String },
  email: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Supplier", supplierSchema);