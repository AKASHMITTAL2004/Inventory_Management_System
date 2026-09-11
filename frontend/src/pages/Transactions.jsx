import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Search, Filter, Plus, Clock, CheckCircle2, Package, Check, X } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'INBOUND',
    quantity: 1,
    notes: ''
  });
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [transRes, prodRes] = await Promise.all([
        API.get('/transactions'),
        API.get('/inventory/products') // Need products for the dropdown menu!
      ]);
      setTransactions(transRes.data);
      setProducts(prodRes.data);
      
      // Auto-select first product in form if available
      if (prodRes.data.length > 0) {
        setFormData(prev => ({ ...prev, product_id: prodRes.data[0]._id }));
      }
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Workflow Approval
  const handleApproval = async (id, action) => {
    try {
      await API.patch(`/transactions/${id}/approve`, { status: action });
      fetchData();
    } catch (err) {
      alert("Error updating transaction status.");
    }
  };

  // Create New Transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/transactions', formData);
      setIsModalOpen(false);
      setFormData({ ...formData, quantity: 1, notes: '' }); // Reset form
      fetchData(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating transaction');
    }
  };

  const stats = {
    All: transactions.length,
    Inbound: transactions.filter(t => t.type === 'INBOUND').length,
    Outbound: transactions.filter(t => t.type === 'OUTBOUND').length,
    Pending: transactions.filter(t => t.status === 'PENDING').length
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return t.status === 'PENDING';
    return t.type === activeTab.toUpperCase();
  });

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Transactions</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="h-5 w-5" /> New Transaction
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar */}
        <div className="flex items-center gap-6 px-8 pt-6 border-b border-slate-100">
          {['All', 'Inbound', 'Outbound', 'Pending'].map(tab => (
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

        {/* List View */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading records...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No transactions found.</div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map(t => (
                <div key={t._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">Txn #{t._id.slice(-6).toUpperCase()}</span>
                        {t.status === 'PENDING' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          t.type === 'INBOUND' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                        }`}>
                          {t.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{new Date(t.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>Item: {t.product_id?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className={`block text-lg font-bold ${t.type === 'INBOUND' ? 'text-blue-600' : 'text-purple-600'}`}>
                        {t.type === 'INBOUND' ? '+' : '-'}{t.quantity} Units
                      </span>
                      <span className="text-xs text-slate-400">By {t.user_id?.name || 'System'}</span>
                    </div>
                    
                    {/* Approval Workflow Actions */}
                    {t.status === 'PENDING' && (user.role === 'admin' || user.role === 'manager') && (
                      <div className="flex gap-2 border-l border-slate-100 pl-6">
                        <button onClick={() => handleApproval(t._id, 'COMPLETED')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Approve">
                          <Check className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleApproval(t._id, 'REJECTED')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Reject">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RESTORED: Create Transaction Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Log Movement</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Product</label>
                <select 
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                  required
                >
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                  >
                    <option value="INBOUND">Inbound</option>
                    <option value="OUTBOUND">Outbound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notes (Optional)</label>
                <input 
                  type="text" 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Reason for movement..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}