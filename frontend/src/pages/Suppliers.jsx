import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Truck, Plus, Mail, Phone, Star } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', category: '' });

  useEffect(() => {
    // Mock or fetch suppliers
    setSuppliers([
      { _id: '1', name: 'Apex Medical Supplies', email: 'orders@apexmed.com', phone: '+1 (555) 382-9100', category: 'Pharmaceuticals', rating: 4.8 },
      { _id: '2', name: 'Global Tech Components', email: 'supply@globaltech.io', phone: '+1 (555) 918-2234', category: 'Electronics', rating: 4.5 }
    ]);
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    setSuppliers(prev => [...prev, { _id: Date.now().toString(), ...formData, rating: 5.0 }]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', phone: '', category: '' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Suppliers & Vendors</h1>
          <p className="text-slate-500 mt-1">Manage vendor directories, lead times, and contact points</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="h-5 w-5" /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map(s => (
          <div key={s._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{s.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      {s.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-100">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {s.rating}
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600 mb-6">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" /> {s.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" /> {s.phone}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                View Catalog
              </button>
              <button className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-colors">
                Draft Purchase Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Supplier</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vendor Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}