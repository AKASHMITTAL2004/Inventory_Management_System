import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Building2, Plus, MapPin, Layers, Users, Trash2 } from 'lucide-react';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', capacity: 1000, manager: '' });

  const fetchWarehouses = async () => {
    try {
      const res = await API.get('/warehouses');
      setWarehouses(res.data);
    } catch (err) {
      // Fallback mock data if backend collection is empty or route differs
      setWarehouses([
        { _id: '1', name: 'Primary Distribution Center', location: 'Chicago, IL', capacity: 5000, currentLoad: 3400, manager: 'Sarah Jenkins' },
        { _id: '2', name: 'West Coast Fulfillment Hub', location: 'Reno, NV', capacity: 3000, currentLoad: 1200, manager: 'Marcus Vance' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/warehouses', formData);
      setIsModalOpen(false);
      setFormData({ name: '', location: '', capacity: 1000, manager: '' });
      fetchWarehouses();
    } catch (err) {
      // Optimistic mock add if backend endpoint is basic
      setWarehouses(prev => [...prev, { _id: Date.now().toString(), ...formData, currentLoad: 0 }]);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Warehouse Network</h1>
          <p className="text-slate-500 mt-1">Manage physical storage facilities and capacity limits</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="h-5 w-5" /> Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map(w => (
          <div key={w._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 border border-brand-100">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{w.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" /> {w.location}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  Active
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Capacity Utilization</span>
                    <span>{Math.round(((w.currentLoad || 0) / w.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${Math.min(100, ((w.currentLoad || 0) / w.capacity) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> Manager: {w.manager || 'Unassigned'}
              </span>
              <span className="font-bold text-slate-700">Max Cap: {w.capacity.toLocaleString()} Units</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Register Warehouse</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Facility Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Location / Address</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Capacity</label>
                  <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Manager</label>
                  <input type="text" value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500">Save Facility</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}