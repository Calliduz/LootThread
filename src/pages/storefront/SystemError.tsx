import React from 'react';
import { ShieldAlert, RefreshCcw, Home, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface SystemErrorProps {
  error: Error | null;
  resetError: () => void;
}

export default function SystemError({ error, resetError }: SystemErrorProps) {
  const navigate = useNavigate();

  const handleReboot = () => {
    resetError();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      
      {/* Glitch Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
        <div className="absolute inset-0 animate-pulse bg-red-500" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-card border border-red-500/20 rounded-[2.5rem] p-10 md:p-12 shadow-[0_0_100px_rgba(239,68,68,0.1)] text-center relative overflow-hidden"
        >
          {/* Ominous glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full" />
          
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse" />
              <div className="relative w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <ShieldAlert className="w-10 h-10 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                Critical <span className="text-red-500">Failure</span>
              </h1>
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-red-400/60 uppercase tracking-[0.3em]">
                <Terminal className="w-3 h-3" />
                <span>Error Code: 0xLT_CRASH</span>
              </div>
            </div>
          </div>

          <div className="bg-black/40 rounded-2xl p-6 mb-10 text-left border border-white/5 font-mono">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Diagnostic Data</p>
            <p className="text-xs text-red-400 leading-relaxed overflow-hidden break-words">
              {error?.message || 'A catastrophic sequence error occurred in the storefront core.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleReboot}
              className="flex items-center justify-center gap-3 bg-red-500 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_40px_rgba(239,68,68,0.2)]"
            >
              <RefreshCcw className="w-4 h-4" />
              Reboot System
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
            >
              <Home className="w-4 h-4" />
              Return Home
            </button>
          </div>
        </motion.div>

        <p className="text-center mt-10 text-[9px] text-white/10 uppercase tracking-[0.5em] font-mono">
          System integrity compromised. Log sequence initiated.
        </p>
      </div>
    </div>
  );
}
