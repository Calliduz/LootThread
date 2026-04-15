import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
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
    <div className="relative w-full h-[500px] overflow-hidden rounded-[2rem] border border-white/5 bg-bg-card">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col md:flex-row items-center"
        >
          <div className="w-full md:w-1/2 h-full relative">
            <img 
              src={getAssetUrl(currentProduct.imageUrl || currentProduct.images?.[0]) || `https://picsum.photos/seed/${currentProduct.id}/800/800`} 
              alt={currentProduct.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent md:bg-gradient-to-r" />
          </div>
          
          <div className="w-full md:w-1/2 p-8 md:p-12 z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-brand-primary/20 text-brand-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-brand-primary/30">
                Featured Drop
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 leading-none">
              {currentProduct.name}
            </h2>
            <p className="text-white/60 mb-8 max-w-md line-clamp-3">
              {currentProduct.description}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Price</span>
                <span className="text-3xl font-mono font-bold text-brand-primary">${currentProduct.price}</span>
              </div>
              <button 
                onClick={() => onProductClick(currentProduct)}
                className="bg-brand-primary text-black px-8 py-4 rounded-2xl font-bold uppercase tracking-tighter hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-brand-primary/20"
              >
                View Details
              </button>
            </div>
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
