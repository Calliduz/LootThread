import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Package, Settings, ShieldAlert } from 'lucide-react';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-12 px-6 relative">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-bg-card border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <UserIcon className="w-64 h-64 text-brand-primary" />
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-1">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
                alt="Avatar" 
                className="w-full h-full rounded-xl bg-black"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">{user?.name}</h1>
                <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                  Verified Identity
                </span>
              </div>
              <p className="text-white/40 font-mono text-sm">{user?.email}</p>
            </div>
          </div>
          
          <div className="relative z-10">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Orders Stub */}
            <div className="bg-bg-card border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <Package className="w-6 h-6 text-brand-primary" />
                <h2 className="text-xl font-black uppercase italic tracking-widest text-white">Order History</h2>
              </div>
              
              <div className="border border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.02]">
                <ShieldAlert className="w-12 h-12 text-white/20" />
                <h3 className="text-white/60 font-bold uppercase tracking-widest">No Active Orders</h3>
                <p className="text-white/30 text-sm max-w-sm">You haven't acquired any loot yet. Your secure transaction log will appear here.</p>
                <button 
                  onClick={() => navigate('/')} 
                  className="mt-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Return to Market
                </button>
              </div>
            </div>
          </div>
          
          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-bg-card border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5 text-brand-primary" />
                <h2 className="text-sm font-black uppercase italic tracking-widest text-white">Security & Auth</h2>
              </div>
              <div className="space-y-4">
                <button className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-colors">
                  <div className="text-xs font-bold uppercase tracking-widest text-white mb-1">Update Passcode</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Change your entry key</div>
                </button>
                <button className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-colors">
                  <div className="text-xs font-bold uppercase tracking-widest text-white mb-1">Link Connections</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Google / GitHub settings</div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
