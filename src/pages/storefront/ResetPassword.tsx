import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { resetPassword, forgotPassword } from '../../api/endpoints';
import { Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-fill email from ForgotPassword navigation state
  const [email, setEmail] = useState((location.state as any)?.email ?? '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      toast.success('Password reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email address first.');
      return;
    }
    setResending(true);
    try {
      await forgotPassword(email);
      toast.success('A new OTP has been sent to your email.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-bg-dark to-bg-dark pointer-events-none" />

      <div className="max-w-md w-full bg-bg-card border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl space-y-8">
        {/* Back */}
        <Link to="/forgot-password" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-brand-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Secure <span className="text-brand-primary">Terminal</span>
          </h1>
          <p className="text-white/40 text-sm">Enter your 6-digit OTP and set a new passcode.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-2">Email Identity</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* OTP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60">6-Digit OTP</label>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-brand-primary font-mono text-center tracking-[0.5em] text-xl focus:outline-none focus:border-brand-primary/50 transition-colors"
              required
              placeholder="000000"
              maxLength={6}
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-2">New Passcode</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-black font-black uppercase tracking-widest py-4 rounded-xl mt-4 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Resetting...
              </span>
            ) : 'Confirm New Passcode'}
          </button>
        </form>

        <p className="text-center text-white/40 text-xs font-bold tracking-widest uppercase">
          <Link to="/login" className="hover:underline">Return to Login</Link>
        </p>
      </div>
    </div>
  );
}
