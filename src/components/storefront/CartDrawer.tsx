import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight, Zap } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, cartCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg-card border-l border-white/10 z-[90] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Cart</h2>
                  <p className="text-[10px] text-white/40 font-mono">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-16">
                  {/* Glowing cart icon */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-brand-primary/20 blur-xl scale-150" />
                    <div className="relative w-20 h-20 bg-brand-primary/5 rounded-2xl border border-brand-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,204,0.08)]">
                      <ShoppingCart className="w-9 h-9 text-brand-primary/40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-black uppercase tracking-widest text-sm">Loadout Empty</p>
                    <p className="text-white/30 text-[11px] font-mono max-w-[200px]">Your cart has no active items. Browse the marketplace to add drops.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-1 flex items-center gap-2 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 text-brand-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    <Zap className="w-3 h-3" /> Browse Market
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cartItems.map(item => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Zap className="w-6 h-6 text-brand-primary/40" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-wider text-white truncate">{item.name}</p>
                        <p className="text-brand-primary text-sm font-black mt-0.5">${item.price.toFixed(2)}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3 h-3 text-white/60" />
                          </button>
                          <span className="text-xs font-black text-white w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3 text-white/60" />
                          </button>
                        </div>
                      </div>

                      {/* Line Total + Remove */}
                      <div className="flex flex-col items-end justify-between flex-shrink-0">
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-[11px] font-bold text-white/60">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="flex-shrink-0 p-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">Order Total</span>
                  <span className="text-xl font-black text-brand-primary">${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-brand-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
