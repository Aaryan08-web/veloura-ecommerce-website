import React from 'react';
import { ProductColor } from '../../types';
import { Minus, Plus, Ruler } from 'lucide-react';

interface ProductVariantsProps {
  sizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
  colors: ProductColor[];
  selectedColor: ProductColor;
  onSelectColor: (color: ProductColor) => void;
  quantity: number;
  onUpdateQuantity: (qty: number) => void;
  onOpenSizeGuide?: () => void;
  stock?: number;
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  sizes,
  selectedSize,
  onSelectSize,
  colors,
  selectedColor,
  onSelectColor,
  quantity,
  onUpdateQuantity,
  onOpenSizeGuide,
  stock = 15,
}) => {
  return (
    <div className="space-y-6">
      {/* Color Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-300">
            Color
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-light">
            {selectedColor?.name || ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {(colors || []).map((color) => {
            const isSelected = selectedColor?.name === color.name;
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => onSelectColor(color)}
                className={`relative w-8 h-8 rounded-full p-0.5 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-stone-900 ring-1 ring-stone-900/30 dark:border-white dark:ring-white/40 scale-110'
                    : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                title={color.name}
                aria-label={`Select ${color.name}`}
              >
                <span
                  className="block w-full h-full rounded-full border border-stone-300 dark:border-white/20 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-300">
            Size
          </span>
          {onOpenSizeGuide && (
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white underline transition-colors cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5" />
              Size Guide
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {(sizes || []).map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onSelectSize(size)}
                className={`py-2.5 text-[10px] uppercase tracking-[0.2em] font-semibold border rounded-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-stone-950 text-white border-stone-950 dark:bg-white dark:text-black dark:border-white shadow-sm font-bold'
                    : 'border-stone-300 text-stone-700 hover:border-stone-500 bg-stone-50 dark:border-white/15 dark:text-stone-300 dark:hover:border-white/40 dark:bg-zinc-900/50'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity & In-Stock Indicator */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-300">
            Quantity
          </span>
          <div className="flex items-center border border-stone-300 dark:border-white/15 rounded-xs bg-stone-50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-xs font-semibold text-stone-950 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(Math.min(stock, quantity + 1))}
              disabled={quantity >= stock}
              className="p-2 text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="text-xs">
          {stock === 0 ? (
            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Out of Stock
            </span>
          ) : stock <= 5 ? (
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Only {stock} left in stock
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              In Stock ({stock} available)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
