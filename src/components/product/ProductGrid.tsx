import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  columns?: 3 | 4;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your filters or search keywords to find what you are looking for.',
  columns = 4,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="animate-pulse space-y-3">
            <div className="aspect-[3/4] bg-stone-200 dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded-xs" />
            <div className="h-3 bg-stone-200 dark:bg-zinc-900 rounded-xs w-1/3" />
            <div className="h-4 bg-stone-200 dark:bg-zinc-900 rounded-xs w-3/4" />
            <div className="h-4 bg-stone-200 dark:bg-zinc-900 rounded-xs w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen className="w-8 h-8" />}
        title={emptyTitle}
        description={emptyDescription}
        actionText="View All Products"
        actionHref="/shop"
      />
    );
  }

  const colClasses =
    columns === 3
      ? 'grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8'
      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8';

  return (
    <div className={colClasses}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
