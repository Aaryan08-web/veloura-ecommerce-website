import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight, X, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';

export const CartSummary: React.FC = () => {
  const { subtotal, shipping, discount, total, coupon, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({
      text: res.message,
      isError: !res.success,
    });
    if (res.success) {
      setCouponInput('');
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs p-6 sm:p-8 space-y-6 shadow-xl">
      <h3 className="font-serif text-xl text-stone-950 dark:text-white font-light border-b border-stone-200 dark:border-white/10 pb-4">
        Order Summary
      </h3>

      {/* Free Shipping Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-stone-400">
            {remainingForFreeShipping === 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> You've unlocked Complimentary Express Shipping!
              </span>
            ) : (
              <span>
                Add <strong className="text-stone-950 dark:text-white font-semibold">{formatCurrency(remainingForFreeShipping)}</strong> for Free Delivery
              </span>
            )}
          </span>
          <span className="font-medium text-stone-300">
            {Math.round(progressToFreeShipping)}%
          </span>
        </div>
        <div className="w-full bg-stone-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-stone-950 dark:bg-white h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-stone-400">
          <span>Subtotal</span>
          <span className="text-stone-950 dark:text-white font-medium">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-stone-400">
          <span>Estimated Shipping</span>
          <span>
            {shipping === 0 ? (
              <span className="text-emerald-400 font-medium tracking-wider text-xs">COMPLIMENTARY</span>
            ) : (
              formatCurrency(shipping)
            )}
          </span>
        </div>

        {coupon && (
          <div className="flex justify-between text-amber-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Promo ({coupon.code} -{coupon.discountPercent}%)
            </span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="pt-4 border-t border-stone-200 dark:border-white/10 flex justify-between items-baseline text-base sm:text-lg font-light text-stone-950 dark:text-white">
          <span>Estimated Total</span>
          <span className="text-xl sm:text-2xl font-normal">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Promo Code Form */}
      <div className="pt-2">
        {coupon ? (
          <div className="flex items-center justify-between p-3 bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-xs text-xs">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium text-stone-950 dark:text-white">{coupon.code}</span>
              <span className="text-stone-500">applied</span>
            </div>
            <button
              type="button"
              onClick={() => {
                removeCoupon();
                setCouponMessage(null);
              }}
              className="text-stone-500 hover:text-stone-950 dark:hover:text-white"
              aria-label="Remove promo code"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyPromo} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Promo Code (e.g. VELOURA15)"
                aria-label="Promo code"
                className="flex-1 px-3 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-xs text-stone-900 dark:text-white uppercase tracking-wider rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-stone-950 text-white dark:bg-white dark:text-black text-[10px] uppercase tracking-[0.2em] font-bold rounded-xs hover:bg-stone-800 dark:hover:bg-[#EAEAEA] transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p
                className={`text-xs ${
                  couponMessage.isError
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {couponMessage.text}
              </p>
            )}
            <p className="text-[11px] text-stone-500">
              Members receive 15% off with code <strong>VELOURA15</strong>
            </p>
          </form>
        )}
      </div>

      {/* Checkout Button */}
      <Link
        to="/checkout"
        className="w-full py-4 px-6 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 rounded-xs shadow-xl transition-all active:scale-[0.99] text-center cursor-pointer"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </Link>

      <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-2">
        <ShieldCheck className="w-4 h-4 text-stone-400" />
        <span>Guaranteed Secure 256-Bit Encrypted Checkout</span>
      </div>
    </div>
  );
};
