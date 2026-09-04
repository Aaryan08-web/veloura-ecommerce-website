import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';

export const LandingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load landing products:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const featured = products.filter((p) => p.isFeatured);
  const editorialPieces = (featured.length > 0 ? featured : products).slice(0, 4);

  return (
    <div className="w-full bg-[#0A0A0A] text-[#F5F5F5]">
      {/* Immersive Editorial Hero */}
      <section className="relative min-h-[70vh] sm:min-h-[78vh] flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-10 sm:py-14 overflow-hidden">
        {/* Background Editorial Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="VELOURA Haute Couture"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]/80" />
        </div>

        {/* Center Title & Essence */}
        <div className="relative z-10 max-w-4xl py-4 sm:py-6">
          <h1 className="font-serif text-6xl sm:text-8xl lg:text-9xl tracking-[0.08em] font-light leading-[1] uppercase text-white mb-3">
            VELOURA
          </h1>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl italic text-stone-200 tracking-[0.15em] font-light uppercase mb-4">
            Wear Your Aura
          </h2>

          <p className="text-stone-300 text-sm sm:text-base lg:text-lg font-light leading-relaxed max-w-xl mb-6">
            An exploration of architectural silhouettes, uncompromised cashmere, and raw Italian silk. Garments crafted to transcend seasonality and embody quiet sovereignty.
          </p>

          <div>
            <Link
              to="/home"
              className="inline-flex items-center gap-3 py-3.5 px-7 bg-white text-black hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold transition-colors shadow-2xl rounded-xs"
            >
              <span>Enter Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Philosophy Section */}
      <section className="py-24 px-6 sm:px-12 lg:px-16 border-y border-white/10 bg-[#0c0c0c]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-400 block mb-3">
                The Veloura Manifesto
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight mb-6">
                Clothing is the tangible frequency of your presence.
              </h2>
              <p className="text-stone-300 text-sm leading-relaxed font-light mb-6">
                VELOURA was founded upon a singular imperative: rejecting disposable fashion in favor of heirloom construction. Every lapel angle, seam allowance, and raw edge is calibrated to bestow poise.
              </p>
              <Link
                to="/home"
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white border-b border-white pb-1 hover:opacity-80 transition-opacity"
              >
                <span>Enter The Atelier Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-zinc-900 border border-white/10 rounded-xs shadow-md">
                <Compass className="w-6 h-6 text-amber-400 mb-4" />
                <h3 className="font-serif text-lg text-white font-medium mb-2">Architectural Cuts</h3>
                <p className="text-xs text-stone-400 font-light leading-relaxed">
                  Sculptural tailoring that balances structured shoulder lines with fluid drapery.
                </p>
              </div>

              <div className="p-6 bg-zinc-900 border border-white/10 rounded-xs shadow-md">
                <ShieldCheck className="w-6 h-6 text-amber-400 mb-4" />
                <h3 className="font-serif text-lg text-white font-medium mb-2">Heirloom Quality</h3>
                <p className="text-xs text-stone-400 font-light leading-relaxed">
                  Hand-spun Mongolian cashmere and organic silks designed to age with sublime dignity.
                </p>
              </div>

              <div className="p-6 bg-zinc-900 border border-white/10 rounded-xs shadow-md">
                <Sparkles className="w-6 h-6 text-amber-400 mb-4" />
                <h3 className="font-serif text-lg text-white font-medium mb-2">Limited Editions</h3>
                <p className="text-xs text-stone-400 font-light leading-relaxed">
                  Numbered batch runs preventing overproduction and preserving distinct exclusivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pieces Preview */}
      <section className="py-24 px-6 sm:px-12 lg:px-16 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-400 block mb-2">
                Curated Selection
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white font-light">
                The Inaugural Capsule
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-300 hover:text-white inline-flex items-center gap-2 border-b border-white/20 pb-1 transition-colors"
            >
              <span>View All 30+ Pieces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {editorialPieces.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Critical Acclaim / Press */}
      <section className="py-20 px-6 sm:px-12 border-t border-white/10 bg-[#0A0A0A] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-medium">
            Editorial Perspectives
          </span>
          <blockquote className="font-serif text-2xl sm:text-3xl font-light text-stone-200 italic leading-relaxed">
            “VELOURA reclaims the visceral dignity of getting dressed. A triumph of restraint, silhouette, and tactile luxury.”
          </blockquote>
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-semibold">
            — The Fashion Gazette 2026
          </p>
        </div>
      </section>
    </div>
  );
};
