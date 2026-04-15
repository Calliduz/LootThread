import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../api/endpoints';
import { Loader2, CheckCircle, Package, CreditCard, Zap, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [gameTag, setGameTag] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redirect if empty cart
  if (cartItems.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
            <Package className="w-7 h-7 text-white/30" />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Cart is Empty</h2>
          <p className="text-white/40 text-sm">Add some loot before checking out.</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-brand-primary text-black px-8 py-3 rounded-xl font-black uppercase tracking-wider text-sm">
            Back to Market
          </button>
        </div>
      </div>
    );
  }

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 mx-auto bg-brand-primary/10 rounded-full border border-brand-primary/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Acquisition <span className="text-brand-primary">Complete</span></h2>
            <p className="text-white/40 text-sm">Your loot is locked in. Check your order history.</p>
          </div>
          <button onClick={() => navigate('/account')} className="w-full bg-brand-primary text-black px-8 py-4 rounded-xl font-black uppercase tracking-wider text-sm hover:brightness-110 transition-all">
            View Order History →
          </button>
        </div>
      </div>
    );
  }

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    // 1.5s simulated processing delay (Stripe-ready hook point)
    await new Promise(res => setTimeout(res, 1500));

    try {
      await createOrder({
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
        })),
        totalAmount: cartTotal,
        gameTag,
        paymentMethod: 'simulated',
      });

      clearCart();
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Purchase failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-16 px-6 relative">
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate('/')} className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Secure <span className="text-brand-primary">Checkout</span></h1>
            <p className="text-white/30 text-xs font-mono mt-0.5">Encrypted transaction — SSL secured</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handlePurchase}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* LEFT — Delivery Info (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Delivery Section */}
              <div className="bg-bg-card border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-brand-primary" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Digital Delivery</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">
                      In-Game Tag / Account ID
                    </label>
                    <input
                      type="text"
                      value={gameTag}
                      onChange={e => setGameTag(e.target.value)}
                      placeholder="e.g. Cipher#7734"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary/50 transition-colors font-mono placeholder-white/20"
                    />
                    <p className="text-[10px] text-white/30 ml-1">Digital goods are delivered to this account ID.</p>
                  </div>
                </div>
              </div>

              {/* Payment Section (stub) */}
              <div className="bg-bg-card border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-brand-primary" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Payment</h2>
                </div>

                <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center text-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-brand-primary/40" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/60">Stripe Integration</p>
                    <p className="text-[10px] text-white/30 mt-1">Payment processing ready for Phase 6 — Stripe Elements will mount here.</p>
                  </div>
                  {/* Credit card mock */}
                  <div className="w-full mt-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/30">Demo Card</p>
                      </div>
                      <div className="w-8 h-5 bg-brand-primary/30 rounded-sm" />
                    </div>
                    <p className="text-white/40 font-mono tracking-[0.3em] text-sm">•••• •••• •••• 4242</p>
                    <div className="flex justify-between mt-3">
                      <span className="text-[10px] text-white/30 font-mono">TEST MODE</span>
                      <span className="text-[10px] text-white/30 font-mono">12/99</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Order Summary (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-bg-card border border-white/5 rounded-3xl p-6 sticky top-28">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-brand-primary" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">
                    Order Summary
                  </h2>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Zap className="w-4 h-4 text-brand-primary/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-white/40">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-black text-white flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Digital Delivery</span>
                    <span className="text-brand-primary">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10 mt-2">
                    <span>Total</span>
                    <span className="text-brand-primary">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full mt-6 bg-brand-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Complete Purchase
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-white/20 mt-3 uppercase tracking-widest font-mono">
                  Secured by SSL encryption
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
