/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthenticationProvider } from './context/AuthenticationContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ApplicationRoutes } from './routes/ApplicationRoutes';
import { ScrollToTop } from './components/common/ScrollToTop';
import { CartNotificationToast } from './components/common/CartNotificationToast';
import { ChatbotWidget } from './components/common/ChatbotWidget';

export default function App() {
  return (
    <ThemeProvider>
      <AuthenticationProvider>
        <AdminAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <BrowserRouter>
                <ScrollToTop />
                <CartNotificationToast />
                <ApplicationRoutes />
                <ChatbotWidget />
              </BrowserRouter>
            </CartProvider>
          </WishlistProvider>
        </AdminAuthProvider>
      </AuthenticationProvider>
    </ThemeProvider>
  );
}

