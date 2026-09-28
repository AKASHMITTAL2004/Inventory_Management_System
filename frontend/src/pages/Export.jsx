import React, { useState } from 'react';
import API from '../services/api';
import { FileDown, FileText, CheckCircle2, Download, Printer } from 'lucide-react';

export default function Export() {
  const [reportType, setReportType] = useState('inventory');
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 1. NATIVE CSV GENERATOR
  const generateCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. NATIVE PDF GENERATOR (Uses Browser Print Engine)
  const generatePDF = (data, title) => {
    const headers = Object.keys(data[0]);
    const printWindow = window.open('', '_blank');
    
    const tableHeaders = headers.map(h => `<th style="border: 1px solid #cbd5e1; padding: 12px; text-align: left; background-color: #f8fafc; color: #334155;">${h.replace(/_/g, ' ')}</th>`).join('');
    const tableRows = data.map(row => 
      `<tr>${headers.map(h => `<td style="border: 1px solid #cbd5e1; padding: 12px; color: #475569;">${row[h] || ''}</td>`).join('')}</tr>`
    ).join('');

    const htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; }
            table { border-collapse: collapse; width: 100%; font-size: 14px; margin-top: 20px; }
            h1 { color: #0f172a; margin-bottom: 5px; }
            p { color: #64748b; margin-top: 0; margin-bottom: 30px;}
          </style>
        </head>
        <body>
          <h1>${title.replace(/_/g, ' ')}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <script>
            window.onload = () => { 
              window.print(); 
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      let exportData = [];
      let filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}`;

      // Fetch the raw data based on dropdown selection
      if (reportType === 'inventory') {
        const res = await API.get('/inventory/products', config);
        exportData = res.data.map(p => ({
          SKU: p.sku || 'N/A',
          Product_Name: p.name,
          Category: p.category || 'General',
          Stock_Quantity: p.quantity || 0,
          Unit_Price: `$${p.price?.toLocaleString() || 0}`,
          Total_Value: `$${((p.quantity || 0) * (p.price || 0)).toLocaleString()}`
        }));
      } 
      else if (reportType === 'transactions') {
        const res = await API.get('/orders', config);
        exportData = res.data.map(o => ({
          Order_ID: o._id.slice(-6).toUpperCase(),
          Supplier: o.supplier || o.supplier_id?.name || 'N/A',
          Status: o.status,
          Quantity: o.quantity,
          Date: new Date(o.createdAt || Date.now()).toLocaleDateString()
        }));
      }
      else if (reportType === 'low-stock') {
        const res = await API.get('/inventory/products', config);
        exportData = res.data
          .filter(p => (p.quantity || 0) <= (p.minStockThreshold || 500))
          .map(p => ({
            SKU: p.sku || 'N/A',
            Product_Name: p.name,
            Current_Stock: p.quantity || 0,
            Alert_Status: 'CRITICAL LOW'
          }));
      }

      // Check if data is empty
      if (exportData.length === 0) {
        setLoading(false);
        return alert("No data found to export for this category.");
      }

      // Trigger actual downloads
      if (format === 'csv') {
        generateCSV(exportData, filename);
      } else {
        generatePDF(exportData, filename);
      }

      setSuccessMessage(`Successfully generated and downloaded ${reportType.toUpperCase()} report as ${format.toUpperCase()}!`);
    } catch (err) {
      console.error("Export error", err);
      alert("Error generating report. Ensure your backend routes are working.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Export Reports</h1>
          <p className="text-slate-500 mt-1">Generate and download audit-ready compliance and inventory reports</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 max-w-2xl mx-auto w-full">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileDown className="h-5 w-5 text-brand-500" /> Report Configuration
        </h2>

        <form onSubmit={handleExport} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Report Dataset</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
            >
              <option value="inventory">Full Inventory Valuation & Stock Catalog</option>
              <option value="transactions">Transaction Movement Ledger (Inbound/Outbound)</option>
              <option value="low-stock">Low Stock & Reorder Vulnerability Audit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Export File Format</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  format === 'csv' 
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="h-4 w-4" /> CSV Spreadsheet
              </button>
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  format === 'pdf' 
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Printer className="h-4 w-4" /> Formatted PDF
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download className="h-5 w-5" />}
            Generate & Download Report
          </button>
        </form>

        {successMessage && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
