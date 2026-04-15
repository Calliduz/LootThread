import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowRight, Sparkles, PackageSearch, RefreshCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductSkeleton from './components/ProductSkeleton';
import Quiz from './components/Quiz';
import Carousel from './components/Carousel';
import CartDrawer from './components/storefront/CartDrawer';
import ArtistsList from './components/ArtistsList';
import Marquee from './components/storefront/Marquee';
import Footer from './components/storefront/Footer';
import Newsletter from './components/storefront/Newsletter';
import ProductDetail from './components/ProductDetail';

import { Product } from './types/api';
import LoginModal from './components/LoginModal';
import { useProducts } from './hooks/useApi';
import { useCart } from './contexts/CartContext';

export default function Storefront() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'marketplace' | 'artists' | 'product-detail'>('marketplace');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data: fetchedProducts, isLoading, isError } = useProducts();
  const [filter, setFilter] = useState<'all' | 'skin' | 'attachment'>('all');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const { addToCart, cartCount, isCartOpen, setIsCartOpen } = useCart();
  const products = fetchedProducts || [];

  // Sync state with URL params
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'skin' || type === 'attachment') {
      setFilter(type);
      // Only reset view to marketplace if we aren't already looking at a product detail
      if (view !== 'product-detail') {
        setView('marketplace');
        setSelectedProduct(null);
      }
    } else if (!type && view === 'marketplace') {
      setFilter('all');
    }
  }, [searchParams]); // Removed 'view' from dependency to avoid loop and destructive resets

  const addToCartHandler = (product: Product) => {
    addToCart({
      productId: product.id || (product as any)._id,
      name: product.name || product.title || 'Unknown',
      price: product.price,
      imageUrl: product.imageUrl || product.images?.[0],
    });
  };

  const handleNavigate = (newView: string) => {
    if (newView === 'skins') {
      setView('marketplace');
      setFilter('skin');
      setSelectedProduct(null);
    } else if (newView === 'attachments') {
      setView('marketplace');
      setFilter('attachment');
      setSelectedProduct(null);
    } else if (newView === 'marketplace') {
      setView('marketplace');
      setFilter('all');
      setSelectedProduct(null);
    } else {
      setView(newView as any);
      if (newView !== 'product-detail') setSelectedProduct(null);
    }
    setIsCartOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => {
        const typeMatch = p.type === filter || p.category === filter;
        const tagMatch = p.tags?.some(tag => 
          tag.toLowerCase().includes(filter) || 
          (filter === 'skin' && tag.toLowerCase().includes('skins')) ||
          (filter === 'attachment' && tag.toLowerCase().includes('attachments'))
        );
        return typeMatch || tagMatch;
      });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)} 
        onNavigate={(v) => v === 'dashboard' ? (localStorage.getItem('token') ? handleNavigate('dashboard') : setIsLoginOpen(true)) : handleNavigate(v)}
      />

      <Marquee />

      {isError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-bg-dark">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
            <Zap className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4 text-white">System Offline</h2>
          <p className="text-xl text-white/40 max-w-md mb-12">
            The LootThread core is currently undergoing maintenance or is unreachable. Tactical systems are offline.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-black px-10 py-5 rounded-2xl font-bold uppercase tracking-tighter hover:scale-105 transition-transform"
          >
            Re-Establish Connection
          </button>
        </div>
      ) : (
        <main className="flex-1">
          {view === 'marketplace' ? (
            <>
              {/* Hero Section */}
              <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden px-4 md:px-8 lg:px-12">
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/80 to-transparent z-10" />
                  <img src="https://picsum.photos/seed/gaming-hero/1920/1080?blur=4" alt="" className="w-full h-full object-cover opacity-30" referrerPolicy="no-referrer" />
                </div>
                <div className="relative z-20 max-w-4xl">
                  <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-brand-primary/20">
                        Season 01: The Glitch Era
                      </span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] mb-8">
                      Equip Your <br /> <span className="text-brand-primary">Digital Soul.</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-xl mb-10 leading-relaxed">
                      The first marketplace where high-performance hardware meets custom artist-designed skins.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button onClick={() => setIsQuizOpen(true)} className="bg-brand-primary text-black px-8 py-4 rounded-2xl font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform">
                        Find Your Loadout <Sparkles className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleNavigate('skins')} className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-black uppercase flex items-center gap-2 hover:bg-white/10">
                        Explore Skins <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Carousel */}
              <section className="px-6 lg:px-12 py-12 max-w-7xl mx-auto w-full">
                <Carousel products={products.slice(0, 3)} onProductClick={openProductDetail} />
              </section>

              {/* Marketplace */}
              <section className="px-6 lg:px-12 py-24 bg-bg-dark relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                  <div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">
                      The <span className="text-brand-primary">Marketplace</span>
                    </h2>
                    <div className="flex items-center gap-4">
                      {['all', 'skin', 'attachment'].map(t => (
                        <button key={t} onClick={() => setFilter(t as any)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${filter === t ? 'bg-brand-primary text-black' : 'bg-white/5 text-white/40'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
                    ) : filteredProducts.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] overflow-hidden relative group"
                      >
                        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                          <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-8 border border-brand-primary/20 shadow-[0_0_30px_rgba(0,255,204,0.1)] group-hover:shadow-[0_0_50px_rgba(0,255,204,0.3)] transition-all">
                            <PackageSearch className="w-10 h-10 text-brand-primary" />
                          </div>
                          <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">
                            {filter === 'skin' ? 'No Custom Skins Found' : filter === 'attachment' ? 'No Tactical Attachments Found' : 'No Loot Detected'}
                          </h3>
                          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mb-8">
                            {filter === 'all' ? 'The scan returned no results.' : `Our scanners couldn't find any items matching the "${filter}" criteria.`}
                          </p>
                          <button 
                            onClick={() => setSearchParams({})}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 mx-auto"
                          >
                            <RefreshCcw className="w-3.5 h-3.5" /> Reset Void Scan
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      filteredProducts.map(p => (
                        <ProductCard 
                          key={p.id || (p as any)._id} 
                          product={p} 
                          onAddToCart={addToCartHandler} 
                          onClick={openProductDetail} 
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Artist CTA */}
              <section className="px-6 lg:px-12 py-24">
                <div className="bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-[3rem] p-12 lg:p-24 border border-white/10">
                  <h2 className="text-5xl md:text-7xl font-black uppercase italic mb-8 leading-none">Design the Next Skin.</h2>
                  <button onClick={() => handleNavigate('dashboard')} className="bg-white text-black px-10 py-5 rounded-2xl font-bold uppercase">Become a Loot Artist</button>
                </div>
              </section>
            </>
          ) : view === 'artists' ? (
            <ArtistsList />
          ) : selectedProduct ? (
            <ProductDetail 
              product={selectedProduct} 
              allProducts={products} 
              onBack={() => handleNavigate('marketplace')} 
              onAddToCart={addToCartHandler}
              onProductClick={openProductDetail}
            />
          ) : (
            <div className="flex items-center justify-center h-[60vh]">
              <p className="text-white/40 uppercase font-black">Product Not Found</p>
            </div>
          )}
        </main>
      )}

      <Newsletter />
      <Footer />

      <Quiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={() => handleNavigate('dashboard')} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
