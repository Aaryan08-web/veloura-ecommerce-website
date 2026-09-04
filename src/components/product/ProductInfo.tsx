import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Check, ShieldCheck, Truck, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Product, ProductColor } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { ProductRating } from './ProductRating';
import { ProductVariants } from './ProductVariants';
import { Modal } from '../common/Modal';

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors?.[0] || { name: 'Default', hex: '#000000' }
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'details' | 'materials' | 'fit' | 'care' | 'shipping'>('details');

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const toggleSection = (section: 'details' | 'materials' | 'fit' | 'care' | 'shipping') => {
    setExpandedSection(expandedSection === section ? 'details' : section);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Category & Status */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] font-medium text-stone-500 dark:text-stone-400">
          {product.gender === 'men' ? "Men's Atelier" : "Women's Atelier"} • {product.category}
        </span>
        {product.isNew && (
          <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
            NEW DROP
          </span>
        )}
      </div>

      {/* Product Title */}
      <h1 className="font-serif-luxury text-3xl sm:text-4xl text-stone-950 dark:text-white font-normal leading-tight">
        {product.name}
      </h1>

      {/* Reviews & Star Rating */}
      <div className="flex items-center gap-3">
        <ProductRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
        <span className="text-xs text-stone-400">•</span>
        <a href="#reviews" className="text-xs text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white underline">
          Read customer reflections
        </a>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
        <span className="text-2xl sm:text-3xl font-semibold text-stone-950 dark:text-white">
          {formatCurrency(product.price)}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-base text-stone-400 line-through font-light">
            {formatCurrency(product.originalPrice)}
          </span>
        )}
        {product.discount && (
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-xs">
            Save {product.discount}%
          </span>
        )}
      </div>

      {/* Variants (Colors, Sizes, Quantity) */}
      <ProductVariants
        sizes={product.sizes}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        colors={product.colors}
        selectedColor={selectedColor}
        onSelectColor={setSelectedColor}
        quantity={quantity}
        onUpdateQuantity={setQuantity}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        stock={product.stock}
      />

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdded}
            className={`flex-1 py-4 px-6 rounded-xs text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2.5 transition-all shadow-md dark:shadow-xl ${
              product.stock === 0
                ? 'bg-stone-300 text-stone-500 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed border border-stone-300 dark:border-zinc-700'
                : isAdded
                ? 'bg-emerald-700 text-white cursor-default'
                : 'bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] active:scale-[0.99] cursor-pointer'
            }`}
          >
            {product.stock === 0 ? (
              'Out of Stock'
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4" /> Added to Your Bag
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Bag — {formatCurrency(product.price * quantity)}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            className="w-14 rounded-xs border border-stone-300 bg-stone-50 dark:border-white/20 dark:bg-zinc-900 flex items-center justify-center text-stone-500 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white hover:border-stone-500 dark:hover:border-white/50 transition-colors cursor-pointer"
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-stone-950 text-stone-950 dark:fill-white dark:text-white' : ''}`} />
          </button>
        </div>

        {product.stock !== 0 && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full py-3.5 px-6 rounded-xs text-[10px] uppercase tracking-[0.2em] font-bold border border-stone-400 text-stone-900 hover:bg-stone-900 hover:text-white dark:border-white/30 dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          >
            Buy It Now
          </button>
        )}
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2 py-4 border-y border-stone-200 dark:border-white/10 text-center text-stone-500 dark:text-stone-400">
        <div className="flex flex-col items-center gap-1 p-2">
          <Truck className="w-4 h-4 text-stone-500 dark:text-stone-300" />
          <span className="text-[9px] uppercase tracking-[0.2em]">Free Global Delivery</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 border-x border-stone-200 dark:border-white/10">
          <RotateCcw className="w-4 h-4 text-stone-500 dark:text-stone-300" />
          <span className="text-[9px] uppercase tracking-[0.2em]">30-Day Returns</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2">
          <ShieldCheck className="w-4 h-4 text-stone-500 dark:text-stone-300" />
          <span className="text-[9px] uppercase tracking-[0.2em]">Atelier Authenticity</span>
        </div>
      </div>

      {/* Editorial Accordions */}
      <div className="divide-y divide-stone-200 dark:divide-white/10 text-sm">
        {/* Description & Details */}
        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleSection('details')}
            className="w-full flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-stone-900 dark:text-white text-left py-1"
          >
            <span>Design & Construction</span>
            {expandedSection === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSection === 'details' && (
            <div className="mt-3 text-stone-600 dark:text-stone-400 text-xs leading-relaxed space-y-2 animate-in fade-in duration-150">
              <p>{product.description}</p>
              {product.details && (
                <ul className="list-disc list-inside space-y-1 pt-2">
                  {product.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Materials */}
        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleSection('materials')}
            className="w-full flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-stone-900 dark:text-white text-left py-1"
          >
            <span>Materials & Fiber Traceability</span>
            {expandedSection === 'materials' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSection === 'materials' && (
            <div className="mt-3 text-stone-600 dark:text-stone-400 text-xs leading-relaxed space-y-2 animate-in fade-in duration-150">
              <p className="font-medium text-stone-900 dark:text-white">{product.material}</p>
              <p>Sourced from certified ethical partner mills committed to closed-loop water treatment and carbon-neutral weaving standards.</p>
            </div>
          )}
        </div>

        {/* Fit */}
        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleSection('fit')}
            className="w-full flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-stone-900 dark:text-white text-left py-1"
          >
            <span>Tailored Fit & Model Specs</span>
            {expandedSection === 'fit' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSection === 'fit' && (
            <div className="mt-3 text-stone-600 dark:text-stone-400 text-xs leading-relaxed space-y-1.5 animate-in fade-in duration-150">
              <p>{product.fit}</p>
              <p className="text-stone-500">Model is 6'1" (185 cm) / 5'10" (178 cm) wearing size M.</p>
            </div>
          )}
        </div>

        {/* Care */}
        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleSection('care')}
            className="w-full flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-stone-900 dark:text-white text-left py-1"
          >
            <span>Garment Longevity & Care</span>
            {expandedSection === 'care' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSection === 'care' && (
            <div className="mt-3 text-stone-600 dark:text-stone-400 text-xs leading-relaxed animate-in fade-in duration-150">
              <ul className="list-disc list-inside space-y-1">
                {(product.careInstructions || ['Dry clean or delicate cold wash', 'Lay flat to dry']).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Shipping & Returns */}
        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleSection('shipping')}
            className="w-full flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-stone-900 dark:text-white text-left py-1"
          >
            <span>Shipping & White-Glove Returns</span>
            {expandedSection === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSection === 'shipping' && (
            <div className="mt-3 text-stone-600 dark:text-stone-400 text-xs leading-relaxed space-y-1.5 animate-in fade-in duration-150">
              <p>Complimentary standard carbon-neutral shipping on orders over $150. Express 2-day delivery available at checkout.</p>
              <p>Returns accepted within 30 days of receipt in original unworn condition with tags intact.</p>
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      <Modal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} title="VELOURA Size Guide" maxWidth="lg">
        <div className="space-y-4 text-xs">
          <p className="text-stone-600 dark:text-stone-400">
            Measurements correspond to body dimensions in inches. For an intentionally oversized silhouette, select your true size; for a closer tailored fit, consider sizing down.
          </p>
          <div className="overflow-x-auto border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left">
              <thead className="bg-stone-100 dark:bg-stone-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Chest / Bust</th>
                  <th className="p-2.5">Waist</th>
                  <th className="p-2.5">Hips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                <tr><td className="p-2.5 font-semibold">XS</td><td className="p-2.5">32 - 34"</td><td className="p-2.5">25 - 27"</td><td className="p-2.5">34 - 36"</td></tr>
                <tr><td className="p-2.5 font-semibold">S</td><td className="p-2.5">35 - 37"</td><td className="p-2.5">28 - 30"</td><td className="p-2.5">37 - 39"</td></tr>
                <tr><td className="p-2.5 font-semibold">M</td><td className="p-2.5">38 - 40"</td><td className="p-2.5">31 - 33"</td><td className="p-2.5">40 - 42"</td></tr>
                <tr><td className="p-2.5 font-semibold">L</td><td className="p-2.5">41 - 43"</td><td className="p-2.5">34 - 36"</td><td className="p-2.5">43 - 45"</td></tr>
                <tr><td className="p-2.5 font-semibold">XL</td><td className="p-2.5">44 - 46"</td><td className="p-2.5">37 - 39"</td><td className="p-2.5">46 - 48"</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};
