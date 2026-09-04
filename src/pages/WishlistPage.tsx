import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { WishlistItem } from '../components/shopping/WishlistItem';
import { EmptyState } from '../components/common/EmptyState';

export const WishlistPage: React.FC = () => {
  const { items, wishlist, itemCount, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const safeItems = items || wishlist?.map((w) => w.product) || [];

  const handleAddAllToCart = () => {
    safeItems.forEach((item) => {
      addToCart(item, item.sizes?.[0] || 'M', item.colors?.[0] || { name: 'Default', hex: '#000000' }, 1);
    });
  };

  if (safeItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<Heart className="w-8 h-8" />}
          title="Your Wishlist is Empty"
          description="Save the garments that speak to your personal frequency. Return anytime to complete your ensemble."
          actionText="Discover The Collection"
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
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
            Saved Curations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950 dark:text-white font-light">
            Personal Wishlist ({safeItems.length} {safeItems.length === 1 ? 'Piece' : 'Pieces'})
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleAddAllToCart}
            className="py-2.5 px-4 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold rounded-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add All to Bag
          </button>
          <button
            type="button"
            onClick={clearWishlist}
            className="text-[11px] text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white uppercase tracking-wider underline cursor-pointer transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Wishlist items list */}
      <div className="max-w-4xl divide-y divide-stone-200 dark:divide-white/10">
        {safeItems.map((product) => (
          <WishlistItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
