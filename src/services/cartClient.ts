import { apiRequest } from './httpClient';
import { Product, ProductColor } from '../types';

export const cartClient = {
  async getCart() {
    const data = await apiRequest<{ cart: { items: any[] } }>('/cart');
    return data.cart;
  },
  async addToCart(product: Product, size: string, color: ProductColor, quantity = 1) {
    const data = await apiRequest<{ cart: { items: any[] } }>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, size, color, quantity }),
    });
    return data.cart;
  },
  async updateItem(itemId: string, quantity: number) {
    const data = await apiRequest<{ cart: { items: any[] } }>(`/cart/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return data.cart;
  },
  async removeItem(itemId: string) {
    const data = await apiRequest<{ cart: { items: any[] } }>(`/cart/item/${itemId}`, { method: 'DELETE' });
    return data.cart;
  },
  async clear() {
    const data = await apiRequest<{ cart: { items: any[] } }>('/cart', { method: 'DELETE' });
    return data.cart;
  },
  async applyCoupon(code: string) {
    return apiRequest<{ cart: any; discountPercent: number }>('/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
};
