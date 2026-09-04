import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/shopping/CartItem';
import { CartSummary } from '../components/shopping/CartSummary';
import { EmptyState } from '../components/common/EmptyState';

export const CartPage: React.FC = () => {
  const { items, cart, itemCount, clearCart } = useCart();
  const safeItems = items || cart || [];

  if (safeItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your Shopping Bag is Empty"
          description="Your personal wardrobe archive awaits. Discover curated outerwear, Italian tailoring, and essential cashmere silhouettes."
          actionText="Explore New Drops"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-6 border-b border-stone-200 dark:border-white/10 mb-8 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
            Review Bag
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950 dark:text-white font-light">
            Shopping Bag ({itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'})
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-stone-500 hover:text-red-500 dark:text-stone-400 dark:hover:text-red-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Bag</span>
          </button>
        </div>
      </div>

      {/* Grid: Items list + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Items column */}
        <div className="col-span-1 lg:col-span-7 divide-y divide-stone-200 dark:divide-white/10">
          {safeItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}

          <div className="pt-6">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary column */}
        <div className="col-span-1 lg:col-span-5 sticky top-28">
          <CartSummary />
        </div>
      </div>
    </div>
  );
};
