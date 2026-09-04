import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';

export const CartNotificationToast: React.FC = () => {
  const { lastAddedItem, clearLastAddedItem } = useCart();

  useEffect(() => {
    if (lastAddedItem) {
      const timer = setTimeout(() => {
        clearLastAddedItem();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem, clearLastAddedItem]);

  if (!lastAddedItem) return null;

  const { product, size, color, quantity } = lastAddedItem;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl rounded-sm p-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800/80 mb-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
          <Check className="w-4 h-4" /> Added to Your Bag
        </div>
        <button
          onClick={clearLastAddedItem}
          className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-16 h-20 object-cover object-center bg-stone-100 dark:bg-stone-800 rounded-xs"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
            {product.name}
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Size: {size} • Color: {color.name}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Qty: {quantity}</p>
          <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 mt-1">
            {formatCurrency(product.price)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Link
          to="/cart"
          onClick={clearLastAddedItem}
          className="text-center py-2 px-3 text-xs uppercase tracking-wider font-medium border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          View Bag
        </Link>
        <Link
          to="/checkout"
          onClick={clearLastAddedItem}
          className="text-center py-2 px-3 text-xs uppercase tracking-wider font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white transition-colors"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
};
