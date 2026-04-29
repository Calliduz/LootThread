import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { Product } from '../types/api';
import { getAssetUrl } from '../utils/assetHelper';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
  const isSoldOut = (product.stockQuantity ?? 0) <= 0 && (product.inventory ?? 0) <= 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={isSoldOut ? {} : { 
        y: -10,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0,255,204,0.1)"
      }}
      viewport={{ once: true }}
      onClick={() => onClick?.(product)}
      className={`group relative bg-bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-brand-primary/40 transition-colors duration-500 ${onClick ? 'cursor-pointer' : ''} ${isSoldOut ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
      <div className="aspect-square overflow-hidden relative">
        <motion.img 
          src={getAssetUrl(product.imageUrl || product.images?.[0]) || `https://picsum.photos/seed/${product.id}/600/600`} 
          alt={product.name}
          whileHover={isSoldOut ? {} : { scale: 1.15, rotate: 1 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Technical Overlay */}
        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {isSoldOut ? (
            <div className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              Sold Out
            </div>
          ) : (
            <>
              {product.category === 'skin' && (
                <div className="bg-brand-accent/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
                  Artist Skin
                </div>
              )}
              {product.category === 'attachment' && (
                <div className="bg-brand-primary/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
                  Attachment
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-bold text-lg leading-tight transition-colors ${isSoldOut ? '' : 'group-hover:text-brand-primary'}`}>
            {product.name}
          </h3>
          <div className="flex items-center gap-1 text-brand-primary">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-mono">4.9</span>
          </div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0.4 }}
          whileHover={isSoldOut ? {} : { opacity: 1 }}
          className="text-white/40 text-xs line-clamp-2 mb-4 font-medium group-hover:text-white/80 transition-colors"
        >
          {product.description}
        </motion.p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Price</span>
            <span className="text-xl font-mono font-bold text-brand-primary">₱{product.price}</span>
          </div>
          
          <motion.button 
            whileHover={isSoldOut ? {} : { scale: 1.1, backgroundColor: "var(--color-brand-primary)", color: "black" }}
            whileTap={isSoldOut ? {} : { scale: 0.9 }}
            disabled={isSoldOut}
            onClick={(e) => {
              e.stopPropagation();
              if (!isSoldOut) onAddToCart(product);
            }}
            className={`p-3 rounded-xl transition-colors ${isSoldOut ? 'bg-white/5 text-white/10 cursor-not-allowed' : 'bg-white/5 hover:shadow-[0_0_20px_rgba(0,255,204,0.2)]'}`}
          >
            {isSoldOut ? <Zap className="w-5 h-5 grayscale" /> : <ShoppingCart className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </motion.div>
  );
};

export default ProductCard;
