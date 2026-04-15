import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Storefront from './Storefront';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminArtists from './pages/admin/AdminArtists';
import AdminCollections from './pages/admin/AdminCollections';
import AdminCMS from './pages/admin/AdminCMS';

// Placeholder components for Admin pages (to be built fully in later phases)
const DashboardPlaceholder = () => (
  <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
    <div className="text-center space-y-2">
      <h2 className="text-xl font-bold uppercase tracking-widest text-brand-primary">Dashboard Overview</h2>
      <p className="text-sm text-white/40">Aggregated stats will be rendered here.</p>
    </div>
  </div>
);







export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Storefront Route */}
          <Route path="/" element={<Storefront />} />

          {/* Admin Login */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested routes mapped into AdminLayout's <Outlet /> */}
            <Route index element={<DashboardPlaceholder />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="artists" element={<AdminArtists />} />
            <Route path="cms" element={<AdminCMS />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
