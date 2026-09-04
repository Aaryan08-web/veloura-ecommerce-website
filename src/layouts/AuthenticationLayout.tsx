import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { ArrowLeft } from 'lucide-react';

export const AuthenticationLayout: React.FC = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 transition-colors duration-200">
      {/* Left editorial campaign column (desktop) */}
      <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-black text-white border-r border-stone-200 dark:border-white/10">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80"
          alt="VELOURA Editorial Campaign"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
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
            <blockquote className="font-serif text-2xl italic font-light text-white mb-4 leading-snug">
              “Clothing is not mere covering; it is the physical aura you present to the world.”
            </blockquote>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-300 font-medium">
              — Atelier Veloura 2026 Collection
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
            <ArrowLeft className="w-4 h-4" /> Return to Store
          </Link>
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md mx-auto my-12">
          <Outlet />
        </div>

        <div className="text-center text-xs text-stone-400 dark:text-stone-600 font-light">
          © {new Date().getFullYear()} VELOURA Haute Couture. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};
