import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    reorderSuggestions: [],
    anomalies: [],
    trendData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get('/analytics');
        // Fallback data structure in case the backend is empty
        setAnalytics({
          reorderSuggestions: res.data.reorderSuggestions || [],
          anomalies: res.data.anomalies || [],
          trendData: res.data.trendData?.length ? res.data.trendData : [
            { name: 'Mon', volume: 12 }, { name: 'Tue', volume: 19 },
            { name: 'Wed', volume: 15 }, { name: 'Thu', volume: 22 },
            { name: 'Fri', volume: 30 }, { name: 'Sat', volume: 28 }
          ]
        });
      } catch (err) {
        console.error("Error loading analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse">Running smart analysis...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Smart Analytics</h1>
          <p className="text-slate-500 mt-1">AI-driven insights and forecasting</p>
        </div>
        <div className="bg-brand-50 text-brand-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-brand-100">
          <Brain className="h-5 w-5" /> Intelligence Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-500" /> Movement Velocity
            </h2>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1.5 outline-none">
              <option>Past 7 Days</option>
              <option>Past 30 Days</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Anomalies Detected
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4">
            {analytics.anomalies.length > 0 ? (
              analytics.anomalies.map((anomaly, idx) => (
                <div key={idx} className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-sm font-bold text-amber-900 mb-1">{anomaly.title || 'Unusual Activity'}</p>
                  <p className="text-xs text-amber-700">{anomaly.description}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-slate-600">System Nominal</p>
                <p className="text-xs mt-1">No unusual patterns detected in recent transactions.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reorder Suggestions */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-emerald-500" /> AI Reorder Suggestions
        </h2>
        
        {analytics.reorderSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {analytics.reorderSuggestions.map((item, idx) => (
              <div key={idx} className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    <Package className="h-5 w-5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{item.product_name || item.name}</h3>
                    <p className="text-xs text-slate-500">Current Stock: <span className="font-bold text-red-500">{item.quantity}</span></p>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl mb-4">
                  <p className="text-xs text-slate-600 mb-1">Suggested Reorder Qty:</p>
                  <p className="text-xl font-black text-slate-800">{item.suggested_qty || 50} Units</p>
                </div>
                <button className="w-full py-2.5 bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                  Draft Purchase Order <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p>Stock levels are optimal. No reorders suggested at this time.</p>
          </div>
        )}
      </div>

    </div>
  );
}

// Ensure you import CheckCircle2 at the top if it wasn't there
import { CheckCircle2 } from 'lucide-react';