import React from 'react';
import { motion } from 'motion/react';

interface MarqueeProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function Marquee({ text, speed = 30, className = "" }: MarqueeProps) {
  return (
    <div className={`relative flex overflow-x-hidden border-y border-white/10 bg-bg-card/80 backdrop-blur-xl py-4 ${className}`}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex whitespace-nowrap items-center"
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-white/90 mx-12 flex items-center gap-12">
            {text} <span className="w-3 h-3 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(0,255,204,0.5)]" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
