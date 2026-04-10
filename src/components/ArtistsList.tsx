import React from 'react';
import { motion } from 'motion/react';
import { User, Star, ExternalLink, Zap } from 'lucide-react';

const MOCK_ARTISTS = [
  {
    id: 'a1',
    name: 'LootArtist',
    bio: 'Specializing in glitch-art and cyberpunk aesthetics. Designing since Season 0.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LootArtist',
    sales: '12K+',
    rating: 4.9
  },
  {
    id: 'a2',
    name: 'NeonOni',
    bio: 'Traditional Japanese motifs meets futuristic neon. Every skin tells a story.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NeonOni',
    sales: '8K+',
    rating: 4.8
  },
  {
    id: 'a3',
    name: 'VoidWalker',
    bio: 'Minimalist designs for the stealthy player. Dark mode is the only mode.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VoidWalker',
    sales: '5K+',
    rating: 4.7
  }
];

export default function ArtistsList() {
  return (
    <div className="px-6 lg:px-12 py-24 max-w-7xl mx-auto">
      <div className="mb-16">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4">
          The <span className="text-brand-accent">Creators</span>
        </h1>
        <p className="text-white/40 uppercase tracking-widest text-xs font-bold">The minds behind the glitch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_ARTISTS.map((artist, i) => (
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
                <p className="text-xl font-mono font-bold text-white">{artist.sales}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Drops</p>
                <p className="text-xl font-mono font-bold text-white">12</p>
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
