import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import QRManager from './pages/QRManager';
import Export from './pages/Export';
import Settings from './pages/Settings';
import Warehouses from './pages/Warehouses';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import SecurityLog from './pages/SecurityLog';
import Team from './pages/Team';
import { 
  LayoutDashboard, Package, LogOut, ArrowLeftRight, Brain, QrCode, FileDown, 
  Search, Building2, Truck, ShoppingCart, ShieldAlert, Users, Sliders, Menu, X
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, children, badge, badgeColor = "bg-brand-500", onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
        isActive 
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" /> {children}
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${badgeColor}`}>
          {badge}
        </span>
      )}
    </Link>
  );
};

const Layout = ({ children, user, handleLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      
      {/* Mobile Top Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-[#0B1120] flex items-center justify-between px-4 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">I</div>
          <h1 className="text-sm font-bold text-white tracking-wide">Inventory Pro</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Expanded Enterprise Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 w-72 bg-[#0B1120] flex flex-col shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 sticky top-0 bg-[#0B1120] z-10 hidden md:block">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30">I</div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">Inventory Pro</h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Enterprise Edition</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Global search..." 
              className="w-full bg-[#151f32] text-white placeholder-slate-500 text-xs rounded-xl py-2.5 pl-10 pr-4 border border-slate-800 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 md:pb-6 space-y-1 mt-12 md:mt-0">
          <NavItem to="/" icon={LayoutDashboard} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavItem>
          
          {/* CORE OPERATIONS */}
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2 px-4">Core Operations</div>
          <NavItem to="/inventory" icon={Package} badge="57" badgeColor="bg-brand-500" onClick={() => setIsMobileMenuOpen(false)}>Products Catalog</NavItem>
          <NavItem to="/transactions" icon={ArrowLeftRight} badge="4" badgeColor="bg-amber-500" onClick={() => setIsMobileMenuOpen(false)}>Stock Movements</NavItem>
          <NavItem to="/purchase-orders" icon={ShoppingCart} onClick={() => setIsMobileMenuOpen(false)}>Purchase Orders</NavItem>

          {/* SUPPLY CHAIN */}
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2 px-4">Supply Chain</div>
          <NavItem to="/warehouses" icon={Building2} onClick={() => setIsMobileMenuOpen(false)}>Warehouses</NavItem>
          <NavItem to="/suppliers" icon={Truck} onClick={() => setIsMobileMenuOpen(false)}>Suppliers & Vendors</NavItem>
          <NavItem to="/qr-scanner" icon={QrCode} badge="Active" badgeColor="bg-emerald-500" onClick={() => setIsMobileMenuOpen(false)}>Barcode & QR Suite</NavItem>

          {/* INTELLIGENCE & REPORTS */}
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2 px-4">Intelligence</div>
          <NavItem to="/analytics" icon={Brain} badge="AI" badgeColor="bg-purple-500" onClick={() => setIsMobileMenuOpen(false)}>Smart Forecasts</NavItem>
          <NavItem to="/export" icon={FileDown} onClick={() => setIsMobileMenuOpen(false)}>Auditing & Reports</NavItem>

          {/* GOVERNANCE & ADMIN */}
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2 px-4">Governance</div>
          <NavItem to="/team" icon={Users} onClick={() => setIsMobileMenuOpen(false)}>Team & Permissions</NavItem>
          <NavItem to="/security-log" icon={ShieldAlert} badge="4" badgeColor="bg-red-500" onClick={() => setIsMobileMenuOpen(false)}>Audit Security Log</NavItem>
          <NavItem to="/settings" icon={Sliders} onClick={() => setIsMobileMenuOpen(false)}>System Preferences</NavItem>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/50 bg-[#080e1a]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="h-9 w-9 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="User Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">{user?.name?.[0] || 'A'}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@enterprise.com'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/40 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-xl transition-all">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7fe] overflow-y-auto md:pt-0 pt-16">
        {children}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login setAuth={setUser} /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Layout user={user} handleLogout={handleLogout}><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/inventory" element={user ? <Layout user={user} handleLogout={handleLogout}><Inventory /></Layout> : <Navigate to="/login" />} />
        <Route path="/transactions" element={user ? <Layout user={user} handleLogout={handleLogout}><Transactions /></Layout> : <Navigate to="/login" />} />
        <Route path="/analytics" element={user ? <Layout user={user} handleLogout={handleLogout}><Analytics /></Layout> : <Navigate to="/login" />} />
        <Route path="/qr-scanner" element={user ? <Layout user={user} handleLogout={handleLogout}><QRManager /></Layout> : <Navigate to="/login" />} />
        <Route path="/export" element={user ? <Layout user={user} handleLogout={handleLogout}><Export /></Layout> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Layout user={user} handleLogout={handleLogout}><Settings /></Layout> : <Navigate to="/login" />} />
        <Route path="/warehouses" element={user ? <Layout user={user} handleLogout={handleLogout}><Warehouses /></Layout> : <Navigate to="/login" />} />
        <Route path="/suppliers" element={user ? <Layout user={user} handleLogout={handleLogout}><Suppliers /></Layout> : <Navigate to="/login" />} />
        <Route path="/purchase-orders" element={user ? <Layout user={user} handleLogout={handleLogout}><PurchaseOrders /></Layout> : <Navigate to="/login" />} />
        <Route path="/security-log" element={user ? <Layout user={user} handleLogout={handleLogout}><SecurityLog /></Layout> : <Navigate to="/login" />} />
        <Route path="/team" element={user ? <Layout user={user} handleLogout={handleLogout}><Team /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}