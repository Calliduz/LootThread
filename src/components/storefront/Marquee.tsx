import React from 'react';
import { useCMS } from '../../hooks/useCMS';
import { Loader2 } from 'lucide-react';

export default function Marquee() {
  const { data, loading, error } = useCMS('marquee_banner');

  if (loading) {
    return (
      <div className="w-full bg-brand-primary h-8 flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-black animate-spin" />
      </div>
    );
  }

  if (error || !data) return null; // hide entirely if no active data

  const { text, link } = data;

  const Content = () => (
    <div className="flex whitespace-nowrap animate-marquee">
      {/* duplicate several times for continuous marquee effect */}
      {[...Array(15)].map((_, i) => (
        <span key={i} className="mx-4 text-xs font-bold uppercase tracking-widest text-black flex items-center">
          {text} 
          <span className="opacity-50 ml-8 font-black">•</span>
        </span>
      ))}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );

  return (
    <div className="w-full bg-brand-primary h-8 flex items-center overflow-hidden border-b border-black md:border-none">
      {link ? (
        <a href={link} className="w-full hover:brightness-110 active:opacity-90 block">
          <Content />
        </a>
      ) : (
         <Content />
      )}
    </div>
  );
}
