import React, { useEffect, useState, useCallback } from 'react';
import { getAllOrders, updateOrderStatus, updateBulkOrderStatus } from '../../api/endpoints';
import {
  Loader2, AlertTriangle, Package, ChevronDown,
  X, CheckCircle, Clock, XCircle, RefreshCw, Eye, Search,
  Square, CheckSquare, Play, PackageCheck, Ban
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
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

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;
    setLoading(true);
    try {
      await updateBulkOrderStatus(selectedOrders, newStatus);
      setOrders(prev => prev.map(o => selectedOrders.includes(o._id) ? { ...o, status: newStatus as Order['status'] } : o));
      addToast(`${selectedOrders.length} orders updated to ${newStatus}`, 'success');
      setSelectedOrders([]);
    } catch {
      addToast('Failed to update orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o._id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredOrders = orders.filter(o => statusFilter === 'all' || o.status === statusFilter);

  const seedTestData = async () => {
    // This is for development testing only
    const mockOrder = {
      items: [{ productId: 'mock-id', name: 'Tactical Hoodie', quantity: 1, price: 4500 }],
      totalAmount: 4500,
      deliveryAddress: '123 Mock St, Quezon City',
      paymentMethod: 'simulated',
      gameTag: 'MOCK_USER_123'
    };
    
    setLoading(true);
    try {
      // We can't easily call createOrder without auth, but we can just use the endpoints if we want
      // For now, let's just show a toast that says "Seeding..."
      addToast('Mock data seeding is enabled in local environments.', 'info');
      // In a real scenario, we'd have a specific dev endpoint or just local state injection
      // Let's inject into state for immediate feedback if in dev
      const newMock: Order = {
        _id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        totalAmount: 4500,
        gameTag: 'MOCK_PLAYER',
        createdAt: new Date().toISOString(),
        items: mockOrder.items,
        deliveryAddress: mockOrder.deliveryAddress,
        paymentMethod: mockOrder.paymentMethod
      };
      setOrders(prev => [newMock, ...prev]);
    } finally {
      setLoading(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black italic tracking-tighter text-white">
            ORDERS_<span className="text-brand-primary">HUB</span>
          </h1>
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={seedTestData}
              className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all"
            >
              Seed Data
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-brand-primary/50 transition-all"
          >
            <option value="all">All Orders</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white/50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
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
          <div className="hidden lg:grid grid-cols-[50px_2fr_2fr_1.5fr_1fr_1.5fr_2fr_auto] gap-4 px-6 py-3 border-b border-white/5 items-center">
            <button 
              onClick={toggleSelectAll} 
              data-testid="select-all-orders"
              className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-brand-primary transition-colors"
            >
              {selectedOrders.length === filteredOrders.length && filteredOrders.length > 0 ? <CheckSquare className="w-4 h-4 text-brand-primary" /> : <Square className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Order ID</span>
              {selectedOrders.length > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-brand-primary text-black text-[8px] font-black">
                  {selectedOrders.length} SELECTED
                </span>
              )}
            </div>
            {['Customer', 'Date', 'Total', 'Game Tag', 'Status', 'Actions'].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-white/30">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.04]">
            {filteredOrders.map(order => {
              const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              const isUpdating = updating === order._id;

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                  className={`grid grid-cols-1 lg:grid-cols-[50px_2fr_2fr_1.5fr_1fr_1.5fr_2fr_auto] gap-4 items-center px-6 py-5 transition-all group cursor-default border-l-2 ${selectedOrders.includes(order._id) ? 'bg-brand-primary/5 border-brand-primary' : 'border-transparent'}`}
                >
                  {/* Checkbox */}
                  <div className="hidden lg:block">
                    <button 
                      onClick={() => toggleSelectOrder(order._id)} 
                      data-testid={`select-order-${order._id}`}
                      className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-brand-primary transition-colors"
                    >
                      {selectedOrders.includes(order._id) ? <CheckSquare className="w-4 h-4 text-brand-primary" /> : <Square className="w-4 h-4" />}
                    </button>
                  </div>
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

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      {order.status === 'pending' && (
                        <motion.button
                          data-testid={`process-btn-${order._id}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => handleStatusChange(order._id, 'processing')}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 text-[9px] font-black uppercase tracking-widest transition-all"
                          title="Start Processing"
                        >
                          <Play className="w-3 h-3" />
                          Process
                        </motion.button>
                      )}
                      {order.status === 'processing' && (
                        <motion.button
                          data-testid={`complete-btn-${order._id}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => handleStatusChange(order._id, 'completed')}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-black border border-brand-primary/20 text-[9px] font-black uppercase tracking-widest transition-all"
                          title="Complete Order"
                        >
                          <PackageCheck className="w-3 h-3" />
                          Complete
                        </motion.button>
                      )}
                    </AnimatePresence>
                    
                    <button
                      onClick={() => setExpandedOrder(order)}
                      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white transition-all"
                      title="Inspect components"
                    >
                      <Eye className="w-4 h-4" />
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

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-6 bg-bg-card border border-brand-primary/30 px-8 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Tactical Batch</span>
              <span className="text-xs font-bold text-white">{selectedOrders.length} Orders Selected</span>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <button
                data-testid="bulk-process-btn"
                onClick={() => handleBulkStatusChange('processing')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                Process
              </button>
              <button
                data-testid="bulk-complete-btn"
                onClick={() => handleBulkStatusChange('completed')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-black border border-brand-primary/20 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                Complete
              </button>
              <button
                onClick={() => handleBulkStatusChange('cancelled')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Ban className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>

            <button
              onClick={() => setSelectedOrders([])}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
