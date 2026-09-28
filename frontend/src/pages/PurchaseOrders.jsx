import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { ShoppingCart, Plus, Search, Filter, Clock, CheckCircle2, Truck } from 'lucide-react';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [formData, setFormData] = useState({
    supplier: '',
    product_id: '',
    quantity: 10,
    expectedDate: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const prodRes = await API.get('/inventory/products', config);
      setProducts(prodRes.data);

      const suppRes = await API.get('/inventory/suppliers', config);
      setSuppliers(suppRes.data);

      try {
        const orderRes = await API.get('/orders', config);
        setOrders(orderRes.data);
      } catch (orderErr) {
        console.warn("Backend /orders route is missing or failing. Defaulting to empty array.");
        setOrders([]); 
      }
      
    } catch (err) {
      console.error("Error loading essential form data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const vendorId = searchParams.get('vendor');
    if (vendorId && suppliers.length > 0) {
      setIsModalOpen(true);
      setFormData(prev => ({ ...prev, supplier: vendorId }));
    }
  }, [searchParams, suppliers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await API.post('/orders', {
        supplier_id: formData.supplier,
        product_id: formData.product_id,
        quantity: formData.quantity,
        expectedDate: formData.expectedDate,
        notes: formData.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders([response.data, ...orders]);
      setIsModalOpen(false);
      setFormData({ supplier: '', product_id: '', quantity: 10, expectedDate: '', notes: '' });
    } catch (err) {
      console.error("Failed to save purchase order", err);
      alert("Error saving order. Have you built the POST /orders route on your backend yet?");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      await API.put(`/orders/${orderId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      
    } catch (err) {
      console.error("Error updating order status", err);
      alert("Failed to update status. Check if PUT /orders/:id is built on your backend.");
    }
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
                      <span className="block text-lg font-bold text-slate-800">${po.total?.toLocaleString() || 0}</span>
                      <span className="text-xs text-slate-400">{po.quantity} Units</span>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedOrder(po)}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200"
                    >
                      View Details
                    </button>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create Purchase Order</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vendor / Supplier</label>
                <select value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required>
                  <option value="">Select a vendor...</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.contactName})</option>
                  ))}
                </select>
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

      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Order Details</h2>
                <p className="text-sm text-slate-500 font-mono mt-1">PO: {selectedOrder._id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedOrder.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedOrder.status || 'Pending Approval'}
              </span>
            </div>

            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Vendor</p>
                  <p className="font-bold text-slate-800">{selectedOrder.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Total Value</p>
                  <p className="font-bold text-slate-800">${selectedOrder.total?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Product</p>
                  <p className="font-bold text-slate-800">{selectedOrder.product}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Quantity Ordered</p>
                  <p className="font-bold text-slate-800">{selectedOrder.quantity} Units</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Expected Date</p>
                  <p className="font-bold text-slate-800">{selectedOrder.date}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Close Window
              </button>
              
              {selectedOrder.status === 'PENDING' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'ORDERED')}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg transition-colors"
                >
                  Approve & Send to Vendor
                </button>
              )}

              {selectedOrder.status === 'ORDERED' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'RECEIVED')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors"
                >
                  Mark as Received
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
