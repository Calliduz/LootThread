import React, { useEffect, useState } from 'react';
import { getAdminDashboardStats } from '../../api/endpoints';
import { DollarSign, Clock, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { SkeletonCard } from '../../components/Skeleton';

interface Stats {
  totalRevenue: number;
  pendingOrdersCount: number;
  totalProducts: number;
  totalUsers: number;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminDashboardStats()
      .then(data => setStats(data))
      .catch(() => setError('Failed to load dashboard stats.'))
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
          value={`$${(stats?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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

      {/* Quick Actions */}
      <div className="bg-bg-card border border-white/5 rounded-2xl p-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Manage Orders',   href: '/admin/orders'      },
            { label: 'Add Product',     href: '/admin/products'    },
            { label: 'Edit CMS',        href: '/admin/cms'         },
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
