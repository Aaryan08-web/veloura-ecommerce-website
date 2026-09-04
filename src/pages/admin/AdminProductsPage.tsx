import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react';
import { adminClient, ProductFormData } from '../../services/adminClient';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { ProductFormModal } from './ProductFormModal';
import { BulkProductImportModal } from '../../components/admin/BulkProductImportModal';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete Confirmation State
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminClient.getProducts({
        search: searchQuery.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        gender: selectedGender !== 'all' ? selectedGender : undefined,
        limit: 250,
      });
      setProducts(result.products);
      setTotalCount(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products from MongoDB.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedGender]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleCreateOrUpdate = async (formData: ProductFormData) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        const prodId = editingProduct.id || (editingProduct as any)._id;
        await adminClient.updateProduct(prodId, formData);
        setSuccessMessage(`Product "${formData.name}" successfully updated in MongoDB.`);
      } else {
        await adminClient.createProduct(formData);
        setSuccessMessage(`Product "${formData.name}" successfully created and stored in MongoDB.`);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      await fetchProducts();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProductId) return;
    setIsDeleting(true);
    try {
      await adminClient.deleteProduct(deletingProductId);
      setSuccessMessage('Product was permanently deleted from MongoDB.');
      setDeletingProductId(null);
      await fetchProducts();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    const prodId = product.id || (product as any)._id;
    const currentActive = (product as any).isActive !== false;
    try {
      await adminClient.updateProduct(prodId, { isActive: !currentActive });
      setProducts((prev) =>
        prev.map((p) => {
          const id = p.id || (p as any)._id;
          if (id === prodId) {
            return { ...p, isActive: !currentActive } as any;
          }
          return p;
        })
      );
    } catch (err: any) {
      setError(err.message || 'Failed to toggle product status.');
    }
  };

  // Filter client-side for fine-grained stock filtering
  const filteredProducts = products.filter((p) => {
    if (stockFilter === 'inStock' && (p.stock || 0) <= 0) return false;
    if (stockFilter === 'lowStock' && ((p.stock || 0) > 10 || (p.stock || 0) <= 0)) return false;
    if (stockFilter === 'outOfStock' && (p.stock || 0) > 0) return false;
    return true;
  });

  // Extract all categories present
  const categoriesList = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-stone-950 dark:text-white uppercase">
              Product Inventory
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 rounded-full">
              {totalCount} Total in Atlas
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Add, update, adjust pricing & stock, and manage active products in your MongoDB Atlas database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.15em] font-medium bg-white dark:bg-zinc-800 border border-stone-300 dark:border-white/10 rounded-md hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-[0.15em] font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-900 dark:text-white border border-stone-300 dark:border-white/15 rounded-md transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Bulk CSV Import
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.15em] font-bold bg-stone-900 text-white dark:bg-white dark:text-stone-950 rounded-md hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-xs text-red-800 dark:text-red-300 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchProducts} className="underline uppercase tracking-wider font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search product, brand, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white"
            >
              <option value="all">All Categories ({products.length})</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e: any) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white"
            >
              <option value="all">All Inventory Levels</option>
              <option value="inStock">In Stock (&gt; 0)</option>
              <option value="lowStock">Low Stock (&le; 10 units)</option>
              <option value="outOfStock">Out of Stock (0 units)</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white"
            >
              <option value="all">All Genders</option>
              <option value="men">Men's Collection</option>
              <option value="women">Women's Collection</option>
              <option value="unisex">Unisex / Atelier</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg shadow-xs overflow-hidden">
        {isLoading && products.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-stone-400" />
            <p className="text-xs uppercase tracking-wider text-stone-500">Querying MongoDB database...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-2">
            <Package className="w-8 h-8 mx-auto opacity-40 mb-2" />
            <p className="font-semibold text-stone-700 dark:text-stone-300">No products matched the active filters.</p>
            <p>Try clearing your search query or adjusting the category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 dark:bg-zinc-900/60 border-b border-stone-200 dark:border-white/10 text-[10px] uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Discount</th>
                  <th className="py-3 px-3">Stock Units</th>
                  <th className="py-3 px-3">Sizes</th>
                  <th className="py-3 px-3">Colors</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-white/5">
                {filteredProducts.map((product) => {
                  const prodId = product.id || (product as any)._id || '';
                  const mainImage =
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=150&q=80';
                  const isActive = (product as any).isActive !== false;

                  return (
                    <tr
                      key={prodId}
                      className={`hover:bg-stone-50/70 dark:hover:bg-zinc-800/40 transition-colors ${
                        !isActive ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="w-11 h-14 object-cover rounded bg-stone-100 dark:bg-zinc-800 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-medium text-stone-950 dark:text-white truncate" title={product.name}>
                              {product.name}
                            </p>
                            <p className="text-[10px] text-stone-400 uppercase tracking-wider font-mono truncate">
                              ID: {prodId.slice(-6)} • {(product as any).brand || 'VELOURA'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-stone-100 dark:bg-zinc-800 rounded text-[11px]">
                          {product.category || 'Apparel'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 font-mono font-semibold text-stone-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(product.price)}
                      </td>

                      {/* Discount */}
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400 font-mono whitespace-nowrap">
                        {product.discount ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {product.discount}% OFF
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>

                      {/* Stock Units */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                            (product.stock || 0) <= 0
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : (product.stock || 0) <= 10
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {product.stock || 0} units
                        </span>
                      </td>

                      {/* Sizes */}
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400 font-mono text-[11px] whitespace-nowrap">
                        {product.sizes && product.sizes.length > 0 ? (
                          <div className="flex gap-1">
                            {product.sizes.slice(0, 3).map((s) => (
                              <span key={s} className="px-1 py-0.5 bg-stone-100 dark:bg-zinc-800 rounded text-[9px]">
                                {s}
                              </span>
                            ))}
                            {product.sizes.length > 3 && (
                              <span className="text-[10px] text-stone-400">+{product.sizes.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Colors */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {product.colors?.slice(0, 4).map((c, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-black/20"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                          {(product.colors?.length || 0) > 4 && (
                            <span className="text-[10px] text-stone-400 font-mono">
                              +{(product.colors?.length || 0) - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300'
                              : 'bg-stone-200 text-stone-600 dark:bg-zinc-800 dark:text-stone-400'
                          }`}
                          title="Click to toggle store visibility"
                        >
                          {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {isActive ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 rounded transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProductId(prodId)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialProduct={editingProduct}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl text-stone-900 dark:text-white">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold uppercase tracking-wider">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Are you sure you want to permanently delete this product from MongoDB Atlas? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-stone-300 dark:border-white/10 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs uppercase tracking-wider font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting from MongoDB...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk CSV Import Modal */}
      <BulkProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchProducts();
          setSuccessMessage('Products imported successfully via CSV into MongoDB catalogue.');
          setTimeout(() => setSuccessMessage(null), 5000);
        }}
      />
    </div>
  );
};
