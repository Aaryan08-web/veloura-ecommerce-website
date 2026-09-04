import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-stone-100 dark:bg-[#0A0A0A] text-stone-900 dark:text-[#F5F5F5] border-t border-stone-200 dark:border-white/10 transition-colors">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link to="/home" className="inline-block mb-4">
              <span className="font-serif text-2xl tracking-[0.3em] font-light text-stone-950 dark:text-white uppercase">
                VELOURA
              </span>
              <span className="block text-[8px] tracking-[0.35em] text-stone-500 dark:text-stone-400 uppercase font-light opacity-60">
                Wear Your Aura
              </span>
            </Link>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-sm mb-6 font-light">
              Crafting architectural garments and mindful silhouettes designed for the contemporary nomad. Elevated fabrics, responsible sourcing, and uncompromising quality.
            </p>
            <div className="flex items-center gap-4 text-stone-400 dark:text-stone-500" aria-label="VELOURA social channels are currently private">
              <Instagram className="w-4 h-4" aria-hidden="true" />
              <Twitter className="w-4 h-4" aria-hidden="true" />
              <Facebook className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* Col 1: Shop */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-900 dark:text-stone-300 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5 text-[11px] text-stone-600 dark:text-stone-400">
              <li>
                <Link to="/collections/men" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Men's Atelier
                </Link>
              </li>
              <li>
                <Link to="/collections/women" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Women's Atelier
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=popular" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Client Service */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-900 dark:text-stone-300 mb-4">
              Client Service
            </h4>
            <ul className="space-y-2.5 text-[11px] text-stone-600 dark:text-stone-400">
              <li>
                <Link to="/track-order" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Client Account
                </Link>
              </li>
              <li>
                <Link to="/atelier#fit" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Size & Fit Guide
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium flex items-center gap-1">
                  <span>Admin Dashboard</span>
                  <span className="text-[8px] uppercase tracking-wider px-1 py-0.2 bg-stone-200 dark:bg-zinc-800 rounded">Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: The Atelier */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-900 dark:text-stone-300 mb-4">
              The Brand
            </h4>
            <ul className="space-y-2.5 text-[11px] text-stone-600 dark:text-stone-400">
              <li>
                <Link to="/atelier#manifesto" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Brand Manifesto
                </Link>
              </li>
              <li>
                <Link to="/atelier#fibers" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Sustainable Fibers
                </Link>
              </li>
              <li>
                <Link to="/atelier#mills" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Artisan Mills
                </Link>
              </li>
              <li>
                <Link to="/atelier#careers" className="hover:text-stone-950 dark:hover:text-white transition-colors">
                  Careers at VELOURA
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
