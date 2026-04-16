import React, { useState } from 'react';
import { Mail, Send, AlertCircle, X, CheckCircle2, ShieldAlert, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { broadcastNewsletter } from '../../api/endpoints';
import toast from 'react-hot-toast';

export default function AdminNewsletter() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please provide both subject and message.');
      return;
    }
    setShowConfirm(true);
  };

  const confirmBroadcast = async () => {
    setIsSending(true);
    setShowConfirm(false);
    try {
      const response = await broadcastNewsletter({ subject, message });
      toast.success(response.message || 'Mass broadcast successful!');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Broadcast failed.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight italic">
            Marketing <span className="text-brand-primary">Engine</span>
          </h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold text-[10px]">
            Newsletter Broadcast System v2.0
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
          <ShieldAlert className="w-4 h-4 text-brand-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Secure Admin Line</span>
        </div>
      </div>

      {/* Main Drafting Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <form onSubmit={handleSendRequest} className="space-y-8 relative z-10">
          {/* Subject Field */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-2 flex items-center gap-2">
              <Mail className="w-3 h-3 text-brand-primary" />
              Transmission Subject
            </label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Tactical Update: New Loot Drops Inside..."
              className="w-full bg-black/40 border border-white/10 focus:border-brand-primary/50 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder:text-white/10 outline-none transition-all"
            />
          </div>

          {/* Message Body Field */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-2 flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-brand-primary" />
              Message Payload (Plain Text)
            </label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your transmission payload here..."
              rows={12}
              className="w-full bg-black/40 border border-white/10 focus:border-brand-primary/50 rounded-3xl px-6 py-6 text-sm font-medium text-white placeholder:text-white/10 outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-white/20">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest italic">Personalization Active: BCC Mode</span>
            </div>
            <button 
              type="submit"
              disabled={isSending}
              className="w-full sm:w-auto bg-brand-primary text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,255,204,0.2)] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {isSending ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSending ? 'DISPATCHING...' : 'INITIATE BROADCAST'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Stats/Preview Sidebar placeholder for future */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/10 text-green-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Status</p>
            <h4 className="text-sm font-bold text-white uppercase italic">SendGrid API: Online</h4>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/10 text-brand-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Audience</p>
            <h4 className="text-sm font-bold text-white uppercase italic">Active Subscribers Only</h4>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-bg-card border border-white/10 rounded-[3rem] p-10 text-center shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-primary/20">
                <ShieldAlert className="w-10 h-10 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4">Confirm Broadcast?</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-10">
                You are about to initiate a mass transmission to all active subscribers. This action is irreversible once dispatched.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmBroadcast}
                  className="w-full py-5 bg-brand-primary text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,255,204,0.3)] flex items-center justify-center gap-2"
                >
                  Confirm & Dispatch
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-5 bg-white/5 text-white/50 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:text-white transition-all flex items-center justify-center gap-2 group"
                >
                  <X className="w-4 h-4" /> Cancel Transmission
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Icon for sidebar usage if exported individually
export const NewsletterIcon = Mail;
