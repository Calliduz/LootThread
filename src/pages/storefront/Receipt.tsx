import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyOrders } from '../../api/endpoints';
import { CheckCircle, Package, Zap, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { getAssetUrl } from '../../utils/assetHelper';

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We fetch all my orders and find the matching one
    getMyOrders()
      .then(orders => {
        const found = orders.find((o: any) => o._id === id);
        setOrder(found);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 text-white text-center">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Receipt Not Found</h2>
          <button onClick={() => navigate('/account')} className="bg-brand-primary text-black px-8 py-3 rounded-xl font-black uppercase tracking-wider text-sm">Return to Account</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-16 px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] bg-brand-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-10">
          <CheckCircle className="w-16 h-16 text-brand-primary" />
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-2">
              Order <span className="text-brand-primary">Secured</span>
            </h1>
            <p className="text-white/40 text-sm font-mono uppercase tracking-[0.2em]">Transaction ID: #{order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Receipt Card */}
        <div className="bg-bg-card border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative">
          {/* Subtle Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-[0.03]" />

          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-brand-primary" />
              <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Purchase Summary</h2>
            </div>
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-4 mb-8">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 relative">
                  {item.imageUrl
                    ? <img src={getAssetUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><Zap className="w-6 h-6 text-brand-primary/20" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{item.name}</p>
                  <p className="text-xs text-brand-primary/60 font-mono mt-0.5">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">₱{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-[10px] text-white/20 font-mono">₱{item.price} ea</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10">
            <div className="flex justify-between text-xs text-white/40 font-bold uppercase tracking-widest">
              <span>Payment Protocol</span>
              <span className="text-white">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-xs text-white/40 font-bold uppercase tracking-widest">
              <span>Status</span>
              <span className="text-brand-primary">Authorized</span>
            </div>
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/5">
              <span className="text-base font-black text-white uppercase tracking-tighter">Total Captured</span>
              <span className="text-2xl font-black text-brand-primary italic tracking-tight">₱{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Post-Purchase Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/account')}
            className="group flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-brand-primary/40 p-5 rounded-2xl transition-all"
          >
            <ExternalLink className="w-5 h-5 text-brand-primary group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-black uppercase tracking-wider text-white">Track Deployment</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-3 bg-brand-primary text-black p-5 rounded-2xl font-black uppercase tracking-wider text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,255,204,0.15)]"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Market
          </button>
        </div>

        <p className="text-center text-[10px] text-white/20 mt-12 uppercase tracking-[0.3em] font-mono leading-relaxed">
          This document serves as proof of gear acquisition.<br />
          Encrypted & Logged securely.
        </p>
      </div>
    </div>
  );
}
