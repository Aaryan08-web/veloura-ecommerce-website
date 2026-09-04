import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to /admin
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter both admin email and password.');
      return;
    }

    const result = await login(trimmedEmail, password);
    if (!result.success) {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
    } else {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 transition-colors duration-200 bg-[var(--color-bg-primary)]">
      {/* Left editorial campaign column (desktop) */}
      <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-black text-white border-r border-stone-200 dark:border-white/10">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
          alt="VELOURA Atelier Management"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Link to="/home" className="inline-block">
              <span className="font-serif text-3xl tracking-[0.25em] font-light text-white uppercase">
                VELOURA
              </span>
              <span className="block text-[9px] tracking-[0.35em] text-stone-300 uppercase font-light">
                Wear Your Aura
              </span>
            </Link>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xs mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white">
                Admin Management Portal
              </span>
            </div>
            <blockquote className="font-serif text-2xl italic font-light text-white mb-4 leading-snug">
              “Precision in inventory, elegance in delivery, excellence across every touchpoint.”
            </blockquote>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-300 font-medium">
              — Veloura Executive Operations
            </p>
          </div>
        </div>
      </div>

      {/* Right form column */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex items-center justify-between">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Storefront
          </Link>
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md mx-auto my-12 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-500 dark:text-stone-400 block">
              Administrative Authentication
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-950 dark:text-white font-light">
              Sign In to Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-light leading-relaxed">
              Access real-time inventory controls, order tracking pipelines, and customer management.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xs text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[10px] uppercase tracking-[0.2em] text-stone-700 dark:text-stone-400 mb-1.5 font-medium"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@veloura.luxury"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="text-[10px] uppercase tracking-[0.2em] text-stone-700 dark:text-stone-400 font-medium"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-10 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold rounded-xs shadow-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 mt-6"
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-stone-200 dark:border-white/10 text-xs text-stone-500 dark:text-stone-400 font-light">
            <span>Client account? </span>
            <Link
              to="/login"
              className="text-stone-950 dark:text-white font-medium underline hover:opacity-80"
            >
              Go to Client Sign In
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-stone-400 dark:text-stone-600 font-light">
          © {new Date().getFullYear()} VELOURA Haute Couture. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

