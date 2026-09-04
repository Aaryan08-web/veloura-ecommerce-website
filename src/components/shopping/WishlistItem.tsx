import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

interface WishlistItemProps {
  product: Product;
}

export const WishlistItem: React.FC<WishlistItemProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { removeFromWishlist } = useWishlist();
  const [selectedSize] = useState(product.sizes?.[0] || 'M');
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, product.colors?.[0] || { name: 'Default', hex: '#000000' }, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  return (
    <div className="flex gap-4 sm:gap-6 py-6 border-b border-stone-200 dark:border-white/10 last:border-b-0">
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

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
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
            <span className="text-sm sm:text-base font-medium text-stone-950 dark:text-white">
              {formatCurrency(product.price)}
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-1 font-light">
            {product.description}
          </p>

          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-stone-500 dark:text-stone-500">Available Sizes:</span>
            <span className="text-stone-800 dark:text-stone-300 font-medium">
              {product.sizes.join(', ')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`py-2.5 px-4 text-[10px] uppercase tracking-[0.2em] font-bold rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added to Bag
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => removeFromWishlist(product.id)}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-500 dark:text-stone-400 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};
