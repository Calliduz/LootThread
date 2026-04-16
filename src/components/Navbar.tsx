import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Menu, Zap, X, ArrowRight, User as UserIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../hooks/useApi';
import { getAssetUrl } from '../utils/assetHelper';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (view: 'marketplace' | 'dashboard' | 'artists' | 'skins' | 'attachments') => void;
}

export default function Navbar({ cartCount, onOpenCart, onNavigate }: NavbarProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: products = [] } = useProducts();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const suggestions = searchQuery.trim().length >= 2
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
    <nav className="sticky top-0 z-[100] w-full bg-black/95 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between shadow-2xl">
      <div 
        className="flex items-center gap-2 md:gap-3 cursor-pointer group"
        onClick={() => onNavigate('marketplace')}
      >
        <div className="bg-brand-primary p-1.5 md:p-2 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,255,204,0.3)]">
          <Zap className="w-4 h-4 md:w-6 md:h-6 text-black fill-current" />
        </div>
        <span className="text-lg md:text-2xl font-black tracking-tighter uppercase italic">
          Loot<span className="text-brand-primary">Thread</span>
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
        <button onClick={() => { navigate('/marketplace?type=skin'); onNavigate('skins'); }} className="hover:text-brand-primary transition-all duration-300">Skins</button>
        <button onClick={() => { navigate('/marketplace?type=attachment'); onNavigate('attachments'); }} className="hover:text-brand-primary transition-all duration-300">Attachments</button>
        <button onClick={() => onNavigate('artists')} className="hover:text-brand-primary transition-all duration-300">Artists</button>
        {isAuthenticated && user?.role === 'customer' && (
          <button onClick={() => navigate('/account')} className="text-brand-primary hover:text-white transition-all duration-300">Dashboard</button>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-6">
        <div className="relative hidden xl:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder="SEARCH THE VOID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-6 text-[10px] font-bold tracking-widest focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-all w-48 lg:w-72"
          />
          {/* Desktop Search Suggestions Layered within nav */}
          <AnimatePresence>
            {isSearchFocused && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 mt-2 bg-bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-[150] w-full"
              >
                {/* Results Mapping */}
                <div className="flex flex-col py-2 max-h-[60vh] overflow-y-auto w-full">
                  {suggestions.map(p => (
                    <div 
                      key={p.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => {
                        navigate('/marketplace');
                        setTimeout(() => setSearchQuery(''), 100);
                      }}
                    >
                      <img src={getAssetUrl(p.imageUrl || p.images?.[0])} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-black" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white uppercase tracking-widest truncate">{p.name}</p>
                        <p className="text-[10px] text-brand-primary">₱{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setIsMobileSearchOpen(true)}
          className="xl:hidden p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <Search className="w-5 h-5 text-white/70" />
        </button>
        
        <button 
          onClick={onOpenCart}
          className="relative p-2.5 bg-white/5 hover:bg-brand-primary/10 border border-white/5 hover:border-brand-primary/30 rounded-xl transition-all group"
        >
          <ShoppingCart className="w-5 h-5 text-white/70 group-hover:text-brand-primary transition-colors" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-primary text-black text-[10px] font-black w-5 h-5 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(0,255,204,0.5)]">
              {cartCount}
            </span>
          )}
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 md:gap-4">
            <div 
              onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/account')}
              className="w-10 h-10 rounded-xl border-2 border-white/5 hover:border-brand-primary/50 transition-all cursor-pointer overflow-hidden bg-white/5 flex items-center justify-center p-0.5"
            >
              <img 
                src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
                alt="Profile" 
                className="w-full h-full rounded-lg bg-black"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/login')}
              className="text-white hover:text-brand-primary px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors hidden md:hidden lg:block"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-brand-primary text-black px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,255,204,0.2)] hidden md:hidden lg:block"
            >
              Register
            </button>
          </div>
        )}
        
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="lg:hidden p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </nav>

    {/* GLOBAL DRAWER - OUTSIDE NAV STACKING CONTEXT */}
    <AnimatePresence>
      {isMenuOpen && (
        <>
          {/* Opaque Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-[10000] lg:hidden"
            style={{ backgroundColor: '#000000' }}
          />

          {/* Drawer Content */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-80 bg-bg-dark border-l border-white/10 z-[10001] p-8 md:p-12 flex flex-col lg:hidden shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-xl font-black tracking-tighter uppercase italic text-white">System Menu</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-8 mb-16">
              {[
                { label: 'Marketplace', path: '/marketplace', icon: Zap },
                { label: 'Loot Artists', action: () => onNavigate('artists'), icon: UserIcon },
                { label: 'The Void', path: '/marketplace?type=all', icon: Sparkles }
              ].map((link) => (
                <motion.button
                  key={link.label}
                  whileHover={{ x: 10 }}
                  onClick={() => {
                    if (link.path) navigate(link.path);
                    if (link.action) link.action();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-4 text-3xl font-black uppercase italic tracking-tighter text-white/40 hover:text-brand-primary transition-colors text-left"
                >
                  <link.icon className="w-6 h-6" />
                  {link.label}
                </motion.button>
              ))}
            </div>

            <div className="mt-auto space-y-6">

              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white">Login</button>
                  <button onClick={() => { navigate('/register'); setIsMenuOpen(false); }} className="py-4 bg-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(0,255,204,0.3)]">Register</button>
                </div>
              ) : (
                <button onClick={() => { navigate('/account'); setIsMenuOpen(false); }} className="w-full py-4 bg-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest text-black">Open Dashboard</button>
              )}
            </div>

            <div className="absolute top-1/2 -right-20 -translate-y-1/2 rotate-90 opacity-[0.02] pointer-events-none">
              <span className="text-[120px] font-black tracking-tighter uppercase whitespace-nowrap">LOOTTHREAD // MOBILE_LINK_v2.0</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Mobile Search Overlay */}
    <AnimatePresence>
      {isMobileSearchOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-[10002] bg-black/95 backdrop-blur-xl p-6 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-8">
            <Search className="w-6 h-6 text-brand-primary" />
            <input 
              autoFocus
              type="text" 
              placeholder="SEARCH THE VOID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-2xl font-black uppercase italic tracking-tighter text-white"
            />
            <button onClick={() => setIsMobileSearchOpen(false)} className="p-2">
              <X className="w-8 h-8 text-white/40" />
            </button>
          </div>
          {/* ... suggestions ... */}
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
