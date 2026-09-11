import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { QrCode, Camera, Download, RefreshCw, Package, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function QRManager() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  
  // Scanner state
  const [scannedResult, setScannedResult] = useState(null);
  const [scannedProductDetails, setScannedProductDetails] = useState(null);
  const [scanError, setScanError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/inventory/products');
        setProducts(res.data);
        if (res.data.length > 0) {
          setSelectedProduct(res.data[0]._id);
        }
      } catch (err) {
        console.error("Error loading products", err);
      }
    };
    fetchProducts();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setLoading(true);
    try {
      const res = await API.get(`/qr/generate/${selectedProduct}`);
      setQrCodeUrl(res.data.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD-${selectedProduct}`);
    } catch (err) {
      // Fallback external generator if specific backend route is pending
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROD-${selectedProduct}`);
    } finally {
      setLoading(false);
    }
  };

  // Simulating or handling a successful camera scan lookup
  const handleSimulatedScan = async (productIdOrSku) => {
    setLoading(true);
    setScanError('');
    try {
      const res = await API.get(`/inventory/products`);
      const found = res.data.find(p => p._id === productIdOrSku || p.sku === productIdOrSku);
      if (found) {
        setScannedProductDetails(found);
        setScannedResult(found.name);
      } else {
        setScanError('Product code not recognized in system inventory.');
        setScannedProductDetails(null);
      }
    } catch (err) {
      setScanError('Failed to query inventory database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">QR Code Manager</h1>
          <p className="text-slate-500 mt-1">Generate product tags and process live scans</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 px-8 pt-6 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'generate' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <QrCode className="h-4 w-4" /> Generate QR Tags
          </button>
          <button 
            onClick={() => setActiveTab('scan')}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'scan' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Camera className="h-4 w-4" /> Live Camera Scanner
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'generate' ? (
            <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-100 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Create Printable QR Tag</h2>
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Product</label>
                  <select 
                    value={selectedProduct} 
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500 shadow-sm"
                  >
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <QrCode className="h-5 w-5" />}
                  Generate QR Code
                </button>
              </form>

              {qrCodeUrl && (
                <div className="mt-8 p-6 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center shadow-sm">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                    <img src={qrCodeUrl} alt="Generated QR Code" className="w-48 h-48 object-contain" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-4">Ready for warehouse labeling</p>
                  <a 
                    href={qrCodeUrl} 
                    download="product-qr.png" 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Download QR Image
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-xl mx-auto text-center py-8">
              <div className="h-16 w-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
                <Camera className="h-8 w-8 text-brand-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Camera Scanner Ready</h2>
              <p className="text-slate-500 text-sm mb-6">
                Scan item tags or test lookup via product ID.
              </p>
              
              <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-col items-center justify-center h-48 border border-slate-800 shadow-xl relative overflow-hidden mb-6">
                <div className="absolute inset-0 border-2 border-brand-500/50 rounded-2xl m-4 pointer-events-none animate-pulse"></div>
                <Camera className="h-10 w-10 text-slate-600 mb-3 animate-bounce" />
                <p className="text-sm font-medium text-slate-400">Stream active. Position code inside frame.</p>
              </div>

              {/* Quick test selector to simulate scanning a real item */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Simulate Camera Read (Test Item)</label>
                <div className="flex gap-2">
                  <select 
                    id="simScanSelect"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => {
                      const val = document.getElementById('simScanSelect').value;
                      handleSimulatedScan(val);
                    }}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Simulate Read
                  </button>
                </div>
              </div>

              {scannedProductDetails && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-left flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-600 uppercase">Match Found</p>
                      <p className="font-bold text-slate-800">{scannedProductDetails.name} — Qty: {scannedProductDetails.quantity}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">
                    Log Movement
                  </button>
                </div>
              )}

              {scanError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-left flex items-center gap-3 text-red-700 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}