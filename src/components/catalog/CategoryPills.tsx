import React from 'react';
import { ProductCategory } from '../../types';
import { CATEGORIES } from '../../data/constants';

interface CategoryPillsProps {
  selectedCategories: ProductCategory[];
  onSelectCategory: (category: ProductCategory | 'all') => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategories = [],
  onSelectCategory,
}) => {
  const safeCategories = selectedCategories || [];
  const isAll = safeCategories.length === 0;

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-full whitespace-nowrap transition-colors cursor-pointer ${
          isAll
            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-semibold'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
        }`}
      >
        All Silhouettes
      </button>
      {CATEGORIES.map((cat) => {
        const isSelected = safeCategories.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-medium rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              isSelected
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-semibold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};
