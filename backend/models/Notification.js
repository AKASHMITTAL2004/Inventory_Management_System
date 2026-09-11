import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["LOW_STOCK", "APPROVAL_REQUIRED", "SYSTEM"], required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);