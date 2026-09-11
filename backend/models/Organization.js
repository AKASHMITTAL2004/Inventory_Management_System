import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // This 'industry' string must match one of the keys in our industryTemplates.js (e.g., 'pharmacy', 'electronics')
  industry: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Organization", organizationSchema);