import React from 'react';
import { Ghost, Sparkles, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[50vw] h-[50vh] bg-brand-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[50vw] h-[50vh] bg-brand-accent/5 blur-[120px] pointer-events-none" />
      
      {/* Moving Particles (Simulated) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              y: [null, Math.random() * -100],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 5 + 2, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full relative z-10 text-center space-y-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-brand-primary/20 blur-3xl animate-pulse" />
          <div className="relative w-32 h-32 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto shadow-2xl backdrop-blur-xl">
            <Ghost className="w-16 h-16 text-brand-primary animate-bounce" />
          </div>
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
            4<span className="text-brand-primary">0</span>4
          </h1>
          <h2 className="text-xl font-black uppercase italic tracking-widest text-white/80">
            Level Not Found
          </h2>
          <p className="text-white/30 text-xs font-mono uppercase tracking-[0.2em] max-w-[280px] mx-auto leading-relaxed">
            The resource you seek has fragmented or drifted into the void.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-3 bg-brand-primary text-black px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_40px_rgba(0,255,204,0.2)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Market
          </button>
          
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH THE VOID..."
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/marketplace?s=${(e.target as HTMLInputElement).value}`); }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-[10px] font-bold tracking-widest focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-all text-white"
            />
          </div>
        </div>

        <div className="pt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
            <Sparkles className="w-3 h-3 text-brand-primary/40" />
            <span>Scanning Stacks</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
            <Sparkles className="w-3 h-3 text-brand-accent/40" />
            <span>ID: 0x4B36A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
