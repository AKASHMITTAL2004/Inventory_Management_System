import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  DollarSign, AlertTriangle, Package, Activity, ArrowDownLeft, ArrowUpRight, CheckCircle2, Circle
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  // Added state for real-time calculations
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [data, setData] = useState({
    summary: { totalValuation: 0, lowStockCount: 0, totalProducts: 0 },
    charts: { categoryDistribution: [], volume: { inbound: 0, outbound: 0 } },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch all necessary data simultaneously without crashing if one is missing
      const [dashRes, prodRes, wareRes, suppRes] = await Promise.all([
        API.get('/dashboard', config).catch(() => ({ data: data })),
        API.get('/inventory/products', config).catch(() => ({ data: [] })),
        API.get('/inventory/warehouses', config).catch(() => API.get('/warehouses', config)).catch(() => ({ data: [] })),
        API.get('/inventory/suppliers', config).catch(() => ({ data: [] }))
      ]);

      if (dashRes.data) setData(dashRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      if (wareRes.data) setWarehouses(wareRes.data);
      if (suppRes.data) setSuppliers(suppRes.data);

    } catch (err) {
      console.error("Error fetching dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  // --- DYNAMIC CALCULATIONS ---

  // 1. Calculate Total Valuation from actual products
  const totalValuation = products.reduce((total, p) => total + ((p.quantity || 0) * (p.price || 0)), 0);
  
  // 2. Count Low Stock items
  const lowStockCount = products.filter(p => (p.quantity || 0) <= (p.minStockThreshold || 500)).length;

  // 3. Aggregate Categories dynamically for the Pie Chart
  const categoryMap = {};
  products.forEach(p => {
    const cat = p.category || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + (p.quantity || 1);
  });
  const dynamicCategoryDistribution = Object.keys(categoryMap).length > 0 
    ? Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }))
    : [{ name: 'Empty', value: 1 }];

  // 4. Calculate Profile Completeness automatically
  const profileSteps = [
    { name: "Register business account", completed: true },
    { name: "Add first warehouse", completed: warehouses.length > 0 },
    { name: "Connect a supplier", completed: suppliers.length > 0 },
    { name: "Log first product", completed: products.length > 0 },
  ];
  const progressPercentage = (profileSteps.filter(s => s.completed).length / profileSteps.length) * 100;

  const volumeData = [
    { name: 'Inbound', volume: data.charts.volume?.inbound || 0, fill: '#10b981' },
    { name: 'Outbound', volume: data.charts.volume?.outbound || 0, fill: '#3b82f6' }
  ];

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse">Loading premium dashboard...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-full">
      
      {/* SaaS Hero Banner */}
      <div className="bg-[#0f172a] rounded-3xl p-10 mb-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">Greetings, {user?.name?.split(' ')[0] || 'Admin'}!</h1>
          <p className="text-slate-400 text-lg mb-6">
            Welcome to your premium inventory command center. Follow the setup wizard to get your warehouse fully configured and ready for scale.
          </p>
          <button className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            View Analytics Report
          </button>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at right, #4f46e5 0%, transparent 70%)' }}></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* MAIN CONTENT */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* KPI Cards */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Overview Report</h2>
              <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 outline-none">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Total Valuation</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-black tracking-tight text-slate-900">${totalValuation.toLocaleString()}</h3>
                  {totalValuation > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1">
                      ↑ 12.5%
                    </span>
                  )}
                </div>
              </div>

              <div className="border-l border-slate-100 pl-8">
                <p className="text-sm font-medium text-slate-500 mb-2">Active Products</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-black tracking-tight text-slate-900">{products.length}</h3>
                  {products.length > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1">
                      ↑ Active
                    </span>
                  )}
                </div>
              </div>

              <div className="border-l border-slate-100 pl-8">
                <p className="text-sm font-medium text-slate-500 mb-2">Low Stock Alerts</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-black tracking-tight text-slate-900">{lowStockCount}</h3>
                  {lowStockCount > 0 ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md mb-1">
                      Action Needed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1">
                      Optimal
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Inventory by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dynamicCategoryDistribution} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                      {dynamicCategoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Movement Volume</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="volume" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-500" /> Live Activity Stream
            </h3>
            <div className="space-y-4">
              {data.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-sm border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div className={`p-2 rounded-lg ${activity.type === 'INBOUND' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {activity.type === 'INBOUND' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">
                        {activity.quantity}x {activity.product_id?.name || 'Item'} {activity.type === 'INBOUND' ? 'received' : 'dispatched'}
                      </p>
                      <p className="text-xs text-slate-400">By {activity.user_id?.name || 'System'} • {new Date(activity.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm p-4 bg-slate-50 rounded-xl">No recent movement activity detected yet.</p>
              )}
            </div>
          </div> 
        </div>

        {/* RIGHT SIDEBAR (Setup Wizard) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Profile Completeness</h3>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Store Configuration</h4>
            <ul className="space-y-4">
              {profileSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${step.completed ? 'text-slate-700' : 'text-slate-500'}`}>
                    {step.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
