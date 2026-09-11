import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  type: { type: String, enum: ["INBOUND", "OUTBOUND"], required: true },
  quantity: { type: Number, required: true },
  
  // Pending means a Manager needs to approve it before stock is actually deducted
  status: { type: String, enum: ["APPROVED", "PENDING", "REJECTED"], default: "APPROVED" },
  notes: { type: String },
  
  timestamp: { type: Date, default: Date.now }
});

// Index for fast dashboard queries (like "show me all transactions this week")
transactionSchema.index({ organization_id: 1, timestamp: -1 });

export default mongoose.model("Transaction", transactionSchema);