import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'women' | 'men'>('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getProducts()
      .then((data) => {
        if (isMounted) {
          setAllProducts(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load homepage products:', err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredList = allProducts.filter((p) => p.isFeatured);
  const candidateFeatured = featuredList.length > 0 ? featuredList : allProducts;

  const featuredProducts = candidateFeatured
    .filter((p) => {
      if (activeTab === 'all') return true;
      return p.gender === activeTab || p.gender === 'unisex';
    })
    .slice(0, 8);

  const newArrivalsList = allProducts.filter((p) => p.isNew);
  const newDrops = (newArrivalsList.length > 0 ? newArrivalsList : allProducts).slice(0, 4);

  const categories = [
    {
      title: "Women's Atelier",
      subtitle: "Sculptural Dresses & Knitwear",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      href: "/collections/women",
    },
    {
      title: "Men's Atelier",
      subtitle: "Architectural Outerwear & Tailoring",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      href: "/collections/men",
    },
    {
      title: "The Coat & Trench",
      subtitle: "Double-Faced Wool & Weatherproof Gabardine",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
      href: "/shop?category=Jackets",
    },
    {
      title: "Cashmere & Silk",
      subtitle: "Weightless Warmth & Organic Drape",
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
      href: "/shop?category=Hoodies",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Editorial Hero Banner */}
      <section className="relative w-full h-[80vh] min-h-[560px] max-h-[750px] overflow-hidden bg-black text-white">
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=85"
          alt="VELOURA Fall Winter Runway"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60 scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              Autumn / Winter 2026 Collection
            </span>

            <h1 className="font-serif text-5xl sm:text-7xl text-white font-light leading-tight tracking-[0.08em] uppercase">
              VELOURA
            </h1>

            <h2 className="font-serif text-xl sm:text-2xl italic text-stone-200 font-light tracking-[0.2em] uppercase">
              Wear Your Aura
            </h2>

            <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed max-w-lg pb-2">
              Discover the new capsule characterized by dropped shoulders, cocoon collars, and ethically sourced Italian double-faced wool.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/shop"
                className="py-3.5 px-8 bg-white text-black hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 transition-colors rounded-xs shadow-2xl"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/collections"
                className="py-3.5 px-8 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-xs border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 transition-colors rounded-xs shadow-lg"
              >
                <span>Explore Lookbook</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pillars Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-stone-500 dark:text-stone-400 opacity-80 block mb-1">
              Atelier Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-950 dark:text-white font-light">
              Essential Silhouettes
            </h2>
          </div>
          <Link
            to="/collections"
            className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <span>All Portals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to={cat.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-xs bg-zinc-900 border border-stone-200 dark:border-white/10 shadow-sm dark:shadow-none"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-1">
                <span className="text-[9px] uppercase tracking-[0.25em] text-stone-300 block font-light">
                  {cat.subtitle}
                </span>
                <h3 className="font-serif text-xl font-light tracking-wide text-white">
                  {cat.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-semibold text-white/90 pt-1 group-hover:translate-x-1 transition-transform">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Collection with Gender Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-stone-200 dark:border-white/10 mb-8 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-stone-500 dark:text-stone-400 opacity-80 block mb-1">
              Handpicked by Creative Direction
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-950 dark:text-white font-light">
              Featured Curations
            </h2>
          </div>

          {/* Gender filter tabs */}
          <div className="flex items-center gap-2">
            {(['all', 'women', 'men'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 text-[10px] uppercase tracking-[0.2em] font-bold rounded-full transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-stone-950 text-white dark:bg-white dark:text-black shadow-md'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white border border-stone-300 dark:border-white/10 hover:border-stone-500 dark:hover:border-white/30'
                }`}
              >
                {tab === 'all' ? 'All Pieces' : `${tab}'s`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center py-3.5 px-8 border border-stone-300 dark:border-white/30 text-stone-900 dark:text-white hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] uppercase tracking-[0.2em] font-bold transition-colors shadow-sm"
          >
            Explore Complete Wardrobe (30+ Pieces) →
          </Link>
        </div>
      </section>

      {/* Editorial Campaign Banner: "The Aura of Restraint" */}
      <section className="bg-stone-100 dark:bg-[#0e0e0e] border-y border-stone-200 dark:border-white/10 py-16 sm:py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-stone-500 dark:text-stone-400 opacity-80">
                Atelier Craftsmanship
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-stone-950 dark:text-white font-light leading-tight">
                Designed to Outlive Trends. Tailored to Anoint.
              </h2>
              <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed font-light">
                We believe true luxury announces itself without shouting. Each garment in the VELOURA archive is manufactured in strictly monitored artisan workshops across Florence, Biella, and Okayama.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-200 dark:border-white/10">
                <div>
                  <h4 className="font-serif text-2xl font-light text-stone-950 dark:text-white">100%</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-light">Traceable natural fibers from certified regenerative mills</p>
                </div>
                <div>
                  <h4 className="font-serif text-2xl font-light text-stone-950 dark:text-white">Zero</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-light">Deadstock landfill footprint through limited batch allocations</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/collections"
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-900 dark:text-white border-b border-stone-900 dark:border-white pb-1 hover:opacity-80 transition-opacity"
                >
                  <span>Learn About Our Mills</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/5] rounded-xs overflow-hidden shadow-2xl bg-zinc-900 border border-stone-200 dark:border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80"
                  alt="Tailoring craftsmanship"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Drop */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-stone-500 dark:text-stone-400 opacity-80 block mb-1">
              Fresh Off The Loom
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-950 dark:text-white font-light">
              New Arrivals Drop
            </h2>
          </div>
          <Link
            to="/new-arrivals"
            className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <span>View All New Drops</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newDrops.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Customer Reflections / Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-stone-500 dark:text-stone-400 opacity-80 block mb-2">
            Client Reflections
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-950 dark:text-white font-light">
            Voices of the Veloura Circle
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center text-amber-500 dark:text-amber-300 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-300 text-amber-500 dark:text-amber-300" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 italic leading-relaxed font-light">
              “The Double-Faced Cashmere Overcoat is sheer poetry. The drape, the inner seam hand-stitching, the density—it completely transformed how I hold myself.”
            </p>
            <div className="pt-2 border-t border-stone-200 dark:border-white/10 text-xs">
              <p className="font-medium text-stone-950 dark:text-white">Julian S.</p>
              <p className="text-stone-500 text-[11px]">Architect, London</p>
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center text-amber-500 dark:text-amber-300 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-300 text-amber-500 dark:text-amber-300" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 italic leading-relaxed font-light">
              “I bought the Silk Charmeuse Bias Maxi Dress for a gala in Milan. I have never received so many quiet compliments on the fabric's movement.”
            </p>
            <div className="pt-2 border-t border-stone-200 dark:border-white/10 text-xs">
              <p className="font-medium text-stone-950 dark:text-white">Camilla V.</p>
              <p className="text-stone-500 text-[11px]">Gallery Director, Milan</p>
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center text-amber-500 dark:text-amber-300 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-300 text-amber-500 dark:text-amber-300" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 italic leading-relaxed font-light">
              “VELOURA feels like the old European tailoring houses revived for modern minds. No loud logos, just pure textural superiority.”
            </p>
            <div className="pt-2 border-t border-stone-200 dark:border-white/10 text-xs">
              <p className="font-medium text-stone-950 dark:text-white">Alexander K.</p>
              <p className="text-stone-500 text-[11px]">Creative Strategist, New York</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
