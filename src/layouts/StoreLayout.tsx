import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MainNavbar } from '../components/layout/MainNavbar';
import { SiteFooter } from '../components/layout/SiteFooter';

export const StoreLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 selection:bg-stone-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      <MainNavbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
};
