import React, { useState } from 'react';
import { subscribeNewsletter } from '../../api/endpoints';
import { Loader2, Mail } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await subscribeNewsletter(email);
      setSuccess(res.message || 'Welcome to the club!');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Subscription failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border-y border-white/5 py-16 px-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* Icon & Title */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-brand-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tight italic">Join the <span className="text-brand-primary">Drop List</span></h3>
          <p className="text-white/40 text-sm">Get notified about exclusive drops, restocks, and rare items before anyone else.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex items-stretch mx-auto max-w-md relative">
          <input 
            type="email" 
            required 
            placeholder="ENTER YOUR EMAIL..." 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/[0.02] border border-white/10 rounded-l-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-brand-primary/50 font-mono"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-brand-primary text-black px-6 font-bold uppercase tracking-wider text-sm rounded-r-xl border border-brand-primary hover:brightness-110 active:scale-95 transition-all flex items-center justify-center min-w-[120px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
          </button>
        </form>

        {/* Feedback */}
        {success && <p className="text-brand-primary text-xs font-bold uppercase tracking-wider animate-in fade-in">{success}</p>}
        {error && <p className="text-red-400 text-xs font-bold uppercase tracking-wider animate-in fade-in">{error}</p>}
      </div>
    </div>
  );
}
