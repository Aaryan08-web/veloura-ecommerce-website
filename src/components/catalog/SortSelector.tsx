import React from 'react';
import { SortOption } from '../../types';
import { ArrowUpDown } from 'lucide-react';

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const SortSelector: React.FC<SortSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 hidden sm:inline" />
      <span className="text-xs uppercase tracking-wider font-semibold text-stone-700 dark:text-stone-300 hidden sm:inline">
        Sort:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs px-3 py-2 rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white cursor-pointer uppercase tracking-wider"
      >
        <option value="featured">Featured Curations</option>
        <option value="newest">Newest Drops</option>
        <option value="popular">Most Popular</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating-desc">Highest Rated</option>
      </select>
    </div>
  );
};
