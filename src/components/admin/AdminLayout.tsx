import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Package, Layers, Palette, FileText,
  LogOut, Menu, X, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin',              label: 'Dashboard',      icon: LayoutDashboard, end: true },
  { to: '/admin/products',     label: 'Products',       icon: Package },
  { to: '/admin/collections',  label: 'Collections',    icon: Layers },
  { to: '/admin/artists',      label: 'Artists',        icon: Palette },
  { to: '/admin/cms',          label: 'Storefront CMS', icon: FileText },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
      isActive
        ? 'bg-brand-primary/10 text-brand-primary shadow-[inset_0_0_20px_rgba(0,255,204,0.05)]'
        : 'text-white/50 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-bg-dark">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-bg-card border-r border-white/5
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/5">
          <NavLink to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
              <span className="text-brand-primary font-black text-sm">L</span>
            </div>
            <span className="text-lg font-black uppercase tracking-tight">
              Loot<span className="text-brand-primary">Thread</span>
            </span>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-white/5 text-white/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-4 mb-4">
            Management
          </p>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={linkClasses}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 -translate-x-1 group-hover:translate-x-0 transition-all" />
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03]">
            <div className="w-9 h-9 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
              <span className="text-brand-primary font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() ?? 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email ?? ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-bg-card/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold uppercase tracking-wider text-white/50">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="text-xs text-white/30 hover:text-brand-primary transition-colors font-medium"
            >
              ← Back to Store
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
