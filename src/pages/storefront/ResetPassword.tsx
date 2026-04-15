import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/endpoints';
import { Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await resetPassword({ email, otp, newPassword });
      setSuccess('Password reset successfully. Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-bg-dark to-bg-dark pointer-events-none" />

      <div className="max-w-md w-full bg-bg-card border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Secure <span className="text-brand-primary">Terminal</span>
          </h1>
          <p className="text-white/40 text-sm">Enter your 6-digit OTP code to establish a new passcode.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary p-4 rounded-xl text-sm font-bold text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
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
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-2">6-Digit OTP</label>
            <input 
              type="text" 
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-brand-primary font-mono text-center tracking-[0.5em] text-xl focus:outline-none focus:border-brand-primary/50 transition-colors"
              required
              placeholder="000000"
              maxLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-2">New Passcode</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-primary text-black font-black uppercase tracking-widest py-4 rounded-xl mt-4 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm New Passcode'}
          </button>
        </form>

        <p className="text-center text-white/40 text-xs font-bold tracking-widest uppercase mt-6">
          <Link to="/login" className="hover:underline">Return to Login</Link>
        </p>
      </div>
    </div>
  );
}
