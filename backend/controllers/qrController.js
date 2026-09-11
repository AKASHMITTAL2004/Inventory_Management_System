import qrcode from "qrcode";
import Product from "../models/Product.js";

// 1. Generate a QR Code for a specific product
export const generateProductQR = async (req, res) => {
  try {
    const { productId } = req.params;
    const orgId = req.user.orgId;

    // Verify the product exists and belongs to this organization
    const product = await Product.findOne({ _id: productId, organization_id: orgId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // The data embedded inside the QR code. We keep it small and JSON-formatted.
    const qrPayload = JSON.stringify({
      productId: product._id,
      sku: product.sku
    });

    // Generate a Base64 image string. The frontend can plug this directly into an <img src="..." /> tag.
    const qrCodeImage = await qrcode.toDataURL(qrPayload);

    res.json({
      productName: product.name,
      qrCodeImage
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating QR code" });
  }
};

// 2. Fetch product details instantly after scanning a QR code
export const getProductByQR = async (req, res) => {
  try {
    const { productId } = req.params;
    const orgId = req.user.orgId;

    const product = await Product.findOne({ _id: productId, organization_id: orgId })
      .populate("warehouse_id", "name")
      .populate("supplier_id", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found from this QR scan" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error resolving QR code data" });
  }
};