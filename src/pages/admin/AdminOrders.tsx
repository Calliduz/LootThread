import React, { useEffect, useState, useCallback } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/endpoints';
import {
  Loader2, AlertTriangle, Package, ChevronDown,
  X, CheckCircle, Clock, XCircle, RefreshCw, Eye, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SkeletonRow } from '../../components/Skeleton';
import { getAssetUrl } from '../../utils/assetHelper';

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  productId: string;
}

interface Order {
  _id: string;
  userId?: { _id: string; name: string; email: string } | null;
  items: OrderItem[];
  totalAmount: number;
  gameTag?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'Pending',    icon: Clock,        color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  processing: { label: 'Processing', icon: RefreshCw,    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20'      },
  completed:  { label: 'Completed',  icon: CheckCircle,  color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      color: 'text-red-400 bg-red-400/10 border-red-400/20'         },
};

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'cancelled'] as const;

// ── Toast ─────────────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: 'success' | 'error' }

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, add };
}

// ── Items Modal ───────────────────────────────────────────────────────────────
function OrderItemsModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-bg-card border border-white/10 rounded-[2.5rem] p-8 w-full max-w-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
              Tactical <span className="text-brand-primary">Manifest</span>
            </h2>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">TRANSACTION ID: {order._id.toUpperCase()}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:rotate-90"
          >
            <X className="w-6 h-6 text-white/50" />
          </button>
        </div>

        {/* Items */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
          {order.items.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-5 bg-white/[0.03] border border-white/5 rounded-2xl p-4 group hover:bg-white/[0.05] hover:border-white/10 transition-all"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                {item.imageUrl
                  ? <img src={getAssetUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                  : <Package className="w-6 h-6 text-brand-primary/30" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white uppercase tracking-wide truncate">{item.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-white/40 font-bold uppercase">Qty: {item.quantity}</span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="text-[10px] text-brand-primary/60 font-bold uppercase tracking-tighter">Unit: ₱{item.price.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-lg font-black text-white flex-shrink-0">
                ₱{(item.price * item.quantity).toFixed(2)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-6 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Customer Intel</p>
              <p className="text-xs font-bold text-white/80">{order.userId?.name ?? 'Guest User'}</p>
              <p className="text-[10px] text-white/40 font-mono">{order.userId?.email ?? 'System ID'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-brand-primary/60 font-black uppercase tracking-widest mb-1">Total Valuation</p>
              <p className="text-4xl font-black text-brand-primary tracking-tighter">₱{order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            Acknowledge Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);
  const { toasts, add: addToast } = useToast();

  const fetchOrders = useCallback(() => {
    setLoading(true);
    getAllOrders()
      .then(data => setOrders(data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status: newStatus as Order['status'] } : o)
      );
      addToast(`Order status updated to "${newStatus}"`, 'success');
    } catch {
      addToast('Failed to update order status.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 relative">

      {/* Toast Stack */}
      <div className="fixed bottom-6 right-6 z-[100] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-bold border backdrop-blur-sm pointer-events-auto transition-all ${
              t.type === 'success'
                ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {t.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
            Order <span className="text-brand-primary">Management</span>
          </h1>
          <p className="text-white/30 text-sm mt-1">
            {loading ? 'Loading...' : `${orders.length} order${orders.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white/50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} cols={7} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400" />
          <p className="text-red-400 font-bold">{error}</p>
          <button onClick={fetchOrders} className="text-xs text-brand-primary hover:underline uppercase tracking-widest font-bold">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Package className="w-12 h-12 text-white/20" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-sm">No orders yet</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && orders.length > 0 && (
        <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_2fr_auto] gap-4 px-6 py-3 border-b border-white/5">
            {['Order ID', 'Customer', 'Date', 'Total', 'Game Tag', 'Status', 'Items'].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-white/30">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.04]">
            {orders.map(order => {
              const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              const isUpdating = updating === order._id;

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                  className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_2fr_auto] gap-4 items-center px-6 py-5 transition-colors group cursor-default"
                >
                  {/* Order ID */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-1">Order ID</p>
                    <p className="text-xs font-mono font-bold text-white/40 group-hover:text-brand-primary transition-colors tracking-tighter">#{order._id.toUpperCase()}</p>
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-1">Customer</p>
                    <p className="text-sm font-black text-white truncate group-hover:translate-x-1 transition-transform">{order.userId?.name ?? 'Anonymous User'}</p>
                    <p className="text-[10px] text-white/30 font-mono truncate">{order.userId?.email ?? 'guest_session_active'}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-1">Timestamp</p>
                    <p className="text-xs font-bold text-white/60">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                      {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-1">Valuation</p>
                    <p className="text-lg font-black text-brand-primary tracking-tighter">₱{order.totalAmount.toFixed(2)}</p>
                  </div>

                  {/* Game Tag */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-1">Sector Tag</p>
                    <p className="text-xs font-black text-white/40 uppercase tracking-widest">{order.gameTag || '—'}</p>
                  </div>

                  {/* Status Select */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 lg:hidden mb-1">Current Status</p>
                    <div className="relative">
                      {isUpdating ? (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${statusCfg.color}`}>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Syncing...
                        </div>
                      ) : (
                        <div className="relative inline-block w-full max-w-[180px]">
                          <div className={`absolute inset-y-0 left-3.5 flex items-center pointer-events-none`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${statusCfg.color.split(' ')[0]}`} />
                          </div>
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order._id, e.target.value)}
                            className={`w-full appearance-none pl-10 pr-8 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest cursor-pointer focus:outline-none transition-all hover:brightness-110 active:scale-95 ${statusCfg.color} bg-black/40`}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s} className="bg-bg-dark text-white uppercase font-black">
                                {s}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <ChevronDown className="w-4 h-4 text-white/20" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View Items */}
                  <div>
                    <button
                      onClick={() => setExpandedOrder(order)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-brand-primary hover:text-black border border-white/10 hover:border-brand-primary text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group/btn"
                      title="Inspect components"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden xl:inline">Inspect</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Modal */}
      <AnimatePresence>
        {expandedOrder && (
          <OrderItemsModal order={expandedOrder} onClose={() => setExpandedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
