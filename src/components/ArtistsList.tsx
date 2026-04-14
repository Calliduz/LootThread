import React from 'react';
import { motion } from 'motion/react';
import { Zap, Star, ExternalLink, Loader2 } from 'lucide-react';
import { useArtists } from '../hooks/useApi';

export default function ArtistsList() {
  const { data: artists = [], isLoading } = useArtists();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
        <p className="text-white/40 uppercase font-black tracking-widest text-xs">Loading Creators</p>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-12 py-24 max-w-7xl mx-auto">
      <div className="mb-16">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4">
          The <span className="text-brand-accent">Creators</span>
        </h1>
        <p className="text-white/40 uppercase tracking-widest text-xs font-bold">The minds behind the glitch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist, i) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-bg-card border border-white/5 rounded-[2rem] p-8 hover:border-brand-accent/30 transition-all duration-500"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <img 
                  src={artist.avatar} 
                  alt={artist.name} 
                  className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 p-2 group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-2 -right-2 bg-brand-accent p-1.5 rounded-lg text-white">
                  <Zap className="w-3 h-3 fill-current" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight group-hover:text-brand-accent transition-colors">
                  @{artist.name}
                </h3>
                <div className="flex items-center gap-2 text-brand-primary mt-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-mono font-bold">{artist.rating} Rating</span>
                </div>
              </div>
            </div>

            <p className="text-white/60 text-sm leading-relaxed mb-8">
              {artist.bio}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Total Sales</p>
                <p className="text-xl font-mono font-bold text-white">{artist.salesCount}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Drops</p>
                <p className="text-xl font-mono font-bold text-white">{artist.activeSkinsCount || 0}</p>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-brand-accent hover:text-white border border-white/10 rounded-2xl font-bold uppercase tracking-tighter transition-all group-hover:shadow-lg group-hover:shadow-brand-accent/20">
              View Collection <ExternalLink className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
