import React, { useState, useEffect } from 'react';
import API from '../services/api'; // Import your API service
import { Users, UserPlus, Shield, Mail, CheckCircle2, Clock, MoreVertical, Trash2 } from 'lucide-react';

export default function Team() {
  // 1. Start with an empty array for live data
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', role: 'Viewer' });

  // 2. Fetch the live team directory when the page loads
  const fetchTeam = async () => {
    try {
      // Assumes you have a backend route like GET /api/team or /api/users
      const res = await API.get('/team'); 
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching team members", err);
      // If the backend route isn't built yet, keep it empty instead of crashing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // 3. Send the invite to the backend
  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      // Assumes you have a backend route like POST /api/team/invite
      await API.post('/team/invite', formData);
      
      setIsModalOpen(false);
      setFormData({ email: '', role: 'Viewer' });
      fetchTeam(); // Refresh the list to show the pending user
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending invitation.');
    }
  };

  // 4. Send the delete request to the backend
  const handleRemove = async (id) => {
    if(window.confirm('Are you sure you want to revoke access for this user?')) {
      try {
        await API.delete(`/team/${id}`);
        fetchTeam(); // Refresh the list after deletion
      } catch (err) {
        alert('Error removing user.');
      }
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'Owner': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Admin': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Manager': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Team & Permissions</h1>
          <p className="text-slate-500 mt-1">Manage user access, role-based permissions, and invitations</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <UserPlus className="h-5 w-5" /> Invite Member
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-500" />
          <h2 className="text-lg font-bold text-slate-800">Active Directory</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
             <div className="text-center py-10 text-slate-400">Loading team directory...</div>
          ) : members.length === 0 ? (
             <div className="text-center py-10 text-slate-400">No team members found. Invite someone to get started.</div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member._id || member.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg border ${
                      member.status === 'Active' ? 'bg-brand-50 text-brand-600 border-brand-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{member.name || 'Pending User'}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadge(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {member.status !== 'Pending' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                        <CheckCircle2 className="h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                        <Clock className="h-4 w-4" /> Pending
                      </span>
                    )}
                    
                    {/* Ensure you can't delete the Owner/Admin or yourself */}
                    {member.role !== 'Owner' && member.role !== 'Admin' && (
                      <button onClick={() => handleRemove(member._id || member.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Revoke Access">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Invite New Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="colleague@enterprise.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assign Role</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                >
                  <option value="Manager">Manager (Can edit inventory & approve POs)</option>
                  <option value="Staff">Staff (Can log movements)</option>
                  <option value="Viewer">Viewer (Read-only access)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
