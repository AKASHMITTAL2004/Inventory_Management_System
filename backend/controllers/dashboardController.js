import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";

export const getDashboardMetrics = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    // 1. Fetch all products to calculate valuation and stock levels
    const products = await Product.find({ organization_id: orgId });
    
    let totalValuation = 0;
    let lowStockCount = 0;
    const categoryDistribution = {};

    products.forEach(p => {
      // Valuation = what you paid for it * how many you have
      totalValuation += (p.cost * p.quantity); 
      
      if (p.quantity <= p.minThreshold) {
        lowStockCount++;
      }
      
      // Group products by category for the Donut Chart
      const cat = p.category || "Uncategorized";
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });

    // Format category data for Recharts [{ name: 'Electronics', value: 10 }]
    const chartDataCategories = Object.keys(categoryDistribution).map(key => ({
      name: key,
      value: categoryDistribution[key]
    }));

    // 2. Fetch the last 30 days of transactions for the volume chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await Transaction.find({
      organization_id: orgId,
      timestamp: { $gte: thirtyDaysAgo }
    })
    .sort({ timestamp: -1 })
    .populate("product_id", "name"); // Pulls in the product name for the activity feed

    let inboundVolume = 0;
    let outboundVolume = 0;

    recentTransactions.forEach(t => {
      if (t.type === "INBOUND") inboundVolume += t.quantity;
      if (t.type === "OUTBOUND") outboundVolume += t.quantity;
    });

    // 3. Send one massive payload to the frontend
    res.json({
      summary: {
        totalValuation,
        lowStockCount,
        totalProducts: products.length
      },
      charts: {
        categoryDistribution: chartDataCategories,
        volume: { inbound: inboundVolume, outbound: outboundVolume }
      },
      // Send the 5 most recent transactions for the "Recent Activity" widget
      recentActivity: recentTransactions.slice(0, 5) 
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};