import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, WishlistItem } from '../types';

interface WishlistContextType {
  wishlist: WishlistItem[];
  items: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ wishlist: { products: any[] } }>('/api/wishlist');
      setWishlist(data.wishlist.products || []);
      setItems((data.wishlist.products || []).map((p: any) => ({
        ...p,
        id: p.id || p._id,
      })));
    } catch (err) {
      setWishlist([]);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = async (product: Product) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ wishlist: { products: any[] } }>('/api/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      });
      setWishlist(data.wishlist.products || []);
      setItems((data.wishlist.products || []).map((p: any) => ({
        ...p,
        id: p.id || p._id,
      })));
    } catch (err) {
      // TODO: surface error to user
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = async (productId: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ wishlist: { products: any[] } }>('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      const productList = data.wishlist.products || [];
      setWishlist(productList);
      setItems(productList.map((p: any) => ({
        ...p,
        id: p.id || p._id,
      })));
      return true;
    } catch (err) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ wishlist: { products: any[] } }>('/api/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      setWishlist(data.wishlist.products || []);
      setItems((data.wishlist.products || []).map((p: any) => ({
        ...p,
        id: p.id || p._id,
      })));
    } catch (err) {
      // TODO: surface error to user
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    setIsLoading(true);
    try {
      await apiRequest<{ wishlist: { products: any[] } }>('/api/wishlist', { method: 'DELETE' });
      setWishlist([]);
      setItems([]);
    } catch (err) {
      // TODO: surface error to user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const activeItems = items.length > 0 ? items : [];

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        items: activeItems,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        itemCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};