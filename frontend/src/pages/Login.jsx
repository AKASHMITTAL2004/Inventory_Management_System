import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Building2, Lock, Mail, User, ShieldCheck } from 'lucide-react';

const industries = {
  pharmacy: "Pharmacy / Medical Supplier",
  electronics: "Electronics Supplier",
  grocery_fmcg: "Grocery / FMCG Distributor",
  apparel_fashion: "Apparel / Fashion Supplier",
  automotive_parts: "Automotive Parts Supplier",
  construction_hardware: "Construction / Hardware Supplier",
  furniture: "Furniture Supplier",
  general: "General / Other"
};

export default function Login({ setAuth }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('general');
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState('');
  const [totpToken, setTotpToken] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (requires2FA) {
        const { data } = await API.post('/auth/verify-2fa', { userId: userIdFor2FA, token: totpToken });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuth(data.user);
        navigate('/');
        return;
      }

      if (isSignup) {
        const { data } = await API.post('/auth/signup', { orgName, industry, userName: name, email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuth(data.user);
        navigate('/');
      } else {
        const { data } = await API.post('/auth/login', { email, password });
        if (data.requires2FA) {
          setRequires2FA(true);
          setUserIdFor2FA(data.userId);
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setAuth(data.user);
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Inventory Pro</h2>
          <p className="text-slate-400 text-sm mt-2">
            {requires2FA ? "Enter your 2FA Authenticator Code" : isSignup ? "Create your industry-adaptive account" : "Sign in to manage your stock"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {requires2FA ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">6-Digit Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="123456"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-center tracking-widest text-lg"
                />
              </div>
            </div>
          ) : (
            <>
              {isSignup && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Acme Supplies Ltd"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Select Industry (Customizes App)</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 text-sm"
                    >
                      {Object.entries(industries).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-brand-500/20 text-sm mt-2"
          >
            {requires2FA ? "Verify Code" : isSignup ? "Complete Registration" : "Sign In"}
          </button>
        </form>

        {!requires2FA && (
          <div className="text-center mt-6">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-xs text-slate-400 hover:text-brand-400 transition-colors"
            >
              {isSignup ? "Already have an account? Sign in" : "Need an account? Register your business"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}