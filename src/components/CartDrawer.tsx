import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg-card border-l border-white/10 z-[110] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-brand-primary" />
                <h2 className="text-xl font-bold uppercase italic tracking-tighter">Your Loadout</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingBag className="w-16 h-16 mb-4" />
                  <p className="text-sm uppercase font-bold tracking-widest">Inventory Empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/5 flex-shrink-0">
                      <img 
                        src={item.images[0] || `https://picsum.photos/seed/${item.id}/200/200`} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-sm truncate">{item.name}</h3>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-white/20 hover:text-brand-accent transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">
                        {item.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-white/5 rounded-lg border border-white/5">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 hover:text-brand-primary transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 hover:text-brand-primary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-mono font-bold text-brand-primary text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-white/40 font-bold">Total Credits</span>
                  <span className="text-2xl font-mono font-bold text-brand-primary">${total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-brand-primary text-black font-bold py-4 rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 uppercase tracking-tighter shadow-lg shadow-brand-primary/20"
                >
                  Initialize Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
