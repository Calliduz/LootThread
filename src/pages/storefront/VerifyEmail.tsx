import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyEmail } from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const email = (location.state as { email?: string })?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Verification code must be 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyEmail({ email: email!, otp });
      toast.success('Identity verified. Access granted.');
      
      // Verification returns user + token, manually log them in
      if (data.token) {
        loginWithToken(data.token);
        const isAdmin = data.user.role === 'admin';
        navigate(isAdmin ? '/admin' : '/account', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-bg-dark to-bg-dark pointer-events-none" />

      <div className="max-w-md w-full bg-bg-card border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl space-y-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-brand-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-brand-primary/10 rounded-full border border-brand-primary/20">
              <ShieldCheck className="w-8 h-8 text-brand-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Verify <span className="text-brand-primary">Identity</span>
          </h1>
          <p className="text-white/40 text-sm">
            A 6-digit transmission was sent to <span className="text-white font-bold">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-2">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl font-black tracking-[12px] text-brand-primary focus:outline-none focus:border-brand-primary/50 transition-colors uppercase"
              placeholder="000000"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-brand-primary text-black font-black uppercase tracking-widest py-4 rounded-xl mt-4 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Verifying...
              </span>
            ) : 'Verify Identity'}
          </button>
        </form>

        <p className="text-center text-white/40 text-[10px] font-bold tracking-widest uppercase">
          Didn't receive the code? Check your spam terminal or contact support.
        </p>
      </div>
    </div>
  );
}
