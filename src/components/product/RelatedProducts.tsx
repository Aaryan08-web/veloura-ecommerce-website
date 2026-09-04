import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { apiClient } from '../../services/apiClient';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
  currentProduct: Product;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProduct }) => {
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchRelated = async () => {
      try {
        const products = await apiClient.getProducts();
        if (!isMounted) return;
        const currentId = String(currentProduct.id || (currentProduct as any)._id || '');
        const filtered = products
          .filter((p) => {
            const pId = String(p.id || (p as any)._id || '');
            if (pId === currentId) return false;
            return p.category === currentProduct.category || p.gender === currentProduct.gender;
          })
          .slice(0, 4);
        setRelated(filtered);
      } catch (err) {
        console.error('Failed to load related products:', err);
      }
    };

    if (currentProduct) {
      fetchRelated();
    }
    return () => {
      isMounted = false;
    };
  }, [currentProduct]);

  if (related.length === 0) return null;

  return (
    <section className="pt-16 mt-16 border-t border-stone-200 dark:border-white/10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
            Curated Ensemble
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-950 dark:text-white font-light">
            Complete The Look
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
