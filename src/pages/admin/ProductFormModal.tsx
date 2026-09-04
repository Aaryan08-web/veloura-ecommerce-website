import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Check, AlertCircle, Sparkles, Upload, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { ProductFormData, adminClient } from '../../services/adminClient';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialProduct?: Product | null;
  isLoading?: boolean;
}

const LUXURY_CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Hoodies',
  'Jackets',
  'Trousers',
  'Tops',
  'Dresses',
  'Coats & Trench',
  'Knitwear & Cashmere',
  'Blazers & Tailoring',
  'Tailored Trousers',
  'Dresses & Gowns',
  'Silk & Satin Tops',
  'Shoes',
  'Accessories',
  'Cosmetics',
];

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', 'One Size'];

const PRESET_COLORS = [
  { name: 'Midnight Black', hex: '#111111' },
  { name: 'Ivory White', hex: '#F9F8F6' },
  { name: 'Champagne Gold', hex: '#D4AF37' },
  { name: 'Slate Grey', hex: '#708090' },
  { name: 'Raw Silk Cream', hex: '#EBE6DE' },
  { name: 'Navy Dusk', hex: '#1B263B' },
  { name: 'Espresso Brown', hex: '#3D2817' },
  { name: 'Olive Drab', hex: '#556B2F' },
];

