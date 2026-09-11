import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";

dotenv.config(); 

const app = express();

app.use(cors());
app.use(express.json());

// Strict Environment Variable Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Fails the build immediately if the URI is missing
  });

app.use("/api/auth", authRoutes); 
app.use("/api/inventory", inventoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/export", exportRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Inventory API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
