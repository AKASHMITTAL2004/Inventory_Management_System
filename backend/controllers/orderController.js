import Order from "../models/Order.js";
import Product from "../models/Product.js"; // <-- ADDED: Need this to update product stock

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
    // ADDED: warehouse_id is now pulled from req.body
    const { supplier_id, product_id, warehouse_id, quantity, expectedDate, notes } = req.body;

    const newOrder = await Order.create({
      organization_id: req.user.orgId,
      supplier_id,
      product_id,
      warehouse_id, // <-- ADDED: Saves the destination warehouse
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

// UPDATE ORDER STATUS (AND ADD INVENTORY)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // 1. Find the order by the ID
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2. THE MAGIC: If the order is being marked as RECEIVED, add it to stock!
    if (status === 'RECEIVED' && order.status !== 'RECEIVED') {
      const product = await Product.findById(order.product_id);
      
      if (product) {
        // Increase the stock by the quantity that just arrived
        product.quantity = (product.quantity || 0) + order.quantity;
        
        // Assign the items to the physical warehouse you selected
        if (order.warehouse_id) {
          product.warehouse = order.warehouse_id;
        }
        
        // Save the updated product back to the database
        await product.save();
      }
    }

    // 3. Update the order status and save it
    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error updating order", error: error.message });
  }
};
