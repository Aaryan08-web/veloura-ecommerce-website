import React from 'react';
import { Link, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Database,
  Moon,
  Sun,
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const AdminLayout: React.FC = () => {
  const { admin, isAuthenticated, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If not authenticated, redirect to login via declarative Navigate
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders & Payments', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/users', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/overview';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#0C0C0C] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand / Logo */}
            <div className="flex items-center gap-4">
              <Link to="/admin" className="flex items-center gap-2.5">
                <span className="font-serif text-lg sm:text-xl font-light tracking-[0.25em] text-white uppercase">
                  VELOURA
                </span>
                <span className="px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] font-bold bg-amber-500 text-stone-950 rounded">
                  Admin
                </span>
              </Link>

              {/* Database Telemetry Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-[10px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>MongoDB Atlas: veloura</span>
              </div>
            </div>

            {/* Right Action Icons & Profile */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Back to Client Storefront */}
              <Link
                to="/home"
                className="hidden md:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-stone-400 hover:text-white transition-colors"
                title="View customer storefront"
              >
                <span>Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Admin Profile Chip */}
              <div className="flex items-center gap-2 pl-3 border-l border-stone-800">
                <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                  {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-white truncate max-w-[140px]">
                    {admin?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-stone-400 font-mono truncate max-w-[140px]">
                    {admin?.email || 'admin@veloura.com'}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-stone-400 hover:text-red-400 hover:bg-stone-800/80 rounded-md transition-colors"
                title="Sign out of Admin Dashboard"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="bg-white dark:bg-[#141414] border-b border-stone-200 dark:border-white/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] rounded-xs transition-all whitespace-nowrap ${
                    active
                      ? 'bg-stone-950 text-white dark:bg-white dark:text-stone-950 shadow-xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 font-medium hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'opacity-100' : 'opacity-70'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer className="bg-white dark:bg-[#101010] border-t border-stone-200 dark:border-white/10 py-4 text-center text-[11px] text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VELOURA Maison Atelier — Admin Control Hub</span>
          <span className="font-mono text-[10px]">Connected to MongoDB Atlas | Secure Node/Express Cluster</span>
        </div>
      </footer>
    </div>
  );
};
