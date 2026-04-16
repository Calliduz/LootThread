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

  // Handle both string format and old object format for backward compatibility
  const textValue = typeof data === 'string' ? data : (data.text || '');
  const linkValue = typeof data === 'object' ? data.link : null;
  const speed = (typeof data === 'object' && data.speed) ? data.speed : 30;

  const Content = () => (
    <div className="flex whitespace-nowrap animate-marquee">
      {/* duplicate several times for continuous marquee effect */}
      {[...Array(15)].map((_, i) => (
        <span key={i} className="mx-4 text-xs font-bold uppercase tracking-widest text-black flex items-center">
          {textValue} 
          <span className="opacity-50 ml-8 font-black">•</span>
        </span>
      ))}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee ${speed}s linear infinite;
        }
      `}</style>
    </div>
  );

  return (
    <div className="w-full bg-brand-primary h-8 flex items-center overflow-hidden border-b border-black md:border-none">
      {linkValue ? (
        <a href={linkValue} className="w-full hover:brightness-110 active:opacity-90 block">
          <Content />
        </a>
      ) : (
         <Content />
      )}
    </div>
  );
}
