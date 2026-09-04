import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Search, Heart, ShoppingBag, User, ChevronRight, ChevronDown, Package } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ThemeToggle } from '../common/ThemeToggle';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuthentication();
  const [collectionsExpanded, setCollectionsExpanded] = useState(true);

  if (!isOpen) return null;

  const handleLinkClick = (href: string) => {
    onClose();
    navigate(href);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative z-10 w-[85%] max-w-sm bg-white dark:bg-[#0A0A0A] h-full flex flex-col shadow-2xl border-r border-stone-200 dark:border-white/10 text-stone-900 dark:text-white animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-white/10">
          <div>
            <span className="font-serif text-xl tracking-[0.25em] font-light text-stone-950 dark:text-white uppercase">
              VELOURA
            </span>
            <span className="block text-[8px] tracking-[0.3em] text-stone-500 dark:text-stone-400 uppercase -mt-0.5 opacity-60">
              Wear Your Aura
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar in Mobile Nav */}
        <div className="p-4 border-b border-stone-200 dark:border-white/10">
          <button
            onClick={() => handleLinkClick('/search')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xs bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400 text-xs text-left hover:border-stone-400"
          >
            <Search className="w-4 h-4 opacity-60" />
            <span>Search dresses, jackets, denim...</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          <button
            onClick={() => handleLinkClick('/home')}
            className="w-full text-left py-3 px-3 text-[10px] tracking-[0.2em] font-medium uppercase text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 rounded-xs flex items-center justify-between"
          >
            <span>HOME</span>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </button>

          {/* Collections Accordion */}
          <div>
            <button
              onClick={() => setCollectionsExpanded(!collectionsExpanded)}
              className="w-full text-left py-3 px-3 text-[10px] tracking-[0.2em] font-medium uppercase text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 rounded-xs flex items-center justify-between"
            >
              <span>COLLECTION</span>
              {collectionsExpanded ? (
                <ChevronDown className="w-4 h-4 opacity-70" />
              ) : (
                <ChevronRight className="w-4 h-4 opacity-40" />
              )}
            </button>

            {collectionsExpanded && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l border-stone-200 dark:border-white/10 ml-3 my-1">
                <button
                  onClick={() => handleLinkClick('/collections')}
                  className="w-full text-left py-2 px-3 text-[10px] tracking-[0.2em] uppercase text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white"
                >
                  All Collections
                </button>
                <button
                  onClick={() => handleLinkClick('/collections/men')}
                  className="w-full text-left py-2 px-3 text-[10px] tracking-[0.2em] uppercase text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white"
                >
                  Men's Atelier
                </button>
                <button
                  onClick={() => handleLinkClick('/collections/women')}
                  className="w-full text-left py-2 px-3 text-[10px] tracking-[0.2em] uppercase text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white"
                >
                  Women's Atelier
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleLinkClick('/shop')}
            className="w-full text-left py-3 px-3 text-[10px] tracking-[0.2em] font-medium uppercase text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 rounded-xs flex items-center justify-between"
          >
            <span>SHOP</span>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </button>

          <button
            onClick={() => handleLinkClick('/new-arrivals')}
            className="w-full text-left py-3 px-3 text-[10px] tracking-[0.2em] font-medium uppercase text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/5 rounded-xs flex items-center justify-between"
          >
            <span>NEW ARRIVALS</span>
            <span className="text-[9px] font-semibold tracking-widest text-white bg-stone-950 dark:text-black dark:bg-white px-1.5 py-0.5 rounded-full uppercase">
              NEW
            </span>
          </button>

          <div className="pt-4 mt-4 border-t border-stone-200 dark:border-white/10 space-y-1">
            <button
              onClick={() => handleLinkClick('/wishlist')}
              className="w-full text-left py-2.5 px-3 text-[10px] tracking-[0.2em] uppercase text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 rounded-xs flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <Heart className="w-4 h-4 opacity-70" />
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="text-[9px] font-semibold px-2 py-0.5 bg-stone-900 text-white dark:bg-white dark:text-black rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleLinkClick('/cart')}
              className="w-full text-left py-2.5 px-3 text-[10px] tracking-[0.2em] uppercase text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 rounded-xs flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 opacity-70" />
                Shopping Bag
              </span>
              {cartCount > 0 && (
                <span className="text-[9px] font-semibold px-2 py-0.5 bg-stone-900 text-white dark:bg-white dark:text-black rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleLinkClick(isAuthenticated ? '/account' : '/login')}
              className="w-full text-left py-2.5 px-3 text-[10px] tracking-[0.2em] uppercase text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 rounded-xs flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <User className="w-4 h-4 opacity-70" />
                {isAuthenticated ? `Account (${user?.name ? user.name.split(' ')[0] : 'User'})` : 'Sign In / Register'}
              </span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => handleLinkClick('/account/orders')}
                className="w-full text-left py-2.5 px-3 text-[10px] tracking-[0.2em] uppercase text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 rounded-xs flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <Package className="w-4 h-4 opacity-70" />
                  Order History
                </span>
              </button>
            )}

            <button
              onClick={() => handleLinkClick('/admin')}
              className="w-full text-left py-2.5 px-3 text-[10px] tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xs flex items-center justify-between font-semibold"
            >
              <span>Admin Dashboard</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </div>

        {/* Drawer Footer with Theme Toggle */}
        <div className="p-4 border-t border-stone-200 dark:border-white/10 bg-stone-100 dark:bg-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-600 dark:text-stone-400 font-medium uppercase tracking-[0.2em]">
              Theme
            </span>
            <ThemeToggle showLabel />
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-[10px] text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white uppercase tracking-[0.2em] underline"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-900 dark:text-white hover:opacity-80"
            >
              Sign In →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
