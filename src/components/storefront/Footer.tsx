import React from 'react';
import { useCMS } from '../../hooks/useCMS';
import { Twitter, Instagram, Disc as Discord, Youtube, Github, Link as LinkIcon, Loader2 } from 'lucide-react';

const renderIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x': 
      return <Twitter className="w-5 h-5" />;
    case 'instagram': 
      return <Instagram className="w-5 h-5" />;
    case 'discord': 
      return <Discord className="w-5 h-5" />;
    case 'youtube': 
      return <Youtube className="w-5 h-5" />;
    case 'github': 
      return <Github className="w-5 h-5" />;
    default: 
      return <LinkIcon className="w-5 h-5" />;
  }
};

export default function Footer() {
  const { data: socials, loading } = useCMS('footer_socials');

  return (
    <footer className="border-t border-white/5 bg-bg-base py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Branding */}
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">
            Loot<span className="text-brand-primary">Thread</span>
          </h2>
          <p className="text-white/40 text-xs font-mono tracking-widest uppercase">
            Equip up. Stand out.
          </p>
        </div>

        {/* Dynamic Socials */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-4 text-white/20">
               {[...Array(3)].map((_, i) => (
                 <Loader2 key={i} className="w-5 h-5 animate-spin" />
               ))}
            </div>
          ) : Array.isArray(socials) && socials.length > 0 ? (
            socials.map((social: { platform: string; url: string }, index: number) => (
              <a 
                key={index}
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/10 transition-all active:scale-95"
                title={social.platform}
              >
                {renderIcon(social.platform)}
              </a>
            ))
          ) : (
             <div className="text-xs text-white/30 italic">Connect with us online</div>
          )}
        </div>
      </div>
      
      {/* Copyright & Legal */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/30 uppercase tracking-widest font-mono">
        <div>© {new Date().getFullYear()} LootThread. All rights reserved.</div>
        <div className="flex gap-6 items-center">
          <a href="/privacy" className="hover:text-brand-primary transition-colors">Privacy Protocol</a>
          <span>// Terminate Data</span>
        </div>
      </div>
    </footer>
  );
}
