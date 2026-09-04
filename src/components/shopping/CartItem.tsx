import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Heart } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { product, size, color, quantity } = item;

  const inWishlist = isInWishlist(product.id);

  const handleSaveForLater = () => {
    if (!inWishlist) {
      toggleWishlist(product);
    }
    removeFromCart(item.id);
  };

  return (
    <div className="flex gap-4 sm:gap-6 py-6 border-b border-stone-200 dark:border-white/10 last:border-b-0">
      {/* Product Image */}
      <Link
        to={`/product/${product.id}`}
        className="flex-shrink-0 w-24 sm:w-32 aspect-[3/4] bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-xs overflow-hidden"
      >
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 block mb-0.5">
                {product.category}
              </span>
              <Link
                to={`/product/${product.id}`}
                className="text-sm sm:text-base font-normal text-stone-950 dark:text-white hover:underline line-clamp-1"
              >
                {product.name}
              </Link>
            </div>
            <span className="text-sm sm:text-base font-medium text-stone-950 dark:text-white whitespace-nowrap">
              {formatCurrency(product.price * quantity)}
            </span>
          </div>

          {/* Size and color */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-2">
            <span>Size: <strong className="text-stone-800 dark:text-stone-200">{size}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              Color:
              <span
                className="w-2.5 h-2.5 rounded-full border border-stone-300 dark:border-white/30"
                style={{ backgroundColor: color.hex }}
              />
              <strong className="text-stone-800 dark:text-stone-200">{color.name}</strong>
            </span>
          </div>
        </div>

        {/* Quantity Controls & Secondary Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-2">
          {/* Stepper */}
          <div className="flex items-center border border-stone-300 dark:border-white/15 bg-stone-100 dark:bg-zinc-900/60 rounded-xs">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 sm:w-10 text-center text-xs font-semibold text-stone-950 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Save for later & Remove */}
          <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
            <button
              type="button"
              onClick={handleSaveForLater}
              className="inline-flex items-center gap-1 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save for Later</span>
            </button>

            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              className="inline-flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
