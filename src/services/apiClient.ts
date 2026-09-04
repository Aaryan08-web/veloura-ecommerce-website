import { apiRequest } from './httpClient';
import { Category, Gender, Product } from '../types';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

/**
 * Filter helper for fallback products
 */
function filterFallbackProducts(params: Record<string, string | number | boolean | undefined>): Product[] {
  let list = [...FALLBACK_PRODUCTS];

  if (params.gender && params.gender !== 'all') {
    list = list.filter((p) => p.gender === params.gender || p.gender === 'unisex');
  }
  if (params.category) {
    list = list.filter((p) => p.category.toLowerCase() === String(params.category).toLowerCase());
  }
  if (params.isFeatured) {
    list = list.filter((p) => p.isFeatured);
  }
  if (params.isNew) {
    list = list.filter((p) => p.isNew);
  }
  if (params.isBestSeller) {
    list = list.filter((p) => p.isBestSeller);
  }
  if (params.search) {
    const q = String(params.search).toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Real API client — communicates with the Veloura Express & MongoDB backend,
 * with resilient offline fallback to ensure continuous UX.
 */
export const apiClient = {
  async getProducts(params: Record<string, string | number | boolean | undefined> = {}): Promise<Product[]> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
    const qs = query.toString();
    try {
      const data = await apiRequest<{ products: Product[] }>(`/products${qs ? `?${qs}` : ''}`, { skipAuth: true });
      if (data?.products && data.products.length > 0) {
        return data.products;
      }
      return filterFallbackProducts(params);
    } catch (err) {
      console.warn('[apiClient] Backend products unavailable, serving curated collection:', (err as any)?.message);
      return filterFallbackProducts(params);
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    const cleanId = String(id || '').trim();
    if (!cleanId) return null;

    try {
      const data = await apiRequest<{ product: Product }>(`/products/${encodeURIComponent(cleanId)}`, { skipAuth: true });
      if (data?.product) return data.product;
    } catch (err) {
      console.warn(`[apiClient] Backend fetch for product ${cleanId} failed, checking local catalog.`);
    }

    const localMatch = FALLBACK_PRODUCTS.find(
      (p) =>
        p.id.toLowerCase() === cleanId.toLowerCase() ||
        p.slug?.toLowerCase() === cleanId.toLowerCase() ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanId.toLowerCase()
    );
    return localMatch || null;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const data = await apiRequest<{ products: Product[] }>('/products/featured', { skipAuth: true });
      if (data?.products && data.products.length > 0) return data.products;
      return FALLBACK_PRODUCTS.filter((p) => p.isFeatured);
    } catch {
      return FALLBACK_PRODUCTS.filter((p) => p.isFeatured);
    }
  },

  async getNewArrivals(): Promise<Product[]> {
    try {
      const data = await apiRequest<{ products: Product[] }>('/products/new-arrivals', { skipAuth: true });
      if (data?.products && data.products.length > 0) return data.products;
      return FALLBACK_PRODUCTS.filter((p) => p.isNew);
    } catch {
      return FALLBACK_PRODUCTS.filter((p) => p.isNew);
    }
  },

  async getBestSellers(): Promise<Product[]> {
    try {
      const data = await apiRequest<{ products: Product[] }>('/products/best-sellers', { skipAuth: true });
      if (data?.products && data.products.length > 0) return data.products;
      return FALLBACK_PRODUCTS.filter((p) => p.isBestSeller);
    } catch {
      return FALLBACK_PRODUCTS.filter((p) => p.isBestSeller);
    }
  },

  async getProductsByGender(gender: Gender): Promise<Product[]> {
    return apiClient.getProducts({ gender });
  },

  async getProductsByCategory(category: Category, gender?: Gender): Promise<Product[]> {
    return apiClient.getProducts({ category, gender });
  },

  async searchProducts(query: string): Promise<Product[]> {
    if (!query.trim()) return [];
    return apiClient.getProducts({ search: query });
  },

  async getProductReviews(productId: string) {
    const product = await apiClient.getProductById(productId);
    return product?.reviews || [];
  },

  async getBrands(): Promise<string[]> {
    try {
      const data = await apiRequest<{ brands: string[] }>('/products/brands', { skipAuth: true });
      if (data?.brands && data.brands.length > 0) return data.brands;
    } catch {
      // Fallback
    }
    return ['Veloura', 'Veloura Atelier', 'Denimworks', 'Heritage & Co.', 'Nova Athletic', 'Lumière Beauty'];
  },

  async getCategories(): Promise<string[]> {
    try {
      const data = await apiRequest<{ categories: string[] }>('/products/categories', { skipAuth: true });
      if (data?.categories && data.categories.length > 0) return data.categories;
    } catch {
      // Fallback
    }
    return ['T-Shirts', 'Shirts', 'Jeans', 'Hoodies', 'Jackets', 'Trousers', 'Tops', 'Dresses'];
  },
};
