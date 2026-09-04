import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { ProductRating } from './ProductRating';

interface ProductCardProps {
  product: Product;
  aspectRatio?: '3/4' | '4/5';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, aspectRatio = '3/4' }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [justAdded, setJustAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  const isOutOfStock = typeof product.stock === 'number' && product.stock === 0;
  const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5;
  const targetId = product.id || product.slug || (product as any)._id;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, selectedSize, product.colors?.[0] || { name: 'Default', hex: '#000000' }, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setQuickAddOpen(false);
    }, 1500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const aspectClass = aspectRatio === '3/4' ? 'aspect-[3/4]' : 'aspect-[4/5]';

  return (
    <div
      className="group relative flex flex-col w-full text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setQuickAddOpen(false);
      }}
    >
      {/* Image Container with Badges & Wishlist Button */}
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 mb-3 rounded-xs`}>
        <Link to={`/product/${targetId}`} className="block w-full h-full">
          {/* Primary image */}
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80';
            }}
            className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
              isHovered && secondaryImage !== primaryImage ? 'opacity-0' : 'opacity-100'
            } ${isOutOfStock ? 'grayscale-[40%] opacity-85' : ''}`}
          />
          {/* Secondary image on hover */}
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80';
              }}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-out ${
                isHovered ? 'opacity-100' : 'opacity-0'
              } ${isOutOfStock ? 'grayscale-[40%] opacity-85' : ''}`}
            />
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {/* Stock Badges */}
          {isOutOfStock ? (
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 bg-rose-950/90 text-rose-200 border border-rose-500/40 shadow-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 bg-amber-900/90 text-amber-200 border border-amber-500/40 shadow-xs">
              Only {product.stock} left
            </span>
          ) : null}

          {product.isNew && !isOutOfStock && (
            <span className="text-[9px] uppercase tracking-[0.2em] font-medium px-2 py-0.5 bg-stone-950 text-white dark:bg-white dark:text-black shadow-xs">
              NEW
            </span>
          )}
          {product.discount && product.discount > 0 && !isOutOfStock && (
            <span className="text-[9px] uppercase tracking-[0.2em] font-medium px-2 py-0.5 bg-amber-900/90 text-amber-200 border border-amber-500/30 shadow-xs">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/20 backdrop-blur-md flex items-center justify-center text-stone-200 hover:text-white hover:border-white/40 hover:scale-110 active:scale-95 transition-all shadow-xs"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              inWishlist ? 'fill-white text-white' : 'stroke-[1.5]'
            }`}
          />
        </button>

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="absolute bottom-0 inset-x-0 p-2 z-10 transition-transform duration-200 ease-out transform translate-y-full group-hover:translate-y-0 hidden sm:block">
          {isOutOfStock ? (
            <div className="w-full py-2.5 bg-stone-900/80 dark:bg-stone-950/80 backdrop-blur-xs text-stone-400 dark:text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold text-center border border-white/10 shadow-lg cursor-not-allowed">
              Out of Stock
            </div>
          ) : !quickAddOpen ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickAddOpen(true);
              }}
              className="w-full py-2.5 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Quick Add
            </button>
          ) : (
            <div
              className="p-3 bg-white dark:bg-[#121212] shadow-2xl border border-stone-300 dark:border-white/15 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 font-medium">
                  Select Size
                </span>
                <span className="text-[9px] text-stone-600 dark:text-stone-400">
                  {product.colors?.[0]?.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2.5">
                {(product.sizes || []).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[28px] h-6 px-1.5 text-[10px] font-medium border transition-colors ${
                      selectedSize === size
                        ? 'border-stone-950 bg-stone-950 text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-stone-300 dark:border-white/20 text-stone-700 dark:text-stone-300 hover:border-stone-500 dark:hover:border-white/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={justAdded}
                className="w-full py-2 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[9px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    Added to Bag
                  </>
                ) : (
                  'Add to Bag'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[9px] text-stone-500 dark:text-stone-400">
          <span className="uppercase tracking-[0.25em] font-light">{product.category}</span>
          <ProductRating rating={product.rating} showCount={false} size="sm" />
        </div>

        <Link
          to={`/product/${targetId}`}
          className="text-xs sm:text-sm font-normal text-stone-900 hover:text-stone-600 dark:text-white dark:hover:text-stone-300 transition-colors line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-sm font-medium text-stone-950 dark:text-white">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-stone-400 dark:text-stone-500 line-through font-light">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Color swatches hint */}
        <div className="flex items-center gap-1.5 mt-1">
          {(product.colors || []).slice(0, 3).map((c) => (
            <span
              key={c.name}
              className="w-2.5 h-2.5 rounded-full border border-stone-300 dark:border-white/20"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          {(product.colors?.length || 0) > 3 && (
            <span className="text-[9px] text-stone-400 dark:text-stone-500">+{(product.colors?.length || 0) - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
};
