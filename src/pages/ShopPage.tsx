import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { SortSelector } from '../components/catalog/SortSelector';
import { CategoryPills } from '../components/catalog/CategoryPills';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductCategory, GenderFilter } from '../types';

const normalizeCategoryParam = (param: string | null): ProductCategory | null => {
  if (!param) return null;
  const lower = param.trim().toLowerCase();
  if (lower === 'jackets' || lower === 'the coat & trench' || lower === 'coat & trench' || lower === 'coats & trench' || lower === 'coats') {
    return 'Jackets';
  }
  if (lower === 'hoodies' || lower === 'cashmere & silk' || lower === 'knitwear & cashmere' || lower === 'knitwear') {
    return 'Hoodies';
  }
  if (lower === 't-shirts' || lower === 'tshirts' || lower === 'tees') {
    return 'T-Shirts';
  }
  if (lower === 'shirts' || lower === 'shirting') {
    return 'Shirts';
  }
  if (lower === 'jeans' || lower === 'denim') {
    return 'Jeans';
  }
  if (lower === 'trousers' || lower === 'pants') {
    return 'Trousers';
  }
  if (lower === 'tops') {
    return 'Tops';
  }
  if (lower === 'dresses' || lower === 'gowns') {
    return 'Dresses';
  }
  return param as ProductCategory;
};

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    products,
    totalCount,
    loading,
    filters,
    sortOption,
    updateFilter,
    resetFilters,
    setSortOption,
  } = useProducts();

  // Sync initial query params from URL if present
  useEffect(() => {
    const rawCategory = searchParams.get('category');
    const categoryParam = normalizeCategoryParam(rawCategory);
    const genderParam = searchParams.get('gender') as GenderFilter | null;
    const sortParam = searchParams.get('sort');

    if (categoryParam && !(filters.categories || []).includes(categoryParam)) {
      updateFilter('categories', [categoryParam]);
    }
    if (genderParam && (genderParam === 'men' || genderParam === 'women' || genderParam === 'all')) {
      updateFilter('gender', genderParam);
    }
    if (sortParam) {
      setSortOption(sortParam as any);
    }
  }, [searchParams]);

  const handleCategoryPillSelect = (cat: ProductCategory | 'all') => {
    if (cat === 'all') {
      updateFilter('categories', []);
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      updateFilter('categories', [cat]);
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), category: cat });
    }
  };

  const removeFilterTag = (type: 'category' | 'size' | 'color' | 'gender' | 'new', value?: string) => {
    if (type === 'category' && value) {
      updateFilter(
        'categories',
        filters.categories.filter((c) => c !== value)
      );
    } else if (type === 'size' && value) {
      updateFilter(
        'sizes',
        filters.sizes.filter((s) => s !== value)
      );
    } else if (type === 'color' && value) {
      updateFilter(
        'colors',
        filters.colors.filter((c) => c !== value)
      );
    } else if (type === 'gender') {
      updateFilter('gender', 'all');
    } else if (type === 'new') {
      updateFilter('isNewOnly', false);
    }
  };

  const activeFilterCount =
    (filters.gender !== 'all' ? 1 : 0) +
    (filters.categories?.length || 0) +
    (filters.sizes?.length || 0) +
    (filters.colors?.length || 0) +
    (filters.isNewOnly ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.25em] font-medium text-stone-500 dark:text-stone-400 block mb-1.5">
          Atelier Catalog
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-stone-950 dark:text-white font-normal mb-3">
          The Complete Wardrobe
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed">
          Explore architectural coats, Italian tailoring, double-faced cashmere, and bias-cut silk essentials.
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="mb-6 border-y border-stone-200 dark:border-stone-800 py-2">
        <CategoryPills
          selectedCategories={filters.categories}
          onSelectCategory={handleCategoryPillSelect}
        />
      </div>

      {/* Control Bar: Filter Trigger (Mobile) + Sort Selector (All) + Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 py-2 px-3.5 border border-stone-300 dark:border-stone-700 rounded-xs text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-xs text-stone-500 dark:text-stone-400 font-light">
            Showing <strong className="text-stone-900 dark:text-white font-semibold">{totalCount}</strong> pieces
          </span>
        </div>

        <div className="flex items-center gap-4">
          <SortSelector value={sortOption} onChange={setSortOption} />
        </div>
      </div>

      {/* Active Filter Chips / Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 p-3 bg-stone-100/70 dark:bg-stone-900/60 rounded-xs text-xs">
          <span className="text-stone-500 dark:text-stone-400 text-[11px] uppercase tracking-wider font-semibold mr-1">
            Active:
          </span>

          {filters.gender !== 'all' && (
            <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-full text-stone-800 dark:text-stone-200 uppercase tracking-wider text-[10px]">
              {filters.gender}
              <button type="button" onClick={() => removeFilterTag('gender')} className="hover:text-red-500" aria-label="Remove gender filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 py-1 px-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-full text-stone-800 dark:text-stone-200 text-[11px]"
            >
              {cat}
              <button type="button" onClick={() => removeFilterTag('category', cat)} className="hover:text-red-500" aria-label={`Remove ${cat} category filter`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.sizes.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 py-1 px-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-full text-stone-800 dark:text-stone-200 uppercase text-[10px]"
            >
              Size: {s}
              <button type="button" onClick={() => removeFilterTag('size', s)} className="hover:text-red-500" aria-label={`Remove ${s} size filter`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.colors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 py-1 px-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-full text-stone-800 dark:text-stone-200 text-[11px]"
            >
              Color: {c}
              <button type="button" onClick={() => removeFilterTag('color', c)} className="hover:text-red-500" aria-label={`Remove ${c} color filter`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.isNewOnly && (
            <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-full text-stone-800 dark:text-stone-200 text-[11px]">
              New Drops Only
              <button type="button" onClick={() => removeFilterTag('new')} className="hover:text-red-500" aria-label="Remove new arrivals filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetFilters}
            className="text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white underline ml-auto cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-3 sticky top-28">
          <FilterSidebar
            filters={filters}
            onUpdateFilter={updateFilter}
            onResetFilters={resetFilters}
          />
        </div>

        {/* Product Grid Area */}
        <div className="col-span-1 lg:col-span-9">
          <ProductGrid
            products={products}
            isLoading={loading}
            emptyTitle="No garments match your active criteria"
            emptyDescription="Try clearing your size, color, or category filters to explore our full seasonal archive."
            columns={3}
          />
        </div>
      </div>

      {/* Mobile Filters Slide-in Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-[85%] max-w-sm bg-white dark:bg-stone-900 h-full overflow-y-auto shadow-2xl ml-auto animate-in slide-in-from-right duration-300">
            <FilterSidebar
              filters={filters}
              onUpdateFilter={updateFilter}
              onResetFilters={resetFilters}
              isMobileDrawer
              onCloseMobileDrawer={() => setMobileFiltersOpen(false)}
            />
            <div className="sticky bottom-0 p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-widest font-semibold rounded-xs"
              >
                View {totalCount} Garments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
