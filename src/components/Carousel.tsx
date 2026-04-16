import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { Product } from '../types/api';
import { getAssetUrl } from '../utils/assetHelper';

interface CarouselProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function Carousel({ products, onProductClick }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [products.length]);

  if (products.length === 0) return null;

  const currentProduct = products[currentIndex];

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-[2rem] border border-white/5 bg-bg-card">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={getAssetUrl(currentProduct.imageUrl || currentProduct.images?.[0]) || `https://picsum.photos/seed/${currentProduct.id}/1200/800`} 
              alt={currentProduct.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Gradient for Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
          
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-16 lg:p-24 z-10 flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-md border border-white/10 p-6 md:p-10 rounded-[2.5rem] flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <span className="bg-brand-primary text-black text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(0,255,204,0.3)]">
                  Tactical Selection
                </span>
              </div>
              
              <h2 className="text-3xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 md:mb-6 leading-none text-white drop-shadow-2xl">
                {currentProduct.name}
              </h2>
              
              <p className="text-white/60 text-[10px] md:text-xl mb-6 md:mb-10 max-w-xl font-medium leading-relaxed drop-shadow-lg line-clamp-3 md:line-clamp-none">
                {currentProduct.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Payload Value</span>
                  <span className="text-4xl md:text-5xl font-black text-brand-primary tracking-tighter leading-none">₱{currentProduct.price}</span>
                </div>
                
                <button 
                  onClick={() => onProductClick(currentProduct)}
                  className="bg-brand-primary text-black px-8 py-4 md:px-10 md:py-5 rounded-2xl font-black uppercase tracking-tighter hover:brightness-110 transition-all duration-300 shadow-[0_0_30px_rgba(0,255,204,0.2)] active:scale-95 flex items-center gap-3 group"
                >
                  Acquire Loot <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 flex gap-2 z-20">
        <button 
          onClick={prev}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={next}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-8 flex gap-2 z-20">
        {products.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-brand-primary' : 'w-2 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}
