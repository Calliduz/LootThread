import React, { useEffect, useState, useCallback } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/endpoints';
import {
  Loader2, AlertTriangle, Package, ChevronDown,
  X, CheckCircle, Clock, XCircle, RefreshCw, Eye,
} from 'lucide-react';
import { SkeletonRow } from '../../components/Skeleton';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Order Items</h2>
            <p className="text-[10px] text-white/30 font-mono mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  : <Package className="w-5 h-5 text-brand-primary/30" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{item.name}</p>
                <p className="text-[10px] text-white/40 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-black text-brand-primary flex-shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="space-y-0.5">
            {order.gameTag && <p className="text-[10px] text-white/30 font-mono">Tag: {order.gameTag}</p>}
            <p className="text-[10px] text-white/30 font-mono">
              {order.userId?.email ?? 'Guest'}
            </p>
          </div>
          <p className="text-xl font-black text-brand-primary">${order.totalAmount.toFixed(2)}</p>
        </div>
      </div>
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
                <div
                  key={order._id}
                  className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_2fr_auto] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Order ID */}
                  <div>
                    <p className="text-[10px] font-mono text-white/30 lg:hidden mb-0.5">Order ID</p>
                    <p className="text-xs font-mono text-white/60">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-[10px] font-mono text-white/30 lg:hidden mb-0.5">Customer</p>
                    <p className="text-xs font-bold text-white truncate">{order.userId?.name ?? 'Unknown'}</p>
                    <p className="text-[10px] text-white/30 font-mono truncate">{order.userId?.email ?? 'Guest'}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-[10px] font-mono text-white/30 lg:hidden mb-0.5">Date</p>
                    <p className="text-xs text-white/60">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-white/30">
                      {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-[10px] font-mono text-white/30 lg:hidden mb-0.5">Total</p>
                    <p className="text-sm font-black text-brand-primary">${order.totalAmount.toFixed(2)}</p>
                  </div>

                  {/* Game Tag */}
                  <div>
                    <p className="text-[10px] font-mono text-white/30 lg:hidden mb-0.5">Game Tag</p>
                    <p className="text-xs font-mono text-white/50">{order.gameTag || '—'}</p>
                  </div>

                  {/* Status Select */}
                  <div>
                    <p className="text-[10px] font-mono text-white/30 lg:hidden mb-0.5">Status</p>
                    <div className="relative">
                      {isUpdating ? (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${statusCfg.color}`}>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        <div className="relative inline-block w-full max-w-[160px]">
                          <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none`}>
                            <StatusIcon className={`w-3 h-3 ${statusCfg.color.split(' ')[0]}`} />
                          </div>
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order._id, e.target.value)}
                            className={`w-full appearance-none pl-7 pr-7 py-1.5 rounded-lg border text-xs font-bold cursor-pointer focus:outline-none transition-colors ${statusCfg.color} bg-transparent`}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s} className="bg-bg-dark text-white capitalize">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                            <ChevronDown className="w-3 h-3 text-white/40" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View Items */}
                  <div>
                    <button
                      onClick={() => setExpandedOrder(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/50 hover:text-white transition-colors"
                      title="View items"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden xl:inline">Items</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Modal */}
      {expandedOrder && (
        <OrderItemsModal order={expandedOrder} onClose={() => setExpandedOrder(null)} />
      )}
    </div>
  );
}
