import React from 'react';
import { Shield, Lock, Eye, Trash2, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-main text-white selection:bg-brand-primary selection:text-black">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary/5 blur-[120px] rounded-full" />
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
              <Shield className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight leading-none">Privacy Protocol</h1>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em] mt-2">v1.0.4 // Established 2026</p>
            </div>
          </div>
        </div>

        {/* Content Modules */}
        <div className="space-y-12">
          {/* Section 1 */}
          <section className="relative group">
            <div className="absolute -left-6 top-1 w-px h-full bg-gradient-to-b from-brand-primary/40 to-transparent group-hover:from-brand-primary transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-4 h-4 text-brand-primary/60" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white/90">01. Data Extraction</h2>
            </div>
            <div className="text-sm leading-relaxed text-white/50 space-y-4">
              <p>
                To provide the LootThread experience, we collect specific telemetry regarding your profile and transactions. 
                This includes names, email addresses, and shipping coordinates used for order fulfillment.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <h3 className="text-[10px] font-black uppercase text-brand-primary mb-2">Direct Input</h3>
                  <p className="text-xs">Profiles created via standard registration methods, including encrypted password hashes.</p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <h3 className="text-[10px] font-black uppercase text-brand-primary mb-2">OAuth Linking</h3>
                  <p className="text-xs">Identity tokens from Google and Facebook provide simplified access to the platform.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="relative group">
            <div className="absolute -left-6 top-1 w-px h-full bg-gradient-to-b from-brand-primary/40 to-transparent group-hover:from-brand-primary transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-4 h-4 text-brand-primary/60" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white/90">02. Security & Verification</h2>
            </div>
            <div className="text-sm leading-relaxed text-white/50">
              <p>
                All sensitive data is contained within high-security environments. Payments are processed exclusively through 
                <strong className="text-white mx-1 font-bold">Stripe</strong>. No payment instrument details (credit card numbers or CVVs) 
                ever touch LootThread's internal servers. We utilize industry-standard TLS encryption for all data transmissions.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="relative group">
            <div className="absolute -left-6 top-1 w-px h-full bg-gradient-to-b from-brand-primary/40 to-transparent group-hover:from-brand-primary transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-4 h-4 text-brand-primary/60" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white/90">03. Third-Party Nodes</h2>
            </div>
            <div className="text-sm leading-relaxed text-white/50">
              <p>
                We collaborate with trusted external nodes to power specific LootThread subsystems:
              </p>
              <ul className="mt-4 list-disc list-inside space-y-2 text-xs">
                <li><strong className="text-white/80">Google / Meta</strong>: Used solely for identity verification and account creation.</li>
                <li><strong className="text-white/80">SendGrid</strong>: Dispatches OTP security codes and order confirmation receipts.</li>
                <li><strong className="text-white/80">Stripe</strong>: Manages all financial operations and fraud prevention.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="relative group p-8 bg-brand-primary/5 border border-brand-primary/20 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">04. Data Deletion Protocol</h2>
            </div>
            <div className="text-sm leading-relaxed text-white/70">
              <p>
                In compliance with global data sovereignty standards, users maintain absolute control over their digital footprint. 
                If you wish to terminate your LootThread account and purge all associated personal telemetry:
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-black/20 p-4 rounded-xl border border-white/5 text-xs">
                  <span className="block text-brand-primary font-bold mb-1 uppercase tracking-tighter">Automated Method</span>
                  Access the Profile section within your Account dashboard and initiate the "Decommission Account" sequence.
                </div>
                <div className="flex-1 bg-black/20 p-4 rounded-xl border border-white/5 text-xs">
                  <span className="block text-brand-primary font-bold mb-1 uppercase tracking-tighter">Manual Override</span>
                  Dispatch a request to <strong className="text-white underline">support@lootthread.clev.studio</strong> referencing your registered email.
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">
            © {new Date().getFullYear()} LootThread Tactical Apparel. Operational Security First.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
