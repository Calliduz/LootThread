import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Storefront from './Storefront';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminArtists from './pages/admin/AdminArtists';
import AdminCollections from './pages/admin/AdminCollections';
import AdminCMS from './pages/admin/AdminCMS';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';

// Storefront Pages
import Login from './pages/storefront/Login';
import Register from './pages/storefront/Register';
import ForgotPassword from './pages/storefront/ForgotPassword';
import ResetPassword from './pages/storefront/ResetPassword';
import Account from './pages/storefront/Account';
import OAuthCallback from './pages/storefront/OAuthCallback';
import Checkout from './pages/storefront/Checkout';
import { useAuth } from './contexts/AuthContext';
import { useLocation } from 'react-router-dom';



const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#0f0f1a', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.05em' },
            success: { iconTheme: { primary: '#00ffcc', secondary: '#000' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public Storefront Route */}
          <Route path="/" element={<Storefront />} />

          {/* Admin Login */}
          {/* Customer Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* Protected Customer Routes */}
          <Route 
            path="/account" 
            element={
              <CustomerRoute>
                <Account />
              </CustomerRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <CustomerRoute>
                <Checkout />
              </CustomerRoute>
            }
          />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

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
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="artists" element={<AdminArtists />} />
            <Route path="cms" element={<AdminCMS />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
    </AuthProvider>
  );
}
