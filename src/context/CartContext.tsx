import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductColor } from '../types';

interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
}

interface CartContextType {
  cart: CartItem[];
  items: CartItem[];
  addToCart: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => Promise<void>;
  coupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => Promise<void>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
  lastAddedItem: CartItem | null;
  clearLastAddedItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ cart: { items: any[] } }>('/api/cart');
      setCart(data.cart.items || []);
    } catch (err) {
      // Backend failed - cart remains empty; caller should handle offline state
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = fetchCart;

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product: Product, size: string, color: ProductColor, quantity = 1) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ cart: { items: any[] } }>('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, size, color, quantity }),
      });
      setCart(data.cart.items || []);
    } catch (err) {
      // TODO: surface error to user
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ cart: { items: any[] } }>(`/api/cart/item/${itemId}`, {
        method: 'DELETE',
      });
      setCart(data.cart.items || []);
    } catch (err) {
      // TODO: surface error to user
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ cart: { items: any[] } }>('/api/cart/item/' + itemId, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      setCart(data.cart.items || []);
    } catch (err) {
      // TODO: surface error to user
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      await apiRequest<{ cart: { items: any[] } }>('/api/cart', { method: 'DELETE' });
      setCart([]);
      setCoupon(null);
    } catch (err) {
      // TODO: surface error to user
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = async (code: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ cart: any; discountPercent: number }>('/api/cart/coupon', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setCoupon({
        code: data.cart.couponCode || code.trim().toUpperCase(),
        discountPercent: data.discountPercent || 0,
        description: '',
      });
      return { success: true, message: `Promo code applied!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Invalid promo code.' };
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = async () => {
    setIsLoading(true);
    try {
      await apiRequest<{ cart: any }>('/api/cart/coupon', {
        method: 'DELETE',
      });
      setCoupon(null);
    } catch (err) {
      // TODO: surface error to user
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Free shipping on orders over ₹1,500 or empty cart
  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 150;

  const discount = coupon ? Math.round((subtotal * coupon.discountPercent) / 100) : 0;

  const total = Math.max(0, subtotal - discount + shipping);

  const activeCart = cart.length > 0 ? cart : [];

  return (
    <CartContext.Provider
      value={{
        cart: activeCart,
        items: activeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        shipping,
        discount,
        total,
        itemCount,
        lastAddedItem,
        clearLastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};