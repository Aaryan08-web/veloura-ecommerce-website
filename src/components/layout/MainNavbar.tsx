import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, ChevronDown } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ThemeToggle } from '../common/ThemeToggle';
import { MobileNavigation } from './MobileNavigation';
import { SearchAutocomplete } from '../search/SearchAutocomplete';

export const MainNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isAuthenticated, user } = useAuthentication();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCollectionsDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'HOME', href: '/home' },
    { 
      name: 'COLLECTION', 
      href: '/collections',
      hasDropdown: true,
      subLinks: [
        { name: 'All Collections', href: '/collections' },
        { name: "Men's Collection", href: '/collections/men' },
        { name: "Women's Collection", href: '/collections/women' },
      ]
    },
    { name: 'SHOP', href: '/shop' },
    { name: 'NEW ARRIVALS', href: '/new-arrivals' },
  ];

  const isActive = (href: string) => {
    if (href === '/home' && (location.pathname === '/home' || location.pathname === '/')) {
      return true;
    }
    return location.pathname.startsWith(href) && href !== '/home';
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-stone-50/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md shadow-md dark:shadow-2xl border-b border-stone-200 dark:border-white/10'
            : 'bg-stone-50 dark:bg-[#0A0A0A] border-b border-stone-200 dark:border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden space-x-2 mr-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/5 rounded-full transition-colors"
                aria-label="Open main menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Left: veloura-wear your aura then home , collection , shop , new arrivals */}
            <div className="flex items-center gap-6 xl:gap-9 min-w-0">
              {/* Brand: veloura - wear your aura */}
              <Link to="/home" className="inline-flex items-baseline gap-2 group focus:outline-none flex-shrink-0">
                <span className="font-serif text-xl sm:text-2xl tracking-[0.25em] font-light text-stone-950 dark:text-white uppercase transition-opacity group-hover:opacity-80">
                  VELOURA
                </span>
                <span className="text-[9px] tracking-[0.25em] text-stone-500 dark:text-stone-400 uppercase font-light opacity-70 hidden xs:inline whitespace-nowrap">
                  — Wear Your Aura
                </span>
              </Link>

              {/* Desktop Navigation Links: home , collection , shop , new arrivals */}
              <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-[10px] tracking-[0.2em] uppercase font-medium">
                {navLinks.map((link) => {
                  if (link.hasDropdown) {
                    return (
                      <div
                        key={link.name}
                        className="relative"
                        onMouseEnter={() => setCollectionsDropdownOpen(true)}
                        onMouseLeave={() => setCollectionsDropdownOpen(false)}
                      >
                        <Link
                          to={link.href}
                          className={`inline-flex items-center gap-1.5 py-2 transition-opacity ${
                            isActive(link.href)
                              ? 'text-stone-950 dark:text-white opacity-100 font-semibold'
                              : 'text-stone-600 dark:text-stone-300 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {link.name}
                          <ChevronDown className="w-3 h-3 transition-transform duration-200 opacity-50" />
                        </Link>

                        {/* Dropdown Flyout */}
                        {collectionsDropdownOpen && (
                          <div className="absolute top-full left-0 w-56 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 shadow-2xl rounded-xs py-2 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md z-50">
                            {link.subLinks?.map((sub) => (
                              <Link
                                key={sub.name}
                                to={sub.href}
                                className="block px-4 py-2.5 text-[10px] tracking-[0.2em] uppercase text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-stone-950 dark:hover:text-white transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`py-2 transition-opacity ${
                        isActive(link.href)
                          ? 'text-stone-950 dark:text-white opacity-100 font-semibold border-b border-stone-950 dark:border-white'
                          : 'text-stone-600 dark:text-stone-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: then the rest (search, wishlist, account, cart, theme) */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Search */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/5 rounded-full transition-colors flex items-center gap-2 cursor-pointer"
                aria-label="Search catalogue"
              >
                <Search className="w-5 h-5 lg:w-4 lg:h-4 opacity-70" />
                <span className="hidden lg:inline text-[10px] uppercase tracking-[0.2em] opacity-60 font-medium">Search</span>
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/5 rounded-full transition-colors"
                aria-label="View Wishlist"
              >
                <Heart className="w-5 h-5 opacity-70 hover:opacity-100" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-stone-900 dark:text-black dark:bg-white rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="p-1.5 text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white transition-colors flex items-center gap-2"
                aria-label="My Account"
                title={isAuthenticated ? `Account: ${user?.name || 'User'}` : 'Login / Register'}
              >
                {isAuthenticated && user?.name ? (
                  <div className="w-8 h-8 rounded-full border border-stone-300 dark:border-white/20 bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-white flex items-center justify-center text-[10px] font-medium hover:border-stone-500 dark:hover:border-white/40 transition-colors">
                    {(user.name || 'JD').split(' ').filter(Boolean).map(n => n[0] || '').join('').slice(0, 2).toUpperCase() || 'JD'}
                  </div>
                ) : (
                  <div className="p-1 hover:bg-stone-200/50 dark:hover:bg-white/5 rounded-full">
                    <User className="w-5 h-5 opacity-70 hover:opacity-100" />
                  </div>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/5 rounded-full transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 opacity-70 hover:opacity-100" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-stone-900 dark:text-black dark:bg-white rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Admin Portal Link */}
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/20 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 border border-amber-500/30 rounded transition-colors"
                title="Admin Dashboard & Product Management"
              >
                <span>Admin</span>
              </Link>

              {/* Theme Toggle */}
              <div className="pl-1 border-l border-stone-200 dark:border-white/10">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Global Search Autocomplete Modal */}
      <SearchAutocomplete
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};
