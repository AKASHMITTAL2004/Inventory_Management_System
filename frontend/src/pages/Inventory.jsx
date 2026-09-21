import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Search, Filter, Plus, Package, Edit2, Trash2, AlertCircle, Info } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Items');
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userIndustry = user?.industry || 'General';

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [formData, setFormData] = useState({
    sku: '', name: '', category: '', quantity: 0, price: 0, min_stock: 10, unit: 'piece', cost: 0, attributes: {}
  });

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get('/inventory/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error loading products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAttributeChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [key]: value }
    }));
  };

  const handleEdit = (product) => {
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category || '',
      quantity: product.quantity,
      price: product.price || 0,
      min_stock: product.minThreshold || product.min_stock || 10,
      unit: product.unit || 'piece',
      cost: product.cost || 0,
      attributes: product.extraFields || product.attributes || {}
    });
    setEditingId(product._id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // Map frontend fields to backend schema expectations safely
      const payload = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        quantity: formData.quantity,
        price: formData.price,
        unit: formData.unit,
        cost: formData.cost,
        minThreshold: formData.min_stock,
        extraFields: formData.attributes
      };

      if (editingId) {
        await API.put(`/inventory/products/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await API.post('/inventory/products', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ sku: '', name: '', category: '', quantity: 0, price: 0, min_stock: 10, unit: 'piece', cost: 0, attributes: {} });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving product.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");
        await API.delete(`/inventory/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
      } catch (err) {
        alert("Error deleting product.");
      }
    }
  };

  const stats = {
    'All Items': products.length,
    'Low Stock': products.filter(p => p.quantity <= (p.minThreshold || p.min_stock) && p.quantity > 0).length,
    'Out of Stock': products.filter(p => p.quantity === 0).length
  };

  const filteredProducts = products.filter(p => {
    const minLimit = p.minThreshold || p.min_stock || 10;
    const matchesTab = 
      activeTab === 'All Items' || 
      (activeTab === 'Low Stock' && p.quantity <= minLimit && p.quantity > 0) ||
      (activeTab === 'Out of Stock' && p.quantity === 0);
      
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
                          
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Inventory Catalog</h1>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ sku: '', name: '', category: '', quantity: 0, price: 0, min_stock: 10, unit: 'piece', cost: 0, attributes: {} });
            setIsModalOpen(true);
          }}
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="h-5 w-5" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        
        {/* Tab Bar */}
        <div className="flex items-center gap-6 px-8 pt-6 border-b border-slate-100">
          {['All Items', 'Low Stock', 'Out of Stock'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === tab 
                  ? (tab === 'Out of Stock' ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600') 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {stats[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-6 flex gap-4 border-b border-slate-50 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or SKU..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <Filter className="h-4 w-4" /> Category Filter
          </button>
        </div>

        {/* List View */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center">
              <Package className="h-12 w-12 mb-3 text-slate-300" />
              <p>No products match your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(p => {
                const minLimit = p.minThreshold || p.min_stock || 10;
                return (
                <div key={p._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                      <Package className="h-6 w-6 text-brand-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{p.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-500 border-slate-200">
                          {p.sku}
                        </span>
                        {p.quantity <= minLimit && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100">
                            <AlertCircle className="h-3 w-3" /> Low Stock
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Category: {p.category || 'General'}</span>
                        <span>•</span>
                        <span>Price: ${p.price?.toFixed(2)}</span>
                      </div>
                      {((p.extraFields && Object.keys(p.extraFields).length > 0) || (p.attributes && Object.keys(p.attributes).length > 0)) && (
                        <div className="text-[10px] text-slate-400 mt-1 flex gap-2">
                          {Object.entries(p.extraFields || p.attributes).map(([k, v]) => (
                            <span key={k} className="bg-slate-50 px-1.5 py-0.5 rounded">{k}: {v}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className={`block text-xl font-black ${p.quantity === 0 ? 'text-red-500' : 'text-slate-800'}`}>
                        {p.quantity} <span className="text-sm font-medium text-slate-400">in stock</span>
                      </span>
                    </div>
                    
                    <div className="flex gap-2 border-l border-slate-100 pl-6">
                      <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">SKU</label>
                  <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required disabled={!!editingId} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                  <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" disabled={!!editingId} title={editingId ? "Use Transactions to update stock" : ""} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Price ($)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Min Stock</label>
                  <input type="number" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" />
                </div>
              </div>

              {/* Required fields for Unit & Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Unit Type</label>
                  <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="e.g. piece" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Unit Cost ($)</label>
                  <input type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
                </div>
              </div>

              {/* Industry-Specific Dynamic Fields (Bulletproof Case-Insensitive Matching) */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mt-4">
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {userIndustry} Requirements
                </h3>
                
                {userIndustry.toLowerCase().includes('pharmacy') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">Expiry Date</label>
                      <input type="date" value={formData.attributes.expiryDate || ''} onChange={e => handleAttributeChange('expiryDate', e.target.value)} className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">Batch Number</label>
                      <input type="text" value={formData.attributes.batchNumber || ''} onChange={e => handleAttributeChange('batchNumber', e.target.value)} className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                    </div>
                  </div>
                )}

                {userIndustry.toLowerCase().includes('electronic') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">Serial Number</label>
                      <input type="text" value={formData.attributes.serialNumber || ''} onChange={e => handleAttributeChange('serialNumber', e.target.value)} className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">Warranty (Months)</label>
                      <input type="number" value={formData.attributes.warrantyMonths || ''} onChange={e => handleAttributeChange('warrantyMonths', e.target.value)} className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                    </div>
                  </div>
                )}
                
                {!userIndustry.toLowerCase().includes('pharmacy') && !userIndustry.toLowerCase().includes('electronic') && (
                  <p className="text-sm text-blue-700">Standard general tracking applied.</p>
                )}
              </div>

              <div className="flex gap-3 pt-6 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20">
                  {editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
