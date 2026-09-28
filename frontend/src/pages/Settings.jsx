import React, { useState } from 'react';
import API from '../services/api'; // Added API import for database sync
import { User, Building, Save } from 'lucide-react';

export default function Settings() {
  // Read the user from login
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  // Auto-populate from login data. Fallback to empty string, not "Acme Logistics"
  const [profilePic, setProfilePic] = useState(user.profilePic || '');
  const [businessName, setBusinessName] = useState(user.orgName || user.businessName || '');
  const [industry, setIndustry] = useState(user.industry || 'General / Other'); 
  
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      // 1. Send the changes to your backend database
      await API.put('/auth/settings/organization', {
        orgName: businessName,
        industry: industry,
        profilePic: profilePic
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Update the local session so the sidebar and catalog update instantly
      const updatedUser = { ...user, orgName: businessName, businessName, industry, profilePic };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error saving settings. Check if your backend PUT route is built.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">System Preferences</h1>
        <p className="text-slate-500 mt-1">Manage your enterprise account, team configurations, and profile imagery</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Profile Picture Section */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-brand-500" /> User Profile Image
            </h2>
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">Profile Image URL</label>
                <input 
                  type="url" 
                  value={profilePic} 
                  onChange={(e) => setProfilePic(e.target.value)} 
                  placeholder="https://example.com/avatar.jpg" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Business Information Section */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-brand-500" /> Organization Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Auto-populated Business Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Business / Organization Name</label>
                <input 
                  type="text" 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500"
                  required
                />
              </div>
              
              {/* Dropdown Menu for Industry */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assigned Industry Template</label>
                <select 
                  value={industry} 
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500"
                >
                  <option value="General / Other">General / Other</option>
                  <option value="Electronics Supplier">Electronics Supplier</option>
                  <option value="Pharmacy / Medical Supplier">Pharmacy / Medical Supplier</option>
                  <option value="Automotive Parts Supplier">Automotive Parts Supplier</option>
                </select>
              </div>

            </div>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-medium text-sm">
              Preferences successfully saved to database!
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-300 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center gap-2"
            >
              <Save className="h-5 w-5" /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
