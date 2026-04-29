import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ArrowLeft, Star, Zap, Shield, Truck, RotateCcw, Send, MessageSquare, User as UserIcon } from 'lucide-react';
import { Product } from '../types/api';
import { getAssetUrl } from '../utils/assetHelper';
import { getRelatedProducts, getProductReviews, addReview } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  rating: number;
  comment: string;
  isVerified?: boolean;
  createdAt: string;
}

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export default function ProductDetail({ 
  product, 
  allProducts, 
  onBack, 
  onAddToCart, 
  onProductClick 
}: ProductDetailProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Recommendation Logic
  React.useEffect(() => {
    setLoadingRelated(true);
    getRelatedProducts(product.id)
      .then(data => setRelatedProducts(data))
      .catch(console.error)
      .finally(() => setLoadingRelated(false));
    
    // Fetch Reviews
    setLoadingReviews(true);
    getProductReviews(product.id)
      .then(data => {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      })
      .catch(console.error)
      .finally(() => setLoadingReviews(false));
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await addReview({
        productId: product.id,
        rating: newRating,
        comment: newComment
      });
      toast.success('Review transmitted successfully.');
      setNewComment('');
      setNewRating(5);
      
      // Refresh reviews
      const data = await getProductReviews(product.id);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to transmit review.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="px-6 lg:px-12 py-12 max-w-7xl mx-auto w-full">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Marketplace</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
        {/* Product Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 bg-bg-card"
        >
          <img 
            src={getAssetUrl(product.imageUrl || product.images?.[0]) || `https://picsum.photos/seed/${product.id}/800/800`} 
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-6 left-6">
            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
              ((product.stockQuantity ?? 0) <= 0 && (product.inventory ?? 0) <= 0)
                ? 'bg-red-500/20 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : product.category === 'skin' ? 'bg-brand-primary/20 border-brand-primary/30 text-brand-primary' : 'bg-brand-primary/20 border-brand-primary/30 text-brand-primary'
            }`}>
              {((product.stockQuantity ?? 0) <= 0 && (product.inventory ?? 0) <= 0) ? 'Sold Out' : product.category === 'skin' || product.type === 'skin' ? 'Legendary Skin' : 'Pro Attachment'}
            </span>
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <div className="flex items-center gap-2 mb-4 text-brand-primary">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : 'text-white/10'}`} 
              />
            ))}
            <span className="text-xs font-mono font-bold ml-2 text-white/60">{averageRating.toFixed(1)} ({totalReviews} Reviews)</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6 leading-none">
            {product.name}
          </h1>

          <p className="text-xl text-white/60 mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-8 mb-10">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-white/30 font-bold mb-1">Price</span>
              <span className="text-4xl font-mono font-bold text-brand-primary">₱{product.price}</span>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-white/30 font-bold mb-1">Inventory</span>
              <span className={`text-xl font-mono font-bold ${((product.stockQuantity ?? 0) <= 0 && (product.inventory ?? 0) <= 0) ? 'text-red-500' : 'text-white'}`}>
                {product.stockQuantity ?? product.inventory ?? 0} Units
              </span>
            </div>
          </div>

          {(product.stockQuantity ?? 0) <= 0 && (product.inventory ?? 0) <= 0 ? (
            <div className="flex flex-col gap-4">
              <button 
                disabled
                className="w-full bg-white/5 text-white/20 py-5 rounded-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-3 cursor-not-allowed border border-white/5"
              >
                Out of Stock <Zap className="w-5 h-5 opacity-20" />
              </button>
              <p className="text-center text-[10px] uppercase font-black tracking-widest text-red-500/60 animate-pulse">
                Deployment Delayed: Awaiting Restock
              </p>
            </div>
          ) : (
            <button 
              onClick={() => onAddToCart(product)}
              className="w-full bg-brand-primary text-black py-5 rounded-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_30px_rgba(0,255,204,0.2)]"
            >
              Add to Loadout <ShoppingCart className="w-5 h-5" />
            </button>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 mt-12">
            {[
              { icon: Shield, text: 'Secure Payment' },
              { icon: Truck, text: 'Fast Delivery' },
              { icon: RotateCcw, text: 'Easy Returns' }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <badge.icon className="w-5 h-5 text-white/40" />
                </div>
                <span className="text-[8px] uppercase font-black tracking-widest text-white/30">{badge.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <section className="mt-24 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">
            User <span className="text-brand-primary">Reviews</span>
          </h2>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <MessageSquare className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">{reviews.length} Total</span>
          </div>
        </div>

        {/* Review Form */}
        {user ? (
          <motion.form 
            onSubmit={handleSubmitReview}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-bg-card border border-white/10 p-8 rounded-[2rem] mb-16"
          >
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={getAssetUrl(user.photoURL) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                alt="Profile" 
                className="w-12 h-12 rounded-xl border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-white/80">{user.displayName || 'Anonymous'}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`transition-colors ${star <= newRating ? 'text-brand-primary' : 'text-white/10'}`}
                    >
                      <Star className={`w-4 h-4 ${star <= newRating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="SHARE YOUR EXPERIENCE WITH THIS LOOT..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:border-brand-primary/50 transition-all min-h-[120px] mb-6"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-primary text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? 'Transmitting...' : 'Post Review'} <Send className="w-4 h-4" />
            </button>
          </motion.form>
        ) : (
          <div className="bg-white/5 border border-dashed border-white/10 p-12 rounded-[2rem] text-center mb-16">
            <UserIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Please connect your account to post a review.</p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {loadingReviews ? (
               [...Array(3)].map((_, i) => (
                 <div key={`review-skele-${i}`} className="h-32 w-full bg-white/5 rounded-3xl animate-pulse" />
               ))
            ) : reviews.map((review) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/5 border border-white/5 p-8 rounded-[2rem] relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={review.userId?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userId?._id}`} 
                      alt={review.userId?.name} 
                      className="w-10 h-10 rounded-lg border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black uppercase tracking-widest text-white/80">{review.userId?.name}</p>
                        {review.isVerified && (
                          <div className="bg-brand-primary/10 text-brand-primary text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-brand-primary/20">
                            Verified Buyer
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < review.rating ? 'text-brand-primary fill-current' : 'text-white/10'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/20">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {reviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/20 font-black uppercase tracking-[0.2em] italic">No intel reported yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="mt-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">
            Pairs <span className="text-brand-primary">Well With</span>
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {loadingRelated ? (
              [...Array(4)].map((_, i) => (
                <motion.div
                  key={`rec-skeleton-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ProductSkeleton />
                </motion.div>
              ))
            ) : relatedProducts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-12 border border-dashed border-white/5 rounded-3xl">
                <Zap className="w-8 h-8 text-white/10 mb-4" />
                <p className="text-white/20 font-black uppercase tracking-[0.2em] italic text-[10px]">No related tactical gear detected.</p>
              </div>
            ) : (
              relatedProducts.map((rec) => (
                <ProductCard 
                  key={rec.id} 
                  product={rec} 
                  onAddToCart={onAddToCart} 
                  onClick={onProductClick}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
