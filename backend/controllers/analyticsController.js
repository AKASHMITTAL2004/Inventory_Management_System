import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";

// FEATURE 1: Smart Reorder Suggestions (Moving Average)
export const getReorderSuggestions = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all OUTBOUND transactions from the last 30 days
    const recentOutbound = await Transaction.find({
      organization_id: orgId,
      type: "OUTBOUND",
      timestamp: { $gte: thirtyDaysAgo },
      status: "APPROVED"
    });

    // Group the quantities sold by product
    const productSales = {};
    recentOutbound.forEach((t) => {
      const pid = t.product_id.toString();
      if (!productSales[pid]) productSales[pid] = 0;
      productSales[pid] += t.quantity;
    });

    const products = await Product.find({ organization_id: orgId });
    const suggestions = [];

    products.forEach((product) => {
      const pid = product._id.toString();
      const soldLast30Days = productSales[pid] || 0;
      
      // Daily run rate
      const dailyUsage = soldLast30Days / 30;
      
      // Assume a 14-day lead time (how long it takes stock to arrive)
      const stockNeededForLeadTime = dailyUsage * 14;

      // If what we have is less than what we need before the next delivery arrives
      if (product.quantity <= stockNeededForLeadTime && soldLast30Days > 0) {
        // Suggest ordering enough to cover the next 30 days
        const suggestedOrder = Math.ceil((dailyUsage * 30) - product.quantity);
        if (suggestedOrder > 0) {
          suggestions.push({
            productId: product._id,
            name: product.name,
            currentStock: product.quantity,
            runRate: dailyUsage.toFixed(2),
            suggestedOrderQuantity: suggestedOrder,
            message: `Selling ~${dailyUsage.toFixed(1)} per day. Order ${suggestedOrder} to cover the next month.`
          });
        }
      }
    });

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: "Error calculating reorder suggestions" });
  }
};

// FEATURE 2: Anomaly Detection (Z-Score Math)
export const getAnomalies = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    // Get all outbound transactions
    const transactions = await Transaction.find({
      organization_id: orgId,
      type: "OUTBOUND"
    }).populate("product_id", "name").populate("user_id", "name");

    if (transactions.length < 10) {
      // Not enough data for statistical significance
      return res.json({ anomalies: [], message: "Gathering more data for baseline." });
    }

    // 1. Calculate the Mean (Average) transaction size
    const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);
    const mean = totalQuantity / transactions.length;

    // 2. Calculate Standard Deviation (How spread out the numbers are)
    const variance = transactions.reduce((sum, t) => sum + Math.pow(t.quantity - mean, 2), 0) / transactions.length;
    const stdDev = Math.sqrt(variance);

    const anomalies = [];

    // 3. Flag transactions that are more than 3 standard deviations above the mean (The Z-Score check)
    transactions.forEach((t) => {
      const zScore = (t.quantity - mean) / stdDev;
      
      // A z-score > 3 means this transaction is massive compared to normal behavior
      if (zScore > 3) {
        anomalies.push({
          transactionId: t._id,
          product: t.product_id.name,
          user: t.user_id.name,
          quantity: t.quantity,
          date: t.timestamp,
          reason: `Quantity (${t.quantity}) is significantly higher than the average (${mean.toFixed(1)}).`
        });
      }
    });

    // Sort to show the most recent anomalies first
    anomalies.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ message: "Error detecting anomalies" });
  }
};