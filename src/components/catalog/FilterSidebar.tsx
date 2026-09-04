import React from 'react';
import { FilterState, ProductCategory } from '../../types';
import { CATEGORIES, SIZES, COLORS } from '../../data/constants';
import { X, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

interface FilterSidebarProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const currentCategories = filters.categories || [];
  const currentSizes = filters.sizes || [];
  const currentColors = filters.colors || [];
  const priceRange = filters.priceRange || [0, 500];

  const toggleCategory = (cat: ProductCategory) => {
    const next = currentCategories.includes(cat)
      ? currentCategories.filter((c) => c !== cat)
      : [...currentCategories, cat];
    onUpdateFilter('categories', next);
  };

  const toggleSize = (size: string) => {
    const next = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];
    onUpdateFilter('sizes', next);
  };

  const toggleColor = (colorName: string) => {
    const next = currentColors.includes(colorName)
      ? currentColors.filter((c) => c !== colorName)
      : [...currentColors, colorName];
    onUpdateFilter('colors', next);
  };

  const activeFiltersCount =
    (filters.gender !== 'all' ? 1 : 0) +
    currentCategories.length +
    currentSizes.length +
    currentColors.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.isNewOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0);

  return (
    <aside className={`w-full ${isMobileDrawer ? 'p-6' : 'pr-6'} space-y-8`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-white">
            Refine Atelier
          </h3>
          {activeFiltersCount > 0 && (
            <span className="text-[10px] bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 px-1.5 py-0.5 rounded-full font-bold">
              {activeFiltersCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-1 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Gender / Silhouette Section */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-100 mb-3">
          Collection
        </h4>
        <div className="grid grid-cols-3 gap-1.5">
          {(['all', 'women', 'men'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onUpdateFilter('gender', g)}
              className={`py-2 text-[11px] uppercase tracking-wider font-medium border rounded-xs transition-colors cursor-pointer ${
                filters.gender === g
                  ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-950 dark:border-white'
                  : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
              }`}
            >
              {g === 'all' ? 'All' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-100 mb-3">
          Categories
        </h4>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => {
            const checked = currentCategories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4 rounded-xs border-stone-300 dark:border-stone-700 text-stone-900 focus:ring-0 cursor-pointer"
                />
                <span className={checked ? 'font-medium text-stone-950 dark:text-white' : ''}>
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-100">
            Price Range
          </h4>
          <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
            {formatCurrency(priceRange[0])} – {formatCurrency(priceRange[1])}
          </span>
        </div>
        <input
          aria-label="Maximum price"
          type="range"
          min={0}
          max={500}
          step={20}
          value={priceRange[1]}
          onChange={(e) =>
            onUpdateFilter('priceRange', [priceRange[0], Number(e.target.value)])
          }
          className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-stone-100"
        />
        <div className="flex justify-between text-[10px] text-stone-400 mt-1.5">
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(500)}+</span>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-100 mb-3">
          Size
        </h4>
        <div className="grid grid-cols-3 gap-1.5">
          {SIZES.map((size) => {
            const isSelected = currentSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`py-2 text-[11px] uppercase tracking-wider font-medium border rounded-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-950 dark:border-white'
                    : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors Swatches */}
      <div>
        <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-900 dark:text-stone-100 mb-3">
          Palette
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => {
            const isSelected = currentColors.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleColor(c.name)}
                className={`relative w-7 h-7 rounded-full p-0.5 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-stone-900 dark:border-white scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                title={c.name}
                aria-label={`${isSelected ? 'Remove' : 'Filter by'} ${c.name}`}
                aria-pressed={isSelected}
              >
                <span
                  className="block w-full h-full rounded-full border border-stone-300 dark:border-stone-700 shadow-inner"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles (New drops & in stock) */}
      <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
        <label className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.isNewOnly}
            onChange={(e) => onUpdateFilter('isNewOnly', e.target.checked)}
            className="w-4 h-4 rounded-xs border-stone-300 dark:border-stone-700 text-stone-900 focus:ring-0 cursor-pointer"
          />
          <span>New Atelier Drops Only</span>
        </label>

        <label className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onUpdateFilter('inStockOnly', e.target.checked)}
            className="w-4 h-4 rounded-xs border-stone-300 dark:border-stone-700 text-stone-900 focus:ring-0 cursor-pointer"
          />
          <span>In Stock Immediately</span>
        </label>
      </div>
    </aside>
  );
};
