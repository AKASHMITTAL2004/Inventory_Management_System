import Transaction from "../models/Transaction.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";

// Any outbound order over this amount requires Manager approval
const APPROVAL_THRESHOLD = 50; 

export const createTransaction = async (req, res) => {
  try {
    const { product_id, type, quantity, notes } = req.body;
    const orgId = req.user.orgId;
    const userId = req.user.id;

    const product = await Product.findOne({ _id: product_id, organization_id: orgId });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 1. INBOUND WORKFLOW (Stock arriving)
    if (type === "INBOUND") {
      const transaction = await Transaction.create({
        organization_id: orgId, product_id, user_id: userId, type, quantity, notes, status: "APPROVED"
      });

      // Atomically increase stock
      await Product.findByIdAndUpdate(product_id, { $inc: { quantity: quantity } });
      return res.status(201).json(transaction);
    }

    // 2. OUTBOUND WORKFLOW (Stock leaving)
    if (type === "OUTBOUND") {
      if (product.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock available" });
      }

      // Check if it hits the approval threshold
      if (quantity >= APPROVAL_THRESHOLD) {
        const transaction = await Transaction.create({
          organization_id: orgId, product_id, user_id: userId, type, quantity, notes, status: "PENDING"
        });

        // Ping managers for approval
        await Notification.create({
          organization_id: orgId,
          message: `Large outbound request for ${quantity}x ${product.name} requires approval.`,
          type: "APPROVAL_REQUIRED"
        });

        return res.status(202).json({ message: "Transaction pending approval", transaction });
      }

      // If under threshold, approve automatically and deduct stock
      const transaction = await Transaction.create({
        organization_id: orgId, product_id, user_id: userId, type, quantity, notes, status: "APPROVED"
      });

      // Atomically decrease stock and return the UPDATED product document
      const updatedProduct = await Product.findByIdAndUpdate(
        product_id, 
        { $inc: { quantity: -quantity } },
        { new: true } 
      );

      // LOW STOCK FLAG: If stock drops below threshold, generate an alert
      if (updatedProduct.quantity <= updatedProduct.minThreshold) {
        await Notification.create({
          organization_id: orgId,
          message: `Low stock alert: ${updatedProduct.name} is down to ${updatedProduct.quantity} ${updatedProduct.unit}.`,
          type: "LOW_STOCK"
        });
      }

      return res.status(201).json(transaction);
    }
  } catch (error) {
    res.status(500).json({ message: "Error processing transaction", error: error.message });
  }
};

export const approveTransaction = async (req, res) => {
  try {
    // Only Admins or Managers can approve
    if (req.user.role === "Staff") {
      return res.status(403).json({ message: "Not authorized to approve transactions" });
    }

    const { id } = req.params;
    const transaction = await Transaction.findOne({ _id: id, organization_id: req.user.orgId });

    if (!transaction || transaction.status !== "PENDING") {
      return res.status(400).json({ message: "Valid pending transaction not found" });
    }

    // Update status to APPROVED
    transaction.status = "APPROVED";
    await transaction.save();

    // Deduct stock now that it is approved
    const updatedProduct = await Product.findByIdAndUpdate(
      transaction.product_id,
      { $inc: { quantity: -transaction.quantity } },
      { new: true }
    );

    // Check for low stock after approval deduction
    if (updatedProduct && updatedProduct.quantity <= updatedProduct.minThreshold) {
      await Notification.create({
        organization_id: req.user.orgId,
        message: `Low stock alert: ${updatedProduct.name} is down to ${updatedProduct.quantity}.`,
        type: "LOW_STOCK"
      });
    }

    res.json({ message: "Transaction approved and stock updated", transaction });
  } catch (error) {
    res.status(500).json({ message: "Error approving transaction" });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ organization_id: req.user.orgId })
      .sort({ timestamp: -1 }) // Newest first
      .populate("product_id", "name sku")
      .populate("user_id", "name");
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};