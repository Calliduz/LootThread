import React from 'react';
import { motion } from 'motion/react';

const ProductSkeleton = () => {
  return (
    <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden relative group">
      {/* Shimmer Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: ['-150%', '150%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-full h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -skew-x-12"
        />
      </div>

      {/* Image Skeleton */}
      <div className="aspect-square bg-white/[0.02] relative overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-white/[0.03]"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <div className="w-20 h-5 bg-white/5 rounded-md border border-white/5" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="w-3/4 h-6 bg-white/10 rounded-lg" />
          <div className="w-12 h-4 bg-brand-primary/10 rounded-md" />
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="w-full h-3 bg-white/[0.03] rounded-full" />
          <div className="w-5/6 h-3 bg-white/[0.03] rounded-full" />
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col gap-2">
            <div className="w-10 h-2 bg-white/[0.05] rounded-full uppercase tracking-widest" />
            <div className="w-20 h-7 bg-brand-primary/5 rounded-lg" />
          </div>
          
          <div className="w-12 h-12 bg-white/[0.05] rounded-xl border border-white/5" />
        </div>
      </div>

      {/* Bottom accent line skeleton */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5" />
    </div>
  );
};

export default ProductSkeleton;
