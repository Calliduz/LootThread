import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, User, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

import { useLogin } from '../hooks/useApi';

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ name, password }, {
      onSuccess: () => {
        onSuccess();
        onClose();
      }
    });
  };

  const isLoading = loginMutation.isPending;
  const error = loginMutation.error ? (loginMutation.error as any).response?.data?.message || 'Invalid credentials. Tactical login failed.' : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-bg-card border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                  Artist <span className="text-brand-primary">Login</span>
                </h2>
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Access your tactical dashboard</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Artist Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter artist name..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:border-brand-primary/50 focus:bg-white/10 transition-all outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:border-brand-primary/50 focus:bg-white/10 transition-all outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-primary text-black py-5 rounded-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-brand-primary/20"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Initialize Dashboard <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest pt-4">
                Default Credentials: <span className="text-white/40">Artist One / password123</span>
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
