import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, updatePassword, getProfile, updateAddresses } from '../../api/endpoints';
import { useCart } from '../../contexts/CartContext';
import Navbar from '../../components/Navbar';
import CartDrawer from '../../components/storefront/CartDrawer';
import toast from 'react-hot-toast';
import {
  LogOut, User as UserIcon, Package, Settings, ShieldAlert,
  ShoppingBag, CheckCircle, KeyRound, ChevronDown, Eye, EyeOff,
} from 'lucide-react';
import { Skeleton } from '../../components/Skeleton';

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
  const { cartItems, cartCount, isCartOpen, setIsCartOpen } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // --- Change Password State ---
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // --- Address State ---
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', street: '', city: '', zip: '', country: '' });
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    getMyOrders()
      .then(data => setOrders(data))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));

    getProfile().then(data => {
      if (data.deliveryAddresses) setAddresses(data.deliveryAddresses);
    }).catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    setSavingPw(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      toast.success('Passcode updated successfully!');
      setShowPwForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPw(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddr(true);
    const updated = [...addresses, { ...newAddr, isDefault: addresses.length === 0 }];
    try {
      await updateAddresses(updated);
      setAddresses(updated);
      setNewAddr({ label: '', street: '', city: '', zip: '', country: '' });
      toast.success('Address added successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add address.');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleRemoveAddress = async (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    try {
      await updateAddresses(updated);
      setAddresses(updated);
      toast.success('Address removed.');
    } catch (err: any) {
      toast.error('Failed to remove address.');
    }
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
    <div className="min-h-screen bg-bg-dark">
      {/* Full site Navbar */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={(view) => {
          navigate('/');
          // After navigation, the Storefront component handles the view
          setTimeout(() => window.dispatchEvent(new CustomEvent('navigate-view', { detail: view })), 100);
        }}
      />

      <div className="pt-8 pb-12 px-6 relative">
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
                src={
                  user?.avatarUrl
                    ? user.avatarUrl
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
                }
                alt="Avatar"
                className="w-full h-full rounded-xl object-cover bg-black"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`;
                }}
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
                <div className="space-y-3 py-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} height={72} />)}
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

                {/* Update Passcode – Expandable */}
                <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowPwForm(v => !v)}
                    className="w-full text-left p-4 hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-white mb-1 flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-brand-primary" />
                        Update Passcode
                      </div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Change your entry key</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${showPwForm ? 'rotate-180' : ''}`} />
                  </button>

                  {showPwForm && (
                    <form onSubmit={handlePasswordUpdate} className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4">
                      {/* Current Password */}
                      <div className="relative">
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          placeholder="Current passcode"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          required
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white pr-9 outline-none focus:border-brand-primary/40 placeholder-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-primary transition-colors"
                          tabIndex={-1}
                        >
                          {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* New Password */}
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          placeholder="New passcode (min 8 chars)"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white pr-9 outline-none focus:border-brand-primary/40 placeholder-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-primary transition-colors"
                          tabIndex={-1}
                        >
                          {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Confirm Password */}
                      <input
                        type="password"
                        placeholder="Confirm new passcode"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20"
                      />

                      <button
                        type="submit"
                        disabled={savingPw}
                        className="w-full bg-brand-primary text-black text-xs font-black uppercase tracking-widest py-2.5 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {savingPw ? (
                          <><span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
                        ) : 'Update Passcode'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Address Book */}
                <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden mt-4">
                  <button
                    onClick={() => setShowAddressForm(v => !v)}
                    className="w-full text-left p-4 hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-white mb-1 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-brand-primary" />
                        Address Book
                      </div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Manage delivery addresses</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${showAddressForm ? 'rotate-180' : ''}`} />
                  </button>

                  {showAddressForm && (
                    <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                      {addresses.length > 0 ? (
                        <div className="space-y-2">
                          {addresses.map((addr, idx) => (
                            <div key={idx} className="bg-black/30 border border-white/10 rounded-lg p-3 flex justify-between items-start">
                              <div>
                                <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">{addr.label}</p>
                                <p className="text-[10px] text-white/40 font-mono">{addr.street}, {addr.city}, {addr.zip}, {addr.country}</p>
                              </div>
                              <button onClick={() => handleRemoveAddress(idx)} className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold tracking-widest">
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-white/40 text-center py-2">No addresses saved.</p>
                      )}

                      <form onSubmit={handleAddAddress} className="space-y-3 pt-3 border-t border-white/5">
                        <input type="text" placeholder="Label (e.g. Home)" value={newAddr.label} onChange={e => setNewAddr({...newAddr, label: e.target.value})} required className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20" />
                        <input type="text" placeholder="Street Address" value={newAddr.street} onChange={e => setNewAddr({...newAddr, street: e.target.value})} required className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20" />
                        <div className="flex gap-2">
                          <input type="text" placeholder="City" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} required className="w-1/2 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20" />
                          <input type="text" placeholder="ZIP" value={newAddr.zip} onChange={e => setNewAddr({...newAddr, zip: e.target.value})} required className="w-1/2 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20" />
                        </div>
                        <input type="text" placeholder="Country" value={newAddr.country} onChange={e => setNewAddr({...newAddr, country: e.target.value})} required className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/40 placeholder-white/20" />
                        
                        <button type="submit" disabled={savingAddr} className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-lg active:scale-[0.98] transition-all disabled:opacity-50 mt-2">
                          {savingAddr ? 'Adding...' : 'Add Address'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
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
      
      {/* Global Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
