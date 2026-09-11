import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Manager", "Staff"], default: "Staff" },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  
  // 2FA Fields
  twoFactorSecret: { type: String },
  is2FAEnabled: { type: Boolean, default: false },
  
  lastActiveAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);