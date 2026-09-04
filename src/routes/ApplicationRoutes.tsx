import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreLayout } from '../layouts/StoreLayout';
import { AuthenticationLayout } from '../layouts/AuthenticationLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Store Pages
import { LandingPage } from '../pages/LandingPage';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { CollectionsPage } from '../pages/CollectionsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';
import { AccountPage } from '../pages/AccountPage';
import { OrdersPage } from '../pages/OrdersPage';
import { SearchPage } from '../pages/SearchPage';
import { NewArrivalsPage } from '../pages/NewArrivalsPage';
import { AtelierPage } from '../pages/AtelierPage';
import { OrderTrackingPage } from '../pages/OrderTrackingPage';

// Auth Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

// Admin Pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';

export const ApplicationRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Storefront Layout Routes */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/new-arrivals" element={<NewArrivalsPage />} />
        <Route path="/atelier" element={<AtelierPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:gender" element={<CollectionsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:productId" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/track-order" element={<OrderTrackingPage />} />
        <Route path="/track-order/:orderId" element={<OrderTrackingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/orders" element={<OrdersPage />} />
      </Route>

      {/* Authentication Layout Routes */}
      <Route element={<AuthenticationLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Management Portal */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="overview" element={<AdminOverviewPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