const SAMPLE_IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProduct,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Shirts');
  const [customCategory, setCustomCategory] = useState('');
  const [department, setDepartment] = useState<'clothing' | 'cosmetics' | 'shoes' | 'accessories'>('clothing');
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>('unisex');
  const [brand, setBrand] = useState('VELOURA');
  const [price, setPrice] = useState<number | ''>(4500);
  const [originalPrice, setOriginalPrice] = useState<number | ''>(5500);
  const [discount, setDiscount] = useState<number | ''>(15);
  const [stock, setStock] = useState<number | ''>(25);
  const [material, setMaterial] = useState('100% Organic Silk & Cotton');
  const [fit, setFit] = useState('Architectural Tailored Fit');
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [colors, setColors] = useState<Array<{ name: string; hex: string }>>([
    { name: 'Midnight Black', hex: '#111111' },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isNew, setIsNew] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Populate form on edit
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setDescription(initialProduct.description || '');
      setCategory(initialProduct.category || 'Shirts');
      setDepartment((initialProduct as any).department || 'clothing');
      setGender(initialProduct.gender || 'unisex');
      setBrand((initialProduct as any).brand || 'VELOURA');
      setPrice(initialProduct.price ?? '');
      setOriginalPrice(initialProduct.originalPrice ?? '');
      setDiscount(initialProduct.discount ?? 0);
      setStock(initialProduct.stock ?? 0);
      setMaterial(initialProduct.material || '');
      setFit(initialProduct.fit || '');
      setSizes(initialProduct.sizes && initialProduct.sizes.length > 0 ? initialProduct.sizes : ['M', 'L']);
      setColors(initialProduct.colors && initialProduct.colors.length > 0 ? initialProduct.colors : [{ name: 'Black', hex: '#000000' }]);
      setImages(initialProduct.images && initialProduct.images.length > 0 ? initialProduct.images : []);
      setIsNew(Boolean(initialProduct.isNew));
      setIsFeatured(Boolean(initialProduct.isFeatured));
      setIsBestSeller(Boolean(initialProduct.isBestSeller));
      setIsActive((initialProduct as any).isActive !== false);
    } else {
      // Defaults for new product
      setName('');
      setDescription('');
      setCategory('Shirts');
      setDepartment('clothing');
      setGender('unisex');
      setBrand('VELOURA');
      setPrice(4500);
      setOriginalPrice(5500);
      setDiscount(15);
      setStock(20);
      setMaterial('100% Mulberry Silk');
      setFit('Relaxed Contemporary Silhouette');
      setSizes(['S', 'M', 'L', 'XL']);
      setColors([{ name: 'Midnight Black', hex: '#111111' }]);
      setImages([
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
      ]);
      setIsNew(true);
      setIsFeatured(true);
      setIsBestSeller(false);
      setIsActive(true);
    }
    setError(null);
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      if (sizes.length === 1) return; // Keep at least one
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const addCustomSize = () => {
    const s = customSizeInput.trim().toUpperCase();
    if (s && !sizes.includes(s)) {
      setSizes([...sizes, s]);
      setCustomSizeInput('');
    }
  };

  const addColor = (c: { name: string; hex: string }) => {
    if (!colors.some((col) => col.name.toLowerCase() === c.name.toLowerCase())) {
      setColors([...colors, c]);
    }
  };

  const addCustomColor = () => {
    if (newColorName.trim()) {
      addColor({ name: newColorName.trim(), hex: newColorHex });
      setNewColorName('');
    }
  };

  const removeColor = (index: number) => {
    if (colors.length <= 1) return;
    setColors(colors.filter((_, i) => i !== index));
  };

  const addImage = (url: string) => {
    const clean = url.trim();
    if (clean && !images.includes(clean)) {
      setImages([...images, clean]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setError(null);
    try {
      const res = await adminClient.uploadImage(file);
      if (res?.url) {
        setImages((prev) => [...prev, res.url]);
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setError(err?.message || 'Failed to upload image. You can also paste an image URL directly.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (price === '' || Number(price) < 0) {
      setError('A valid positive price is required.');
      return;
    }
    if (stock === '' || Number(stock) < 0) {
      setError('Stock count must be 0 or greater.');
      return;
    }
    if (images.length === 0) {
      setError('Please add at least one product image URL.');
      return;
    }

    const resolvedCategory = category === 'Custom' ? customCategory.trim() || 'Apparel' : category;

    const payload: ProductFormData = {
      name: name.trim(),
      description: description.trim() || 'Mindfully crafted contemporary garment from VELOURA.',
      category: resolvedCategory,
      department,
      gender,
      brand: brand.trim() || 'VELOURA',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discount: discount ? Number(discount) : 0,
      stock: Number(stock),
      sizes,
      colors,
      images,
      material: material.trim(),
      fit: fit.trim(),
      isNew,
      isFeatured,
      isBestSeller,
      isActive,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product in MongoDB.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-50 dark:bg-[#121212] text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-white/10 rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-white/10 flex items-center justify-between bg-stone-100/60 dark:bg-zinc-900/60">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-light uppercase tracking-wider text-stone-950 dark:text-white">
              {isEditing ? 'Edit Product Catalog Item' : 'Add New Product to MongoDB'}
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {isEditing ? `Updating product ID: ${initialProduct?.id || initialProduct?._id}` : 'Store real garment and inventory records directly to MongoDB Atlas'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full hover:bg-stone-200 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Product Title / Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sculpted Double-Breasted Wool Blazer"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                {LUXURY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Custom">+ Custom Category</option>
              </select>
              {category === 'Custom' && (
                <input
                  type="text"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs"
                />
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e: any) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                <option value="clothing">Clothing</option>
                <option value="cosmetics">Cosmetics & Fragrance</option>
                <option value="shoes">Footwear / Shoes</option>
                <option value="accessories">Accessories & Leather Goods</option>
              </select>
            </div>

            {/* Gender Collection */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Gender Collection
              </label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                <option value="unisex">Unisex / Genderless</option>
                <option value="men">Men's Atelier</option>
                <option value="women">Women's Atelier</option>
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Brand / Maison
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="VELOURA"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white"
              />
            </div>
          </div>

          {/* Pricing & Inventory Grid */}
          <div className="bg-stone-100/50 dark:bg-zinc-900/40 p-4 rounded-lg border border-stone-200 dark:border-white/5 space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-stone-800 dark:text-stone-200">
              Pricing & Stock Inventory
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Selling Price */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Price (₹ INR) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs font-mono font-medium"
                />
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Original (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 6000"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs font-mono"
                />
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs font-mono"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Stock Units *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs font-mono font-medium"
                />
              </div>
            </div>
          </div>

          {/* Description & Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Description & Craftsmanship Details
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the silhouette, drape, fabric composition, and styling potential..."
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Fabric / Material
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. 100% Grade-A Mongolian Cashmere"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Fit & Silhouette
              </label>
              <input
                type="text"
                value={fit}
                onChange={(e) => setFit(e.target.value)}
                placeholder="e.g. Boxy Architectural Drop-Shoulder"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs"
              />
            </div>
          </div>

          {/* Sizes Selection */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Available Sizes ({sizes.length} selected)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_SIZES.map((size) => {
                const isSelected = sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 text-xs font-mono rounded border transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 border-stone-900 dark:border-white font-bold'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-white/10 hover:border-stone-500'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 max-w-xs">
              <input
                type="text"
                placeholder="Custom size (e.g. 36R, 46)"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-3 py-1 bg-stone-200 dark:bg-zinc-800 hover:bg-stone-300 text-xs rounded uppercase tracking-wider"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Colors Selection */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Color Palette ({colors.length} active)
            </label>
            {/* Active Colors */}
            <div className="flex flex-wrap gap-2 mb-3">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1 bg-stone-200/70 dark:bg-zinc-800 border border-stone-300 dark:border-white/10 rounded text-xs"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(idx)}
                    className="p-1 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Color Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRESET_COLORS.map((pc) => (
                <button
                  key={pc.name}
                  type="button"
                  onClick={() => addColor(pc)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/5 rounded text-[11px] hover:border-stone-400 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: pc.hex }} />
                  <span>+ {pc.name}</span>
                </button>
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-8 h-8 p-0 border border-stone-300 dark:border-white/10 rounded cursor-pointer"
              />
              <input
                type="text"
                placeholder="Color Name (e.g. Terracotta)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded"
              />
              <button
                type="button"
                onClick={addCustomColor}
                className="px-3 py-1.5 bg-stone-200 dark:bg-zinc-800 hover:bg-stone-300 text-xs rounded uppercase tracking-wider font-medium"
              >
                Add Color
              </button>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300">
                Product Photography / Image URLs * ({images.length})
              </label>
              <div className="flex gap-1.5">
                {SAMPLE_IMAGE_PRESETS.slice(0, 3).map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addImage(imgUrl)}
                    className="text-[10px] text-stone-500 hover:text-stone-900 dark:hover:text-white underline"
                  >
                    + Sample {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-md border border-stone-300 dark:border-white/10 overflow-hidden bg-stone-100 dark:bg-zinc-800 aspect-[3/4]"
                >
                  <img
                    src={imgUrl}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-amber-400 text-stone-950 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Image Input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="Paste direct HTTPS image URL (e.g. Unsplash, CDN)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addImage(newImageUrl)}
                  disabled={!newImageUrl.trim()}
                  className="px-4 py-2 bg-stone-900 text-white dark:bg-white dark:text-stone-950 hover:opacity-90 disabled:opacity-40 rounded text-xs uppercase tracking-wider font-semibold whitespace-nowrap cursor-pointer"
                >
                  + Add URL
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="px-4 py-2 bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 hover:bg-stone-300 dark:hover:bg-zinc-700 rounded text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Visibility & Badges */}
          <div className="pt-4 border-t border-stone-200 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-stone-900 rounded border-stone-300 focus:ring-0"
              />
              <span className="font-medium">Active in Store</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-stone-900 rounded border-stone-300 focus:ring-0"
              />
              <span className="font-medium">Featured Showcase</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 text-stone-900 rounded border-stone-300 focus:ring-0"
              />
              <span className="font-medium">New Arrival Tag</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 text-stone-900 rounded border-stone-300 focus:ring-0"
              />
              <span className="font-medium">Best Seller Tag</span>
            </label>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-6 border-t border-stone-200 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-medium border border-stone-300 dark:border-white/10 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-stone-900 text-white dark:bg-white dark:text-stone-950 hover:opacity-90 rounded text-xs uppercase tracking-[0.2em] font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? 'Saving to MongoDB...' : isEditing ? 'Update in MongoDB' : 'Create & Save in MongoDB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
