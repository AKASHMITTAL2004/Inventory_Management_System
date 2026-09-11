import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import Product from "../models/Product.js";

// Generate a PDF Valuation Report
export const exportPDF = async (req, res) => {
  try {
    const products = await Product.find({ organization_id: req.user.orgId });

    // Tell the browser to expect a PDF file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="Stock_Report.pdf"');

    const doc = new PDFDocument();
    doc.pipe(res); // Connect the PDF generator directly to the HTTP response

    // Build the PDF content
    doc.fontSize(20).text("Inventory Valuation Report", { align: "center" });
    doc.moveDown();

    let totalValue = 0;
    products.forEach(p => {
      const value = p.quantity * p.cost;
      totalValue += value;
      doc.fontSize(12).text(`${p.name} (SKU: ${p.sku})`);
      doc.fontSize(10).text(`Stock: ${p.quantity} ${p.unit} | Cost: $${p.cost} | Total: $${value}`);
      doc.moveDown();
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total Inventory Value: $${totalValue}`, { align: "right" });

    doc.end(); // Finishes the document and sends it to the user
  } catch (error) {
    res.status(500).json({ message: "Error generating PDF" });
  }
};

// Generate an Excel Data Dump
export const exportExcel = async (req, res) => {
  try {
    const products = await Product.find({ organization_id: req.user.orgId });

    // Tell the browser to expect an Excel file download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="Inventory_Dump.xlsx"');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventory");

    // Define the columns for our spreadsheet
    worksheet.columns = [
      { header: "Product Name", key: "name", width: 25 },
      { header: "SKU", key: "sku", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Unit Cost", key: "cost", width: 15 }
    ];

    // Add data rows
    products.forEach(p => {
      worksheet.addRow({
        name: p.name,
        sku: p.sku,
        category: p.category,
        quantity: p.quantity,
        cost: p.cost
      });
    });

    // Write the file to the HTTP response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Error generating Excel file" });
  }
};