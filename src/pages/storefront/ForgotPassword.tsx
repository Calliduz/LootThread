import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/endpoints';
import { Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await forgotPassword(email);
      setMessage(res.message || 'If that account exists, an OTP was sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process request.');
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
            Reset <span className="text-brand-primary">Terminal</span>
          </h1>
          <p className="text-white/40 text-sm">Enter your email to receive a recovery code.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary p-4 rounded-xl text-sm font-bold text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-primary text-black font-black uppercase tracking-widest py-4 rounded-xl mt-4 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request OTP Code'}
          </button>
        </form>

        <p className="text-center text-white/40 text-xs font-bold tracking-widest uppercase mt-4">
          Have an OTP?{' '}
          <Link to="/reset-password" className="text-brand-primary hover:underline">Reset Passcode</Link>
        </p>

        <p className="text-center text-white/40 text-xs font-bold tracking-widest uppercase mt-6">
          <Link to="/login" className="hover:underline">Return to Login</Link>
        </p>
      </div>
    </div>
  );
}
