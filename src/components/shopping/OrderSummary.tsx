import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { OrderItem } from '../../types';

interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  promoCode?: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  shipping,
  discount = 0,
  total,
  promoCode,
}) => {
  return (
    <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-4">
        <h3 className="font-serif text-xl text-stone-950 dark:text-white font-light">
          Order Summary
        </h3>
        <span className="text-xs text-stone-400 font-light">
          {items.reduce((acc, i) => acc + i.quantity, 0)} items
        </span>
      </div>

      {/* Item List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-stone-200 dark:divide-white/10 pr-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-3 py-3 items-center">
            <img
              src={item.image || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'}
              alt={item.productName}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80';
              }}
              className="w-14 h-18 object-cover rounded-xs bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-normal text-stone-950 dark:text-white truncate">
                {item.productName}
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Size: {item.size} • {item.color.name}
              </p>
              <p className="text-[11px] text-stone-500">
                Qty: {item.quantity}
              </p>
            </div>
            <span className="text-xs font-medium text-stone-950 dark:text-white whitespace-nowrap">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5 pt-4 border-t border-stone-200 dark:border-white/10 text-xs sm:text-sm">
        <div className="flex justify-between text-stone-400">
          <span>Subtotal</span>
          <span className="font-medium text-stone-950 dark:text-white">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-stone-400">
          <span>Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-emerald-400 font-medium tracking-wider text-xs">COMPLIMENTARY</span>
            ) : (
              formatCurrency(shipping)
            )}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-amber-300 font-medium">
            <span>Privilege Discount {promoCode && `(${promoCode})`}</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="pt-4 border-t border-stone-200 dark:border-white/10 flex justify-between items-baseline text-base font-light text-stone-950 dark:text-white">
          <span>Total</span>
          <span className="text-xl sm:text-2xl font-normal">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};
