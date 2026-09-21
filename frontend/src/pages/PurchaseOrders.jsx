import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShoppingCart, Plus, Search, Filter, Clock, CheckCircle2, Truck, Package } from 'lucide-react';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    supplier: '',
    product_id: '',
    quantity: 10,
    expectedDate: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      // 1. Fetch live products for the dropdown
      const prodRes = await API.get('/inventory/products');
      setProducts(prodRes.data);
      
      // 2. Fetch live purchase orders from your database
      const orderRes = await API.get('/orders'); 
      setOrders(orderRes.data);
    } catch (err) {
      console.error("Error loading purchase orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    const selectedProd = products.find(p => p._id === formData.product_id);
    const newPO = {
      _id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: formData.supplier || 'Default Vendor',
      product: selectedProd ? selectedProd.name : 'Custom Item',
      quantity: formData.quantity,
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      total: formData.quantity * (selectedProd?.price || 20)
    };
    setOrders([newPO, ...orders]);
    setIsModalOpen(false);
    setFormData({ supplier: '', product_id: '', quantity: 10, expectedDate: '', notes: '' });
  };

  const stats = {
    All: orders.length,
    Pending: orders.filter(o => o.status === 'PENDING').length,
    Ordered: orders.filter(o => o.status === 'ORDERED').length,
    Received: orders.filter(o => o.status === 'RECEIVED').length
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'All') return true;
    return o.status === activeTab.toUpperCase();
  });

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Purchase Orders</h1>
          <p className="text-slate-500 mt-1">Manage vendor procurement, restocking pipelines, and inbound shipments</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="h-5 w-5" /> New Purchase Order
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar */}
        <div className="flex items-center gap-6 px-8 pt-6 border-b border-slate-100">
          {['All', 'Pending', 'Ordered', 'Received'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {stats[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="p-6 flex gap-4 border-b border-slate-50 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by PO number or vendor..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <Filter className="h-4 w-4" /> Filter Status
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading purchase orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No purchase orders found.</div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(po => (
                <div key={po._id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 text-indigo-600">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{po._id}</span>
                        {po.status === 'PENDING' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                            <Clock className="h-3 w-3" /> Pending Approval
                          </span>
                        )}
                        {po.status === 'ORDERED' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                            <Truck className="h-3 w-3" /> In Transit
                          </span>
                        )}
                        {po.status === 'RECEIVED' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" /> Delivered
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                          {po.supplier}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Item: <strong className="text-slate-700">{po.product}</strong></span>
                        <span>•</span>
                        <span>Ordered on {po.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="block text-lg font-bold text-slate-800">${po.total.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">{po.quantity} Units</span>
                    </div>
                    <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create Purchase Order</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vendor / Supplier Name</label>
                <input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="e.g. Apex Medical" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Product to Restock</label>
                <select value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required>
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                  <input type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Expected Date</label>
                  <input type="date" value={formData.expectedDate} onChange={e => setFormData({...formData, expectedDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/20">Submit Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
