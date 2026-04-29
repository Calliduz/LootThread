import React, { useEffect, useState } from 'react';
import { getAdminDashboardStats, getProducts } from '../../api/endpoints';
import { Product } from '../../types/api';
import { DollarSign, Clock, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { SkeletonCard } from '../../components/Skeleton';

interface Stats {
  totalRevenue: number;
  pendingOrdersCount: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  monthlyRevenue: Array<{ _id: string; revenue: number }>;
  topProducts: Array<{ _id: string; sales: number; revenue: number }>;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  accent?: boolean;
  sub?: string;
  trend?: string;
}

function StatCard({ label, value, icon: Icon, accent, sub, trend }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all group ${
      accent
        ? 'bg-brand-primary/10 border-brand-primary/30 shadow-[0_0_30px_rgba(0,255,204,0.08)]'
        : 'bg-bg-card border-white/5 hover:border-white/10'
    }`}>
      {/* Glow orb */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-20 ${
        accent ? 'bg-brand-primary' : 'bg-white'
      }`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            accent ? 'bg-brand-primary/20' : 'bg-white/5'
          }`}>
            <Icon className={`w-5 h-5 ${accent ? 'text-brand-primary' : 'text-white/50'}`} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </div>
          )}
        </div>

        <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1">{label}</p>
        <p className={`text-3xl font-black tracking-tight ${accent ? 'text-brand-primary' : 'text-white'}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getAdminDashboardStats(),
      getProducts()
    ])
      .then(([statsData, productsData]) => {
        setStats(statsData);
        setProducts(productsData);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 w-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded-xl animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400" />
          <p className="text-red-400 font-bold">{error}</p>
          <button
            onClick={() => { setError(''); setLoading(true); getAdminDashboardStats().then(setStats).catch(() => setError('Failed.')).finally(() => setLoading(false)); }}
            className="text-xs text-brand-primary hover:underline uppercase tracking-widest font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
          Operations <span className="text-brand-primary">Dashboard</span>
        </h1>
        <p className="text-white/30 text-sm mt-1">Real-time platform intelligence</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={`₱${(stats?.totalRevenue ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          sub="Completed + Processing orders"
          trend="+live"
        />
        <StatCard
          label="Pending Orders"
          value={String(stats?.pendingOrdersCount ?? 0)}
          icon={Clock}
          accent={(stats?.pendingOrdersCount ?? 0) > 0}
          sub={(stats?.pendingOrdersCount ?? 0) > 0 ? 'Requires attention' : 'All clear'}
        />
        <StatCard
          label="Active Products"
          value={String(stats?.totalProducts ?? 0)}
          icon={Package}
          sub="Listed in catalog"
        />
        <StatCard
          label="Total Customers"
          value={String(stats?.totalUsers ?? 0)}
          icon={Users}
          sub="Registered accounts"
        />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Performance Chart */}
        <div className="bg-bg-card border border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Revenue Performance</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Last 6 Months</span>
          </div>

          <div className="flex items-end justify-between h-48 gap-4 px-4">
            {stats?.monthlyRevenue?.length === 0 ? (
              <div className="w-full flex items-center justify-center text-white/10 text-[10px] uppercase font-bold tracking-[0.2em]">Insufficent Data</div>
            ) : stats?.monthlyRevenue.map((month) => {
              const maxRev = Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1);
              const height = (month.revenue / maxRev) * 100;
              return (
                <div key={month._id} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative w-full flex items-end justify-center">
                    <div 
                      className="w-full bg-brand-primary/10 rounded-t-xl group-hover:bg-brand-primary/20 transition-all duration-500 relative overflow-hidden border-t border-brand-primary/30"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-primary text-black text-[9px] font-black px-2 py-1 rounded-md shadow-[0_0_20px_rgba(0,255,204,0.4)] z-10 whitespace-nowrap">
                      ₱{month.revenue.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/60 transition-colors">{month._id}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Acquisitions */}
        <div className="bg-bg-card border border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-brand-primary" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Top Acquisitions</h2>
          </div>

          <div className="space-y-6">
            {stats?.topProducts?.length === 0 ? (
              <div className="py-12 text-center text-white/10 text-[10px] uppercase font-bold tracking-[0.2em]">Zero Acquisitions Detected</div>
            ) : stats?.topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xs font-black text-white/20 border border-white/5">
                    0{i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">{p._id}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">{p.sales} Units Dispatched</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-brand-primary">₱{p.revenue.toLocaleString()}</p>
                  <div className="w-24 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary shadow-[0_0_10px_rgba(0,255,204,0.3)]" 
                      style={{ width: `${(p.sales / Math.max(...stats!.topProducts.map(tp => tp.sales))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-bg-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-brand-primary" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Recent Transactions</h2>
          </div>
          <a href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline">View All Orders →</a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Total</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-white/20 uppercase font-bold tracking-widest">No transmissions logged</td>
                </tr>
              ) : (
                stats?.recentOrders.map((order) => (
                  <tr key={order._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-mono text-white/60 group-hover:text-brand-primary transition-colors">#{order._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{order.userId?.name || 'Guest'}</span>
                        <span className="text-[10px] text-white/30 font-mono">{order.userId?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-brand-primary tracking-tight">₱{order.totalAmount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                        order.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-white/30">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-bg-card border border-white/5 rounded-2xl p-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Manage Orders',   href: '/admin/orders'      },
            { label: 'Add Product',     href: '/admin/products'    },
            { label: 'Discounts',       href: '/admin/discounts'   },
            { label: 'View Artists',    href: '/admin/artists'     },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="flex items-center justify-center py-3 px-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-brand-primary/30 hover:bg-brand-primary/5 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-brand-primary transition-all"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
