import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowRight, Filter, LayoutGrid, List, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductSkeleton from './components/ProductSkeleton';
import Quiz from './components/Quiz';
import Carousel from './components/Carousel';
import CartDrawer from './components/CartDrawer';
import ArtistsList from './components/ArtistsList';
import Marquee from './components/Marquee';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';
import { Product } from './types';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

import ArtistDashboard from './components/ArtistDashboard';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cyber Samurai Jersey',
    description: 'Limited edition artist series. Breathable performance fabric with neon-infused graphics.',
    price: 59.99,
    category: 'skin',
    subCategory: 'Jersey',
    images: ['https://picsum.photos/seed/skin1/600/600'],
    inventory: 50,
    tags: ['cyberpunk', 'artist-series'],
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Apex Pro TKL',
    description: 'OmniPoint 2.0 adjustable hypermagnetic switches. The world\'s fastest keyboard.',
    price: 189.99,
    category: 'attachment',
    subCategory: 'Keyboard',
    images: ['https://picsum.photos/seed/att1/600/600'],
    inventory: 20,
    tags: ['pro-gear', 'steelseries'],
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Glitch Mode Hoodie',
    description: 'Heavyweight cotton with reflective "Glitch" embroidery. Designed by @LootArtist.',
    price: 74.99,
    category: 'skin',
    subCategory: 'Hoodie',
    images: ['https://picsum.photos/seed/skin2/600/600'],
    inventory: 30,
    tags: ['streetwear', 'artist-series'],
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'Logitech G Pro X Superlight 2',
    description: 'The new icon of pro gaming. 60g ultralight design with LIGHTFORCE hybrid switches.',
    price: 159.99,
    category: 'attachment',
    subCategory: 'Mouse',
    images: ['https://picsum.photos/seed/att2/600/600'],
    inventory: 15,
    tags: ['pro-gear', 'logitech'],
    createdAt: new Date()
  }
];

export default function App() {
  const [user] = useAuthState(auth);
  const [view, setView] = useState<'marketplace' | 'dashboard' | 'artists' | 'product-detail' | 'checkout'>('marketplace');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'skin' | 'attachment'>('all');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<(Product & { quantity: number })[]>([]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
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

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(fetchedProducts);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.category === filter);

  const handleCheckoutComplete = (orderData: any) => {
    console.log('Order completed:', orderData);
    setCart([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        onNavigate={handleNavigate}
      />

      <Marquee 
        text="MARKETPLACE • NEW DROPS • SEASON 01 • LIMITED EDITION •" 
        className="sticky top-[73px] z-40 cursor-pointer hover:bg-white/10 transition-colors"
      />

      <main className="flex-1">
        {view === 'marketplace' ? (
          <>
            {/* Hero Section */}
            <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden px-4 md:px-8 lg:px-12">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/80 to-transparent z-10" />
                <img 
                  src="https://picsum.photos/seed/gaming-hero/1920/1080?blur=4" 
                  alt="Hero Background" 
                  className="w-full h-full object-cover opacity-30"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="relative z-20 max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <span className="bg-brand-primary/10 text-brand-primary text-[8px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-brand-primary/20">
                      Season 01: The Glitch Era
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] mb-6 md:mb-8">
                    Equip Your <br />
                    <span className="text-brand-primary">Digital Soul.</span>
                  </h1>
                  <p className="text-sm md:text-xl text-white/60 max-w-xl mb-8 md:mb-10 leading-relaxed">
                    The first marketplace where high-performance hardware meets custom artist-designed skins. Upgrade your setup, wear your stats.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    <button 
                      onClick={() => setIsQuizOpen(true)}
                      className="bg-brand-primary text-black px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-base font-black uppercase tracking-tighter flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-brand-primary/20"
                    >
                      Find Your Loadout <Sparkles className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleNavigate('skins')}
                      className="bg-white/5 border border-white/10 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-base font-black uppercase tracking-tighter flex items-center gap-2 hover:bg-white/10 transition-colors"
                    >
                      Explore Skins <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Floating Stats */}
              <div className="absolute right-12 bottom-12 hidden lg:flex flex-col gap-6">
                {[
                  { label: 'Active Artists', value: '1,240+' },
                  { label: 'Drops Today', value: '12' },
                  { label: 'Community Members', value: '450K' }
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="glass p-4 rounded-2xl border-white/5 min-w-[180px]"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">{stat.label}</p>
                    <p className="text-2xl font-mono font-bold text-brand-primary">{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Carousel Section */}
            <section className="px-6 lg:px-12 py-12 max-w-7xl mx-auto w-full">
              <Carousel 
                products={products.slice(0, 3)} 
                onProductClick={openProductDetail}
              />
            </section>

        {/* Marketplace Section */}
        <section className="px-6 lg:px-12 py-24 bg-bg-dark relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">
                The <span className="text-brand-primary">Marketplace</span>
              </h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-brand-primary text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                >
                  All Loot
                </button>
                <button 
                  onClick={() => setFilter('skin')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === 'skin' ? 'bg-brand-accent text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                >
                  Skins
                </button>
                <button 
                  onClick={() => setFilter('attachment')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === 'attachment' ? 'bg-brand-primary text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                >
                  Attachments
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                <Filter className="w-5 h-5" />
              </button>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button className="p-2 bg-white/10 rounded-lg"><LayoutGrid className="w-4 h-4" /></button>
                <button className="p-2 text-white/40"><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.4,
                      delay: i * 0.05,
                      ease: [0.23, 1, 0.32, 1]
                    }}
                  >
                    <ProductSkeleton />
                  </motion.div>
                ))
              ) : (
                filteredProducts.map((product, i) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={addToCart}
                    onClick={openProductDetail}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Artist CTA */}
        <section className="px-6 lg:px-12 py-24">
          <div className="bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-[3rem] p-12 lg:p-24 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 blur-[120px] rounded-full -mr-48 -mt-48" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 leading-none">
                Design the <br />Next <span className="text-brand-accent">Legendary</span> Skin.
              </h2>
              <p className="text-xl text-white/60 mb-10">
                Join our community of independent artists. Upload your designs, set your price, and get paid for every sale. We handle the printing and shipping.
              </p>
              <button 
                onClick={() => handleNavigate('dashboard')}
                className="bg-white text-black px-10 py-5 rounded-2xl font-bold uppercase tracking-tighter hover:scale-105 transition-transform active:scale-95"
              >
                Become a Loot Artist
              </button>
            </div>
          </div>
        </section>
          </>
        ) : view === 'dashboard' ? (
          <ArtistDashboard />
        ) : view === 'artists' ? (
          <ArtistsList />
        ) : view === 'checkout' ? (
          <Checkout 
            items={cart}
            onComplete={handleCheckoutComplete}
            onCancel={() => handleNavigate('marketplace')}
          />
        ) : selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            allProducts={products}
            onBack={() => handleNavigate('marketplace')}
            onAddToCart={addToCart}
          />
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-white/40 uppercase font-black tracking-widest">Product Not Found</p>
          </div>
        )}
      </main>

      <footer className="px-6 lg:px-12 py-12 border-t border-white/5 bg-bg-card">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-primary fill-current" />
            <span className="text-xl font-bold tracking-tighter uppercase italic">
              Loot<span className="text-brand-primary">Thread</span>
            </span>
          </div>
          
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>

          <p className="text-[10px] font-mono text-white/20">
            © 2026 LOOT THREAD. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      <Quiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={() => handleNavigate('checkout')}
      />
    </div>
  );
}
