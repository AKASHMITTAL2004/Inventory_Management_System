import Order from "../models/Order.js";

// GET ALL ORDERS
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ organization_id: req.user.orgId })
      .populate("supplier_id", "name")
      .populate("product_id", "name price")
      .sort({ createdAt: -1 });

    // Format data to match exactly what your PurchaseOrders.jsx expects
    const formattedOrders = orders.map(o => ({
      _id: o._id,
      supplier: o.supplier_id ? o.supplier_id.name : "Unknown Supplier",
      product: o.product_id ? o.product_id.name : "Unknown Product",
      quantity: o.quantity,
      status: o.status,
      date: new Date(o.createdAt).toLocaleDateString(),
      total: o.quantity * (o.product_id ? o.product_id.price : 0)
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// CREATE NEW ORDER
export const createOrder = async (req, res) => {
  try {
    const { supplier_id, product_id, quantity, expectedDate, notes } = req.body;

    const newOrder = await Order.create({
      organization_id: req.user.orgId,
      supplier_id,
      product_id,
      quantity,
      expectedDate,
      notes,
      status: 'PENDING'
    });

    // Populate and format the newly created order so it instantly renders correctly on the frontend
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("supplier_id", "name")
      .populate("product_id", "name price");

    res.status(201).json({
      _id: populatedOrder._id,
      supplier: populatedOrder.supplier_id.name,
      product: populatedOrder.product_id.name,
      quantity: populatedOrder.quantity,
      status: populatedOrder.status,
      date: new Date(populatedOrder.createdAt).toLocaleDateString(),
      total: populatedOrder.quantity * populatedOrder.product_id.price
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};
