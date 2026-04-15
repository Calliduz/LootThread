import React from 'react';
import { FileText, ShoppingBag, CreditCard, ShieldAlert, Cpu, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-main text-white selection:bg-brand-primary selection:text-black">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-16">
          <Link 
            to="/" 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-brand-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Back to Loadout
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-xl">
              <FileText className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight leading-none">Service Terms</h1>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em] mt-2">v2.1.0 // Operational Terms</p>
            </div>
          </div>
        </div>

        {/* Content Modules */}
        <div className="space-y-12">
          {/* Section 1 */}
          <section className="relative group">
            <div className="absolute -left-6 top-1 w-px h-full bg-gradient-to-b from-brand-primary/40 to-transparent group-hover:from-brand-primary transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-4 h-4 text-brand-primary/60" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white/90">01. Acceptance of Protocol</h2>
            </div>
            <div className="text-sm leading-relaxed text-white/50">
              <p>
                By establishing a LootThread Identity or engaging in the marketplace, you acknowledge and agree to these Terms of Service. 
                This constitutes a binding digital agreement between you and LootThread Tactical. We reserve the right to 
                modify these protocols at any time without prior notification.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="relative group">
            <div className="absolute -left-6 top-1 w-px h-full bg-gradient-to-b from-brand-primary/40 to-transparent group-hover:from-brand-primary transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="w-4 h-4 text-brand-primary/60" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white/90">02. Marketplace Engagement</h2>
            </div>
            <div className="text-sm leading-relaxed text-white/50 space-y-4">
              <p>
                All digital and physical assets within the marketplace are provided on an "as-available" basis. 
                Stock levels are tracked in real-time, but inconsistencies may occur during simultaneous high-traffic drops.
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs text-white/40">
                <li>Total quantity limits may be enforced per Identity.</li>
                <li>LootThread reserves the right to cancel orders suspected of bot-assisted acquisition.</li>
                <li>Shipping costs and regional feasibility are calculated at the drop phase.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="relative group">
            <div className="absolute -left-6 top-1 w-px h-full bg-gradient-to-b from-brand-primary/40 to-transparent group-hover:from-brand-primary transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-4 h-4 text-brand-primary/60" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white/90">03. Financial Processing</h2>
            </div>
            <div className="text-sm leading-relaxed text-white/50">
              <p>
                All financial transfers are processed via the Stripe gateway. By initiating a purchase, you authorize the 
                extraction of funds matching the calculated total. LootThread is not responsible for any overdraft or conversion 
                fees applied by your financial node.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="relative group p-8 bg-brand-primary/5 border border-brand-primary/20 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">04. Liability Discharge</h2>
            </div>
            <div className="text-sm leading-relaxed text-white/70">
              <p>
                LootThread Tactical provides a platform for apparel acquisition. To the maximum extent permitted 
                by governing laws, we discharge all liability for digital downtime, shipping delays, or secondary 
                market value fluctuations of acquired assets.
              </p>
              <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/5 text-[10px] font-mono leading-tight uppercase tracking-tight text-white/40">
                LootThread is a project under development. Assets are acquired "AS-IS". 
                The platform is optimized for modern browsing environments. Minimum specs required.
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">
            Failure to comply with Terms of Service results in immediate Identity termination.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
