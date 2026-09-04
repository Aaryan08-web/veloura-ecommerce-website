import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface SuggestionProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  images: string[];
  rating: number;
}

interface SearchAutocompleteProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_SEARCHES = [
  'Aura Heavyweight Tee',
  'Silk Slip Dress',
  'Cashmere Knit Sweater',
  'Chelsea Boots',
  'Tailored Trousers',
  'Oversized Linen Shirt',
];

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSuggestions([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search/suggest?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Search autocomplete fetch error:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectProduct(suggestions[selectedIndex].id);
      } else if (query.trim()) {
        handleSubmitSearch(query.trim());
      }
    }
  };

  const handleSelectProduct = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const handleSubmitSearch = (searchTerm: string) => {
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dropdownRef}
        className="w-full max-w-3xl mx-auto mt-4 sm:mt-12 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/15 shadow-2xl rounded-xs overflow-hidden">
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-4 border-b border-stone-200 dark:border-white/10 gap-3">
            <Search className="w-5 h-5 text-stone-400 dark:text-stone-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              placeholder="Search by product name, category, or aesthetic (e.g., Silk, Linen, Boots)..."
              className="flex-1 bg-transparent text-sm sm:text-base text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none tracking-wide"
            />
            {loading && <Loader2 className="w-4 h-4 text-stone-400 animate-spin shrink-0" />}
            {query && !loading && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 text-stone-500 hover:text-stone-950 dark:hover:text-white transition-colors ml-1 border-l border-stone-200 dark:border-white/10"
            >
              ESC
            </button>
          </div>

          {/* Body Section */}
          <div className="max-h-[65vh] overflow-y-auto divide-y divide-stone-100 dark:divide-white/5">
            {/* Live Autocomplete Results */}
            {query.trim().length > 0 ? (
              suggestions.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-400">
                    <span>Products ({suggestions.length})</span>
                    <span className="text-stone-500 font-normal">Use ↑↓ to navigate, Enter to select</span>
                  </div>
                  <div className="divide-y divide-stone-100 dark:divide-white/5">
                    {suggestions.map((item, idx) => {
                      const isSelected = selectedIndex === idx;
                      const isOutOfStock = item.stock === 0;
                      const isLowStock = item.stock > 0 && item.stock <= 5;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectProduct(item.id)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-stone-100 dark:bg-white/10'
                              : 'hover:bg-stone-50 dark:hover:bg-white/5'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="relative w-12 h-14 bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-white/10 rounded-xs overflow-hidden shrink-0">
                            <img
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[9px] uppercase tracking-[0.15em] font-medium text-stone-500 dark:text-stone-400">
                                {item.category} • {item.brand}
                              </span>
                              {isOutOfStock ? (
                                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-rose-950/80 text-rose-300 border border-rose-500/30 rounded-xs">
                                  Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-amber-950/80 text-amber-300 border border-amber-500/30 rounded-xs">
                                  Only {item.stock} left
                                </span>
                              ) : (
                                <span className="text-[8px] font-medium uppercase tracking-wider px-1.5 py-0.2 bg-emerald-950/60 text-emerald-300 border border-emerald-500/20 rounded-xs">
                                  In Stock
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                              {item.name}
                            </h4>
                          </div>

                          {/* Price */}
                          <div className="text-right shrink-0">
                            <span className="text-sm font-semibold text-stone-900 dark:text-white">
                              {formatCurrency(item.price)}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <div className="text-[10px] text-stone-400 line-through">
                                {formatCurrency(item.originalPrice)}
                              </div>
                            )}
                          </div>

                          <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>

                  {/* View all results button */}
                  <div className="p-3 bg-stone-50 dark:bg-zinc-900/50 border-t border-stone-200 dark:border-white/10 text-center">
                    <button
                      type="button"
                      onClick={() => handleSubmitSearch(query.trim())}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-white hover:underline cursor-pointer"
                    >
                      View all matching catalogue results for &ldquo;{query}&rdquo;
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : !loading ? (
                <div className="py-12 px-4 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    No products found matching &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Try checking for spelling errors or searching by broader keywords like &ldquo;jacket&rdquo; or &ldquo;t-shirt&rdquo;.
                  </p>
                </div>
              ) : null
            ) : (
              /* Default State: Trending & Quick Recommendations */
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-400 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <span>Trending Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                        }}
                        className="px-3 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 rounded-full transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Curated for seamless shopping & rapid catalogue lookup
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/shop');
                      onClose();
                    }}
                    className="underline hover:text-stone-900 dark:hover:text-white"
                  >
                    Browse full shop
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
