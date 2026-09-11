import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Clock, User, AlertTriangle, CheckCircle, Activity, Download } from 'lucide-react';

export default function SecurityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating fetching security logs from a backend audit collection
    setTimeout(() => {
      setLogs([
        { id: 'evt_901', user: 'Admin User', email: 'admin@enterprise.com', action: 'EXPORT_INVENTORY', resource: 'Full Catalog CSV', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), severity: 'info', ip: '192.168.1.45' },
        { id: 'evt_902', user: 'Sarah Jenkins', email: 's.jenkins@enterprise.com', action: 'DELETE_PRODUCT', resource: 'SKU-4921 (Vaccine Vial)', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), severity: 'critical', ip: '192.168.1.112' },
        { id: 'evt_903', user: 'System Auto', email: 'system@enterprise.com', action: 'ANOMALY_DETECTED', resource: 'Warehouse B Capacity', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), severity: 'warning', ip: 'internal' },
        { id: 'evt_904', user: 'Marcus Vance', email: 'm.vance@enterprise.com', action: 'USER_LOGIN', resource: 'Web Portal', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), severity: 'success', ip: '10.0.0.5' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'success': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Audit Security Log</h1>
          <p className="text-slate-500 mt-1">Immutable ledger of system events, access logs, and critical actions</p>
        </div>
        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm">
          <Download className="h-4 w-4" /> Export Log
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-6 flex gap-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search events, users, or IP addresses..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <Filter className="h-4 w-4" /> Event Type
          </button>
        </div>

        {/* Audit List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading security logs...</div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
                  
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 mt-1 rounded-xl flex items-center justify-center border ${getSeverityStyle(log.severity)}`}>
                      {getSeverityIcon(log.severity)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{log.action.replace(/_/g, ' ')}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getSeverityStyle(log.severity)}`}>
                          {log.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-2">Target: <span className="font-semibold">{log.resource}</span></p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {log.user} ({log.email})</span>
                        <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> IP: {log.ip}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                    <span className="mt-3 text-[10px] text-slate-300 font-mono">ID: {log.id}</span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}