import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const handleOAuth = (provider: 'google' | 'facebook') => {
    window.location.href = `${API_BASE}/api/auth/${provider}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login({ email, password });
      // Role-aware redirect: admins go to /admin, customers go to /account
      const fallback = data.user.role === 'admin' ? '/admin' : '/account';
      const origin = (location.state as any)?.from?.pathname;
      navigate(origin && origin !== '/login' ? origin : fallback);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/cyber-login/1920/1080?blur=10')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-bg-dark to-bg-dark pointer-events-none" />

      <div className="max-w-md w-full bg-bg-card border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl space-y-8">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-brand-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Access <span className="text-brand-primary">Terminal</span>
          </h1>
          <p className="text-white/40 text-sm">Log in to your LootThread account to manage your collection.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-2">Email Identity</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60">Passcode</label>
              <Link to="/forgot-password" className="text-xs text-brand-primary hover:underline font-bold">Forgot?</Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-primary transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-primary text-black font-black uppercase tracking-widest py-4 rounded-xl mt-4 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : 'Initialize Session'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="bg-bg-card px-4 text-white/40">Or Connect Via</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => handleOAuth('google')} className="flex items-center justify-center gap-2 bg-white flex-1 text-black font-bold uppercase text-xs py-3 rounded-xl hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>
          <button type="button" onClick={() => handleOAuth('facebook')} className="flex items-center justify-center gap-2 bg-[#1877F2] text-white font-bold uppercase text-xs py-3 rounded-xl hover:bg-[#166fe5] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>
        </div>

        <p className="text-center text-white/40 text-xs font-bold tracking-widest uppercase">
          New to LootThread?{' '}
          <Link to="/register" className="text-brand-primary hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
