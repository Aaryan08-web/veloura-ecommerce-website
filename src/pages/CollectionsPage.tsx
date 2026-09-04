import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export const CollectionsPage: React.FC = () => {
  const { gender } = useParams<{ gender?: string }>();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedGender, setSelectedGender] = useState<'all' | 'men' | 'women'>(
    gender === 'men' || gender === 'women' ? gender : 'all'
  );

  useEffect(() => {
    if (gender === 'men' || gender === 'women') {
      setSelectedGender(gender);
    } else {
      setSelectedGender('all');
    }
  }, [gender]);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getProducts()
      .then((data) => {
        if (isMounted) {
          setAllProducts(data || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load collections products:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const collections = [
    {
      id: 'monolith',
      title: 'The Monolith Outerwear',
      tagline: 'Architectural Silhouettes & Heavyweight Outerwear',
      description:
        'Sculptural jackets and outerwear engineered with dropped shoulder geometry and clean lines for effortless proportion.',
      image:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1600&q=80',
      products: allProducts.filter(
        (p) =>
          (p.category === 'Jackets' || p.category === 'Coats & Trench') &&
          (selectedGender === 'all' || p.gender === selectedGender || p.gender === 'unisex')
      ).slice(0, 4),
    },
    {
      id: 'cashmere',
      title: 'Cocoon & Heavyweight Knitwear',
      tagline: 'Relaxed Silhouette Hoodies & Soft Terry',
      description:
        'Knitted essentials crafted with relaxed ribbing and dense cotton-terry weaves for tactile comfort and thermal drape.',
      image:
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1600&q=80',
      products: allProducts.filter(
        (p) =>
          (p.category === 'Hoodies' || p.category === 'Knitwear & Cashmere') &&
          (selectedGender === 'all' || p.gender === selectedGender || p.gender === 'unisex')
      ).slice(0, 4),
    },
    {
      id: 'tailoring',
      title: 'Architectural Tailoring & Trousers',
      tagline: 'Fluid Shirting & Pleated Trousers',
      description:
        'Contemporary tailoring silhouettes that discard stiffness. Structured pleating and flowing shirting designed to breathe.',
      image:
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80',
      products: allProducts.filter(
        (p) =>
          (p.category === 'Trousers' || p.category === 'Shirts' || p.category === 'Tailored Trousers' || p.category === 'Blazers & Tailoring') &&
          (selectedGender === 'all' || p.gender === selectedGender || p.gender === 'unisex')
      ).slice(0, 4),
    },
    {
      id: 'evening',
      title: 'Eveningwear & Silhouette Dresses',
      tagline: 'Bias-Cut Gowns & Sculpted Tops',
      description:
        'Intimate silhouettes made for evening soirees and gallery openings. Draped to highlight personal aura and movement.',
      image:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
      products: allProducts.filter(
        (p) =>
          (p.category === 'Dresses' || p.category === 'Tops' || p.category === 'Dresses & Gowns' || p.category === 'Silk & Satin Tops') &&
          (selectedGender === 'all' || p.gender === selectedGender || p.gender === 'unisex')
      ).slice(0, 4),
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Header Banner */}
      <section className="bg-[#0A0A0A] border-b border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-stone-400 block">
            Curated Portals
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-light">
            {selectedGender === 'women'
              ? "Women's Atelier Collections"
              : selectedGender === 'men'
              ? "Men's Atelier Collections"
              : 'Seasonal Editorial Capsules'}
          </h1>
          <p className="text-sm text-stone-400 font-light max-w-xl mx-auto leading-relaxed">
            Thematic wardrobing constructed around distinct emotional frequencies and architectural forms.
          </p>

          {/* Gender navigation pills */}
          <div className="flex justify-center gap-2 pt-4">
            <Link
              to="/collections"
              className={`py-2 px-5 text-[10px] uppercase tracking-[0.2em] rounded-full transition-colors ${
                selectedGender === 'all'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-zinc-900 border border-white/10 text-stone-400 hover:text-white'
              }`}
            >
              All Capsules
            </Link>
            <Link
              to="/collections/women"
              className={`py-2 px-5 text-[10px] uppercase tracking-[0.2em] rounded-full transition-colors ${
                selectedGender === 'women'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-zinc-900 border border-white/10 text-stone-400 hover:text-white'
              }`}
            >
              Women's Atelier
            </Link>
            <Link
              to="/collections/men"
              className={`py-2 px-5 text-[10px] uppercase tracking-[0.2em] rounded-full transition-colors ${
                selectedGender === 'men'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-zinc-900 border border-white/10 text-stone-400 hover:text-white'
              }`}
            >
              Men's Atelier
            </Link>
          </div>
        </div>
      </section>

      {/* Render each collection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {collections.map((col, idx) => {
          if (col.products.length === 0) return null;

          return (
            <section key={col.id} id={col.id} className="space-y-8">
              {/* Collection Banner */}
              <div className="relative h-72 sm:h-96 rounded-xs overflow-hidden bg-black text-white flex items-end p-6 sm:p-12 border border-white/10 shadow-2xl">
                <img
                  src={col.image}
                  alt={col.title}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />

                <div className="relative z-10 max-w-2xl space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-semibold block">
                    Capsule 0{idx + 1}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-4xl font-light text-white">
                    {col.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                    {col.description}
                  </p>
                </div>
              </div>

              {/* Products in this capsule */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {col.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-right pt-2">
                <Link
                  to={`/shop?category=${encodeURIComponent(col.products[0]?.category || '')}`}
                  className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Explore full {col.title} archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
