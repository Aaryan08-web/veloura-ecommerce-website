import { apiRequest } from './httpClient';

export const wishlistClient = {
  async getWishlist() {
    const data = await apiRequest<{ wishlist: { products: any[] } }>('/wishlist');
    return data.wishlist;
  },
  async toggle(productId: string) {
    const data = await apiRequest<{ wishlist: { products: any[] } }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    return data.wishlist;
  },
  async clear() {
    const data = await apiRequest<{ wishlist: { products: any[] } }>('/wishlist', { method: 'DELETE' });
    return data.wishlist;
  },
};
