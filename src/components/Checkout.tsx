import { useCreateOrder } from '../hooks/useApi';

export default function Checkout({ items, onComplete, onCancel }: CheckoutProps) {
  const [step, setStep] = useState<'confirm' | 'payment' | 'success'>('confirm');
  const [selectedPayment, setSelectedPayment] = useState<string>('gcash');
  const createOrderMutation = useCreateOrder();
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 15.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleProcessOrder = () => {
    const orderData = {
      items: items.map(item => ({
        productId: item.id!,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: total,
      paymentMethod: selectedPayment,
      shippingAddress: "Default Tactical Hub, NCR"
    };

    createOrderMutation.mutate(orderData, {
      onSuccess: (response) => {
        setStep('success');
        onComplete(response);
      }
    });
  };

  const isProcessing = createOrderMutation.isPending;
  const error = createOrderMutation.error ? (createOrderMutation.error as any).response?.data?.message || 'Strategic order failure. Connection compromised.' : null;

  if (step === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-card border border-brand-primary/20 p-12 rounded-[3rem] max-w-lg w-full text-center shadow-[0_0_50px_rgba(0,255,204,0.1)]"
        >
          <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-brand-primary" />
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Order Confirmed</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Your loadout has been secured. Our logistics team is preparing your gear for immediate deployment.
          </p>
          <button 
            onClick={onCancel}
            className="w-full bg-brand-primary text-black font-black py-4 rounded-2xl uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Return to Marketplace
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-12 py-12 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
          Secure <span className="text-brand-primary">Checkout</span>
        </h1>
        <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <X className="w-8 h-8 text-white/20" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-2 space-y-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-500 font-bold"
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-xl font-bold uppercase italic tracking-tighter mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-primary" /> Review Items
            </h3>
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 items-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{item.name}</h4>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">{item.category} × {item.quantity}</p>
                  </div>
                  <span className="font-mono font-bold text-brand-primary">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-xl font-bold uppercase italic tracking-tighter mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-primary" /> Payment Method
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 group ${
                    selectedPayment === method.id
                      ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(0,255,204,0.1)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${method.color}`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-center ${
                    selectedPayment === method.id ? 'text-brand-primary' : 'text-white/40'
                  }`}>
                    {method.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
              <h3 className="text-xl font-bold uppercase italic tracking-tighter mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-primary" /> Shipping
              </h3>
              <div className="space-y-2 opacity-60 text-sm">
                <p>Standard Tactical Delivery</p>
                <p>2-4 Business Days</p>
                <p className="text-brand-primary font-bold">Free for Season Pass Holders</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
              <h3 className="text-xl font-bold uppercase italic tracking-tighter mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-primary" /> Security
              </h3>
              <div className="space-y-2 opacity-60 text-sm">
                <p>End-to-End Encryption</p>
                <p>Verified Merchant</p>
                <p>Fraud Protection Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Totals & Action */}
        <div className="lg:col-span-1">
          <div className="bg-bg-card border border-white/10 rounded-[2rem] p-8 sticky top-24">
            <h3 className="text-xl font-bold uppercase italic tracking-tighter mb-8">Order Total</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-white/40 font-bold uppercase tracking-widest">Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40 font-bold uppercase tracking-widest">Shipping</span>
                <span className="font-mono">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40 font-bold uppercase tracking-widest">Tax (8%)</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-[0.2em]">Total Credits</span>
                <span className="text-3xl font-mono font-bold text-brand-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleProcessOrder}
              disabled={isProcessing}
              className="w-full bg-brand-primary text-black font-black py-5 rounded-2xl uppercase tracking-tighter flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_30px_rgba(0,255,204,0.2)] disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Finalizing...
                </>
              ) : (
                <>
                  Confirm & Pay <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <p className="text-[10px] text-center text-white/20 mt-6 uppercase font-bold tracking-widest">
              By clicking confirm, you agree to our <br /> terms of digital engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
