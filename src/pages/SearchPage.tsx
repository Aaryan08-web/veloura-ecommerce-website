import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/product/ProductGrid';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  const { products, setSearchQuery, totalCount } = useProducts();

  useEffect(() => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ q: query });
    } else {
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
  }, [query, setSearchQuery]);

  const quickKeywords = [
    'Cashmere',
    'Trench',
    'Silk Dress',
    'Tailored Blazer',
    'Wide-Leg Trousers',
    'Camel Melange',
    'Noir',
    'Double-Faced Wool',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Search Input Box */}
      <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
            Atelier Search
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950 dark:text-white font-light">
            Search The Veloura Archive
          </h1>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-400" />
          <input
            id="catalogue-search"
            aria-label="Search the Veloura archive"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by silhouette, fiber, hue, or tailoring cut..."
            className="w-full pl-12 pr-10 py-4 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 text-sm sm:text-base rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white shadow-sm dark:shadow-xl transition-colors"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Suggested:
          </span>
          {quickKeywords.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => setQuery(kw)}
              className={`text-[11px] py-1 px-3 rounded-full border transition-colors cursor-pointer ${
                query.toLowerCase() === kw.toLowerCase()
                  ? 'bg-stone-950 text-white border-stone-950 dark:bg-white dark:text-black dark:border-white font-semibold'
                  : 'bg-stone-100 border-stone-200 text-stone-600 hover:text-stone-950 hover:border-stone-400 dark:bg-zinc-900 dark:border-white/10 dark:text-stone-400 dark:hover:text-white dark:hover:border-white/30'
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Results stats */}
      <div className="flex items-baseline justify-between pb-4 border-b border-stone-200 dark:border-white/10 mb-8">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300">
          {query ? `Search Results for "${query}"` : 'All Archive Garments'}
        </h2>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          {totalCount} {totalCount === 1 ? 'Garment' : 'Garments'} Found
        </span>
      </div>

      {/* Results grid */}
      <ProductGrid
        products={products}
        emptyTitle={`No pieces match "${query}"`}
        emptyDescription="Try searching for broader terms such as 'Wool', 'Silk', 'Men', or 'Coats'."
      />
    </div>
  );
};
