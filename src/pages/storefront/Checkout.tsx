import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../../contexts/CartContext';
import { createOrder, createPaymentIntent, getProfile, validatePromoCode, getEligiblePromoCodes } from '../../api/endpoints';
import { getAssetUrl } from '../../utils/assetHelper';
import { Loader2, CheckCircle, Package, Zap, ArrowLeft, ShieldCheck, MapPin, Tag, X, BadgePercent } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock');

// ─── Stripe Appearance: Full Dark Mode ────────────────────────────────────────
const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#00ffcc',
    colorBackground: '#0f0f0f',
    colorText: '#ffffff',
    colorTextSecondary: '#ffffff80',
    colorDanger: '#f87171',
    borderRadius: '12px',
    fontFamily: '"Inter", sans-serif',
    fontSizeBase: '13px',
  },
  rules: {
    '.Input': { backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' },
    '.Input:focus': { border: '1px solid rgba(0,255,204,0.5)', boxShadow: '0 0 0 2px rgba(0,255,204,0.1)' },
    '.Label': { color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' },
  },
};

interface DeliveryAddress {
  _id?: string;
  label: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface PaymentIntentData {
  clientSecret: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  appliedPromoCode: string | null;
}

// ─── CheckoutForm ─────────────────────────────────────────────────────────────
function CheckoutForm({
  savedAddresses,
  cartSnapshot,
  intentData,
  promoProps,
  autoAppliedPromo,
}: {
  savedAddresses: DeliveryAddress[];
  cartSnapshot: any[];
  intentData: PaymentIntentData;
  promoProps: any;
  autoAppliedPromo: string | null;
}) {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [selectedAddrIdx, setSelectedAddrIdx] = useState<number | 'new'>(savedAddresses.length > 0 ? 0 : 'new');
  const [manualAddr, setManualAddr] = useState({ street: '', city: '', zip: '', country: '' });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paidTotal, setPaidTotal] = useState(0);
  const [paidItems] = useState(cartSnapshot);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-brand-primary/10 rounded-full border border-brand-primary/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-1">
                Acquisition <span className="text-brand-primary">Complete</span>
              </h2>
              <p className="text-white/40 text-sm">Payment confirmed. Loot secured. XP granted!</p>
            </div>
          </div>

          <div className="bg-bg-card border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-brand-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Receipt</h3>
            </div>
            {orderId && (
              <div className="flex justify-between text-[10px] font-mono border-b border-white/5 pb-3">
                <span className="text-white/40 uppercase tracking-widest">Order ID</span>
                <span className="text-white">#{orderId.slice(-8).toUpperCase()}</span>
              </div>
            )}
            <div className="space-y-2">
              {paidItems.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.imageUrl ? <img src={getAssetUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" /> : <Zap className="w-4 h-4 text-brand-primary/40" />}
                  </div>
                  <p className="text-xs text-white/60 flex-1 truncate">{item.name}</p>
                  <span className="text-[10px] text-white/30">×{item.quantity}</span>
                  <span className="text-xs font-bold text-white">₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between font-black">
              <span className="text-sm text-white">Total Paid</span>
              <span className="text-sm text-brand-primary">₱{paidTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/account')} className="w-full bg-brand-primary text-black px-8 py-4 rounded-xl font-black uppercase tracking-wider text-sm hover:brightness-110 transition-all">
              View Order History →
            </button>
            <button onClick={() => navigate('/')} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
              Back to Market
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment handler ────────────────────────────────────────────────────────
  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError('');

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
      if (stripeError) {
        const msg = stripeError.message || 'Payment failed.';
        setError(msg); toast.error(msg);
        setProcessing(false); return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const deliveryAddress = selectedAddrIdx === 'new'
          ? `${manualAddr.street}, ${manualAddr.city}, ${manualAddr.zip}, ${manualAddr.country}`
          : (() => { const a = savedAddresses[selectedAddrIdx as number]; return `${a.street}, ${a.city}, ${a.zip}, ${a.country}`; })();

        const order = await createOrder({
          items: cartItems.map(item => ({ productId: item.productId, name: item.name, price: item.price, imageUrl: item.imageUrl, quantity: item.quantity })),
          totalAmount: intentData.total,
          deliveryAddress,
          paymentMethod: 'stripe',
          promoCode: intentData.appliedPromoCode || undefined,
        } as any);

        setPaidTotal(intentData.total);
        const finalId = order?.orderId || order?._id || '';
        setOrderId(finalId);
        toast.success('🎉 Purchase complete! XP granted!');
        clearCart();
        navigate(`/receipt/${finalId}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Purchase failed. Please try again.';
      setError(msg); toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const { subtotal, discountPercent, discountAmount, total, appliedPromoCode } = intentData;

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-16 px-6 relative">
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate('/')} className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Secure <span className="text-brand-primary">Checkout</span>
            </h1>
            <p className="text-white/30 text-xs font-mono mt-0.5">Encrypted transaction — SSL secured</p>
          </div>
        </div>

        {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold">{error}</div>}

        <form onSubmit={handlePurchase}>
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8">

            {/* Left column — Payment & Address */}
            <div className="order-2 lg:order-1 lg:col-span-3 space-y-6">

              {/* Delivery Address */}
              <div className="bg-bg-card border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-brand-primary" /></div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Delivery Address</h2>
                </div>
                <div className="space-y-3">
                  {savedAddresses.map((addr, idx) => (
                    <label key={idx} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddrIdx === idx ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                      <input type="radio" name="deliveryAddr" className="mt-1 accent-[#00ffcc]" checked={selectedAddrIdx === idx} onChange={() => setSelectedAddrIdx(idx)} />
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest mb-0.5">
                          {addr.label}
                          {addr.isDefault && <span className="ml-2 text-[9px] bg-brand-primary/20 text-brand-primary border border-brand-primary/20 px-1.5 py-0.5 rounded font-bold">Default</span>}
                        </p>
                        <p className="text-[10px] text-white/40 font-mono">{addr.street}, {addr.city}, {addr.zip}, {addr.country}</p>
                      </div>
                    </label>
                  ))}
                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddrIdx === 'new' ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                    <input type="radio" name="deliveryAddr" className="mt-1 accent-[#00ffcc]" checked={selectedAddrIdx === 'new'} onChange={() => setSelectedAddrIdx('new')} />
                    <div className="flex-1">
                      <p className="text-xs font-black text-white uppercase tracking-widest mb-2">Enter a new address</p>
                      {selectedAddrIdx === 'new' && (
                        <div className="space-y-2">
                          <input type="text" placeholder="Street Address" required value={manualAddr.street} onChange={e => setManualAddr({ ...manualAddr, street: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/50 placeholder-white/20" />
                          <div className="flex gap-2">
                            <input type="text" placeholder="City" required value={manualAddr.city} onChange={e => setManualAddr({ ...manualAddr, city: e.target.value })} className="w-1/2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/50 placeholder-white/20" />
                            <input type="text" placeholder="ZIP" required value={manualAddr.zip} onChange={e => setManualAddr({ ...manualAddr, zip: e.target.value })} className="w-1/2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/50 placeholder-white/20" />
                          </div>
                          <input type="text" placeholder="Country" required value={manualAddr.country} onChange={e => setManualAddr({ ...manualAddr, country: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/50 placeholder-white/20" />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Element */}
              <div className="bg-bg-card border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-brand-primary" /></div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Payment</h2>
                </div>
                <div className="rounded-xl overflow-hidden"><PaymentElement /></div>
              </div>
            </div>

            {/* Right column — Order Summary */}
            <div className="order-1 lg:order-2 lg:col-span-2">
              <div className="bg-bg-card border border-white/5 rounded-3xl p-6 sticky top-28">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-brand-primary" /></div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Order Summary</h2>
                </div>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
                  {cartItems.map(item => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                        {item.imageUrl ? <img src={getAssetUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center"><Zap className="w-4 h-4 text-brand-primary/40" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-white/40">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-black text-white flex-shrink-0">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Shipping</span><span className="text-white/30 italic">Calculated at delivery</span>
                  </div>

                  {/* Discount line item */}
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-xs font-black text-brand-primary bg-brand-primary/5 border border-brand-primary/20 rounded-xl px-3 py-2">
                      <span className="flex items-center gap-1.5">
                        <BadgePercent className="w-3 h-3" />
                        Promo: {appliedPromoCode} ({discountPercent}% off)
                      </span>
                      <span>-₱{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10 mt-2 mb-4">
                    <span>Total</span><span className="text-brand-primary">₱{total.toFixed(2)}</span>
                  </div>

                  {/* Desktop Promo Code Input */}
                  <div className="hidden lg:block pt-4 border-t border-white/10">
                    {autoAppliedPromo && appliedPromoCode === autoAppliedPromo && (
                      <div className="mb-3 px-3 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                          Auto-Applied Your Best Perk! (-{discountPercent}%)
                        </span>
                      </div>
                    )}
                    <PromoCodeInput {...promoProps} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!stripe || processing}
                  className="w-full mt-6 bg-brand-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {processing ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <><ShieldCheck className="w-4 h-4" />Complete Purchase</>}
                </button>
                <p className="text-center text-[10px] text-white/20 mt-3 uppercase tracking-widest font-mono">Secured by Stripe</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── CheckoutLoader: handles promo code state + payment intent ─────────────────
function CheckoutLoader() {
  const { cartItems } = useCart();
  const [intentData, setIntentData] = useState<PaymentIntentData | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [cartSnapshot, setCartSnapshot] = useState<any[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [autoAppliedPromo, setAutoAppliedPromo] = useState<string | null>(null);

  const fetchPaymentIntent = async (promoCode?: string) => {
    try {
      const data = await createPaymentIntent({
        items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        promoCode,
      });
      setIntentData(data);
    } catch (err) {
      console.error('Failed to init payment intent', err);
    }
  };

  useEffect(() => {
    setCartSnapshot(cartItems.map(i => ({ ...i })));
    getProfile().then(data => { if (data.deliveryAddresses) setSavedAddresses(data.deliveryAddresses); }).catch(console.error);

    // Fetch eligible promos, auto-apply the best one
    getEligiblePromoCodes().then(async (promos) => {
      let initialPromo;
      if (promos && promos.length > 0) {
        initialPromo = promos[0].code;
        setAppliedPromo(initialPromo);
        setAutoAppliedPromo(initialPromo);
        toast.success(`Auto-applied your best perk: ${initialPromo}!`);
      }
      await fetchPaymentIntent(initialPromo);
    }).catch(async (err) => {
      console.error('Failed to fetch eligible promos', err);
      // Fallback
      await fetchPaymentIntent();
    });
  }, []);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setValidatingPromo(true);
    setPromoError('');
    try {
      await validatePromoCode(promoInput.trim());
      setAppliedPromo(promoInput.trim().toUpperCase());
      await fetchPaymentIntent(promoInput.trim());
      toast.success('Promo code applied!');
    } catch (err: any) {
      setPromoError(err.response?.data?.message || 'Invalid promo code.');
      setAppliedPromo(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = async () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
    await fetchPaymentIntent();
  };

  if (!intentData) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6 text-white text-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
        <p className="font-bold uppercase tracking-widest text-sm text-white/60">Initializing secure gateway...</p>
      </div>
    );
  }

  const promoProps = {
    promoInput, setPromoInput, promoError, appliedPromo, validatingPromo, onApply: handleApplyPromo, onRemove: handleRemovePromo
  };

  return (
    <div>
      {/* Promo Code Banner (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card/95 backdrop-blur-xl border-t border-white/5 p-4 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {autoAppliedPromo && appliedPromo === autoAppliedPromo && (
          <div className="mb-2 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
              Auto-Applied Your Best Perk!
            </span>
          </div>
        )}
        <PromoCodeInput {...promoProps} />
      </div>
      <Elements key={intentData.clientSecret} stripe={stripePromise} options={{ clientSecret: intentData.clientSecret, appearance: stripeAppearance }}>
        <CheckoutForm savedAddresses={savedAddresses} cartSnapshot={cartSnapshot} intentData={intentData} promoProps={promoProps} autoAppliedPromo={autoAppliedPromo} />
      </Elements>
    </div>
  );
}

// ─── Reusable Promo Code Input ────────────────────────────────────────────────
function PromoCodeInput({ promoInput, setPromoInput, promoError, appliedPromo, validatingPromo, onApply, onRemove }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
        <Tag className="w-3 h-3 text-brand-primary" /> Promo Code
      </label>
      {appliedPromo ? (
        <div className="flex items-center justify-between bg-brand-primary/10 border border-brand-primary/30 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-brand-primary" />
            <span className="text-brand-primary font-black text-xs tracking-widest">{appliedPromo} — Applied!</span>
          </div>
          <button type="button" onClick={onRemove} className="text-white/30 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text" value={promoInput} onChange={e => setPromoInput(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono tracking-widest outline-none focus:border-brand-primary/50 placeholder-white/20 uppercase"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onApply())}
          />
          <button type="button" onClick={onApply} disabled={validatingPromo || !promoInput.trim()}
            className="bg-white/10 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/30 text-white text-xs font-black uppercase tracking-widest px-4 rounded-xl transition-all disabled:opacity-50"
          >
            {validatingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
          </button>
        </div>
      )}
      {promoError && <p className="text-red-400 text-[10px] font-bold">{promoError}</p>}
    </div>
  );
}

// ─── Wrapper: empty-cart guard ─────────────────────────────────────────────────
export default function CheckoutWrapper() {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
            <Package className="w-7 h-7 text-white/30" />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Cart is Empty</h2>
          <p className="text-white/40 text-sm">Add some loot before checking out.</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-brand-primary text-black px-8 py-3 rounded-xl font-black uppercase tracking-wider text-sm hover:brightness-110 transition-all">
            Back to Market
          </button>
        </div>
      </div>
    );
  }

  return <CheckoutLoader />;
}
