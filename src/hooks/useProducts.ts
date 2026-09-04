import { useEffect, useMemo, useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { FilterState, Product, SortOption } from '../types';

export const initialFilterState: FilterState = {
  gender: 'all',
  categories: [],
  sizes: [],
  colors: [],
  priceRange: [0, 2000],
  minRating: 0,
  inStockOnly: false,
  isNewOnly: false,
};

export const useProducts = (initialFilters?: Partial<FilterState>, initialSort: SortOption = 'featured') => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    ...initialFilterState,
    ...initialFilters,
  });
  const [sortOption, setSortOption] = useState<SortOption>(initialSort);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getProducts();
      setProducts(data || []);
    } catch (err: any) {
      console.error('Failed to load products from API:', err);
      setError(err?.message || 'Failed to retrieve products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Gender filter
      if (filters.gender !== 'all') {
        if (product.gender !== filters.gender && product.gender !== 'unisex') {
          return false;
        }
      }

      // Categories filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(product.category)) {
          return false;
        }
      }

      // Sizes filter
      if (filters.sizes && filters.sizes.length > 0) {
        const hasMatchingSize = (product.sizes || []).some((s) => filters.sizes.includes(s));
        if (!hasMatchingSize) return false;
      }

      // Colors filter
      if (filters.colors && filters.colors.length > 0) {
        const hasMatchingColor = (product.colors || []).some((c) =>
          filters.colors.some((fc) => c.name.toLowerCase().includes(fc.toLowerCase()))
        );
        if (!hasMatchingColor) return false;
      }

      // Price range
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Rating
      if (filters.minRating > 0 && product.rating < filters.minRating) {
        return false;
      }

      // In stock
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      // Is new only
      if (filters.isNewOnly && !product.isNew) {
        return false;
      }

      // Search query (if provided within hook)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          (product.category && product.category.toLowerCase().includes(q)) ||
          (product.gender && product.gender.toLowerCase().includes(q)) ||
          (product.brand && (product as any).brand.toLowerCase().includes(q)) ||
          (product.colors || []).some((c) => c.name.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [products, filters, searchQuery]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortOption) {
      case 'newest':
        return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'popular':
        return list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating-desc':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'featured':
      default:
        return list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
  }, [filteredProducts, sortOption]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilterState);
  };

  return {
    allProducts: products,
    products: sortedProducts,
    totalCount: sortedProducts.length,
    loading,
    error,
    refetch: fetchProducts,
    filters,
    sortOption,
    searchQuery,
    setSearchQuery,
    updateFilter,
    setFilters,
    resetFilters,
    setSortOption,
  };
};
