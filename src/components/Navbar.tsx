import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Menu, Zap, X, ArrowRight } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const { data: products = [] } = useProducts();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const suggestions = searchQuery.trim().length >= 2
    ? products
        .filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 md:gap-3 cursor-pointer group"
        onClick={() => onNavigate('marketplace')}
      >
        <div className="bg-brand-primary p-2 rounded-xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,255,204,0.3)]">
          <Zap className="w-5 h-5 md:w-6 md:h-6 text-black fill-current" />
        </div>
        <span className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">
          Loot<span className="text-brand-primary">Thread</span>
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
        <button onClick={() => navigate('/marketplace?type=skin')} className="hover:text-brand-primary hover:tracking-[0.3em] transition-all duration-300">Skins</button>
        <button onClick={() => navigate('/marketplace?type=attachment')} className="hover:text-brand-primary hover:tracking-[0.3em] transition-all duration-300">Attachments</button>
        <button onClick={() => onNavigate('artists')} className="hover:text-brand-primary hover:tracking-[0.3em] transition-all duration-300">Artists</button>
        {isAuthenticated && user?.role === 'customer' && (
          <button onClick={() => navigate('/account')} className="text-brand-primary hover:text-white hover:tracking-[0.3em] transition-all duration-300">Dashboard</button>
        )}
        {isAuthenticated && user?.role === 'admin' && (
          <button onClick={() => navigate('/admin')} className="text-brand-accent hover:text-white hover:tracking-[0.3em] transition-all duration-300">Admin Panel</button>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="relative hidden xl:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder="SEARCH THE VOID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
                setIsSearchFocused(false);
              }
            }}
            className="bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-6 text-[10px] font-bold tracking-widest focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-all w-48 lg:w-72"
          />

          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {isSearchFocused && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-50"
              >
                <div className="p-2 space-y-1">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        navigate(`/marketplace?search=${encodeURIComponent(product.name)}`);
                        setSearchQuery(product.name);
                      }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-all group text-left"
                    >
                      <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/5 p-1 overflow-hidden">
                        <img 
                          src={getAssetUrl(product.imageUrl || product.images?.[0] || '')} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-md group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black uppercase tracking-tight truncate group-hover:text-brand-primary transition-colors">
                          {product.name}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold">
                          {product.type} // {product.category || 'Gear'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono font-bold text-brand-primary">
                          ${product.price}
                        </div>
                      </div>
                    </button>
                  ))}
                  <button 
                    onClick={() => navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`)}
                    className="w-full py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white border-t border-white/5 transition-all"
                  >
                    View All Results <ArrowRight className="inline-block ml-2 w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
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
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{user?.name?.split(' ')[0]}</span>
              <button 
                onClick={handleLogout}
                className="text-[8px] uppercase font-black tracking-widest text-white/30 hover:text-brand-accent transition-colors"
              >
                Disconnect
              </button>
            </div>
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
              className="text-white hover:text-brand-primary px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-brand-primary text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,255,204,0.2)]"
            >
              Register
            </button>
          </div>
        )}
        
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-64 bg-bg-card border-l border-white/10 z-[70] p-8 flex flex-col gap-8 md:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold tracking-tighter uppercase italic">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-6 text-sm font-bold uppercase tracking-widest text-white/60">
                <button 
                  onClick={() => { navigate('/marketplace?type=skin'); setIsMenuOpen(false); }} 
                  className="text-left hover:text-brand-primary transition-colors flex items-center justify-between"
                >
                  Skins <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { navigate('/marketplace?type=attachment'); setIsMenuOpen(false); }} 
                  className="text-left hover:text-brand-primary transition-colors flex items-center justify-between"
                >
                  Attachments <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { onNavigate('artists'); setIsMenuOpen(false); }} 
                  className="text-left hover:text-brand-primary transition-colors flex items-center justify-between"
                >
                  Artists <ArrowRight className="w-4 h-4" />
                </button>
                {isAuthenticated && user?.role === 'admin' ? (
                  <button 
                    onClick={() => { navigate('/admin'); setIsMenuOpen(false); }} 
                    className="text-left text-brand-accent hover:text-white transition-colors flex items-center justify-between"
                  >
                    Admin Panel <ArrowRight className="w-4 h-4" />
                  </button>
                ) : isAuthenticated ? (
                  <button 
                    onClick={() => { navigate('/account'); setIsMenuOpen(false); }} 
                    className="text-left text-brand-primary hover:text-white transition-colors flex items-center justify-between"
                  >
                    My Account <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
              <div className="mt-auto pt-8 border-t border-white/5">
                {isAuthenticated ? (
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full py-4 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                      className="w-full py-4 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => { navigate('/register'); setIsMenuOpen(false); }}
                      className="w-full py-4 bg-brand-primary text-black rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-colors"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
