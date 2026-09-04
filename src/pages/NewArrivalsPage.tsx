import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { Product, SortOption } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { SortSelector } from '../components/catalog/SortSelector';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const NewArrivalsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState<'all' | 'women' | 'men'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load new arrivals:', err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const rawNewProducts = products.filter((p) => {
    // If flagged isNew or if there are few items, include
    const isNewItem = p.isNew || products.length <= 8;
    if (!isNewItem) return false;
    if (selectedGender === 'all') return true;
    return p.gender === selectedGender || p.gender === 'unisex';
  });

  const sortedProducts = [...rawNewProducts].sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    if (sortOption === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
    if (sortOption === 'popular') return (b.reviewCount || 0) - (a.reviewCount || 0);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 text-stone-700 dark:bg-zinc-900 dark:border-white/10 dark:text-stone-300 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
          <span>Autumn / Winter 2026 Drop</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-stone-950 dark:text-white font-light">
          New Arrivals Drop
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed">
          The latest numbered cuts freshly completed by our Florence and Milan tailoring studios.
        </p>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-white/10 mb-8">
        <div className="flex items-center gap-2">
          {(['all', 'women', 'men'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGender(g)}
              className={`py-1.5 px-4 text-[10px] uppercase tracking-[0.15em] rounded-full transition-colors cursor-pointer ${
                selectedGender === g
                  ? 'bg-stone-950 text-white dark:bg-white dark:text-black font-bold shadow-md'
                  : 'bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-950 dark:bg-zinc-900 dark:border-white/10 dark:text-stone-400 dark:hover:text-white'
              }`}
            >
              {g === 'all' ? 'All New Drops' : `${g}'s`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <SortSelector value={sortOption} onChange={setSortOption} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 text-stone-500 dark:text-stone-400">
          <p className="text-sm">No products found matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
