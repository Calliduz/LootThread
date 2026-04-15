import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../../api/endpoints';
import { LogOut, User as UserIcon, Package, Settings, ShieldAlert, Loader2, ShoppingBag, CheckCircle } from 'lucide-react';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  gameTag?: string;
  status: string;
  createdAt: string;
}

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(data => setOrders(data))
      .catch(() => {}) // silently fail — order history is non-critical
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-brand-primary border-brand-primary/20 bg-brand-primary/10';
      case 'pending':   return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
      case 'cancelled': return 'text-red-400 border-red-400/20 bg-red-400/10';
      default:          return 'text-white/40 border-white/10 bg-white/5';
    }
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
                  Verified
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

          {/* Main — Order History */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-bg-card border border-white/5 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-brand-primary" />
                  <h2 className="text-xl font-black uppercase italic tracking-widest text-white">Order History</h2>
                </div>
                {orders.length > 0 && (
                  <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {loadingOrders ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                </div>
              ) : orders.length === 0 ? (
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
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                      {/* Order Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-brand-primary/60" />
                            <span className="text-[10px] font-mono text-white/30 truncate">#{order._id.slice(-8).toUpperCase()}</span>
                          </div>
                          <p className="text-[10px] text-white/20 font-mono">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {order.gameTag && (
                            <p className="text-[10px] text-white/40 font-mono">Tag: {order.gameTag}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${statusColor(order.status)}`}>
                            <CheckCircle className="w-2.5 h-2.5 inline mr-1" />
                            {order.status}
                          </span>
                          <span className="text-brand-primary font-black text-sm">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 border-t border-white/5 pt-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {item.imageUrl
                                ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                : <Package className="w-3.5 h-3.5 text-brand-primary/40" />
                              }
                            </div>
                            <p className="text-xs text-white/60 flex-1">{item.name}</p>
                            <span className="text-[10px] text-white/30">×{item.quantity}</span>
                            <span className="text-xs font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-bg-card border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5 text-brand-primary" />
                <h2 className="text-sm font-black uppercase italic tracking-widest text-white">Security & Auth</h2>
              </div>
              <div className="space-y-4">
                <button className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-4 transition-colors">
                  <div className="text-xs font-bold uppercase tracking-widest text-white mb-1">Update Passcode</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Change your entry key</div>
                </button>
                <button className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-4 transition-colors">
                  <div className="text-xs font-bold uppercase tracking-widest text-white mb-1">Link Connections</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Google / GitHub settings</div>
                </button>
              </div>
            </div>

            {/* Stats */}
            {!loadingOrders && orders.length > 0 && (
              <div className="bg-bg-card border border-white/5 rounded-3xl p-6 space-y-4">
                <h2 className="text-xs font-black uppercase italic tracking-widest text-white/60">Activity</h2>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-xs text-white/40 uppercase tracking-widest">Total Orders</span>
                  <span className="text-sm font-black text-white">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs text-white/40 uppercase tracking-widest">Total Spent</span>
                  <span className="text-sm font-black text-brand-primary">
                    ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
