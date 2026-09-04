import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { useAuthentication } from '../hooks/useAuthentication';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { EmptyState } from '../components/common/EmptyState';
import { Product } from '../types';

export const OrdersPage: React.FC = () => {
  const { user, isAuthenticated, orders: authOrders } = useAuthentication();
  const { addToCart } = useCart();
  const [filterStatus, setFilterStatus] = useState<'all' | 'Processing' | 'Shipped' | 'Delivered'>('all');

  const orders = authOrders || user?.orders || [];

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const handleReorder = (order: (typeof orders)[0]) => {
    (order.items || []).forEach((item) => {
      const productObj: Product = {
        id: item.productId,
        name: item.productName,
        price: item.price,
        originalPrice: item.price,
        category: 'Coats & Trench' as any,
        gender: 'unisex' as any,
        images: [item.image],
        description: '',
        details: [],
        material: '',
        fit: '',
        careInstructions: [],
        sizes: [item.size],
        colors: [item.color],
        rating: 5,
        reviewCount: 1,
        isNew: false,
        isFeatured: false,
        stock: 10,
      };
      addToCart(productObj, item.size, item.color, item.quantity);
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
        <h2 className="font-serif-luxury text-3xl text-stone-900 dark:text-white">Order Tracking</h2>
        <p className="text-sm text-stone-500">Sign in to track live shipping milestones and review your archived receipts.</p>
        <Link
          to="/login"
          className="inline-block py-3 px-8 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-widest font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-6 border-b border-stone-200 dark:border-white/10 mb-8 gap-4">
        <div>
          <Link
            to="/account"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-950 dark:text-white font-light">
            Acquisition History ({orders.length})
          </h1>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2">
          {(['all', 'Processing', 'Shipped', 'Delivered'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`py-1.5 px-3.5 text-[10px] uppercase tracking-[0.2em] font-medium rounded-full transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-stone-950 text-white dark:bg-white dark:text-black font-semibold'
                  : 'bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-950 dark:bg-zinc-900 dark:border-white/10 dark:text-stone-400 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No Orders Found"
          description="You haven't placed any orders matching this status filter."
          actionText="Discover The Archive"
          actionHref="/shop"
        />
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs overflow-hidden shadow-xl"
            >
              {/* Order Header */}
              <div className="p-6 bg-stone-100 dark:bg-zinc-900/80 border-b border-stone-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-stone-500 dark:text-stone-400 uppercase tracking-[0.2em] block text-[9px]">Order Placed</span>
                    <span className="font-medium text-stone-950 dark:text-white">{formatDate(order.date || order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-stone-400 uppercase tracking-[0.2em] block text-[9px]">Total Investment</span>
                    <span className="font-medium text-stone-950 dark:text-white">{formatCurrency(order.total)}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-stone-400 uppercase tracking-[0.2em] block text-[9px]">Fulfillment Status</span>
                    <span
                      className={`inline-block font-semibold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full border ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-stone-500 dark:text-stone-400 block text-[9px] uppercase tracking-[0.2em]">Order Reference</span>
                  <span className="font-mono text-stone-950 dark:text-white font-medium">{order.id}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-stone-200 dark:divide-white/10">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="py-4 flex gap-4 items-center">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'}
                      alt={item.productName}
                      className="w-16 h-20 object-cover rounded-xs bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.productId}`}
                      className="text-sm font-normal text-stone-950 dark:text-white hover:underline truncate block"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-light">
                        Size: {item.size} • Color: {item.color.name} • Qty: {item.quantity}
                      </p>
                      <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mt-1">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>

                    <Link
                      to={`/product/${item.productId}`}
                      className="text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                      <span>View Piece</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Order Footer & Actions */}
              <div className="p-6 bg-stone-50 dark:bg-zinc-900/40 border-t border-stone-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                  <Truck className="w-4 h-4" />
                  <span>
              Tracking: <strong className="font-mono text-stone-950 dark:text-white">{order.trackingNumber}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/track-order/${order.id || order.trackingNumber || ''}`}
                    className="py-2.5 px-4 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Shipment</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleReorder(order)}
                    className="py-2.5 px-4 border border-stone-300 dark:border-white/15 text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white text-[10px] uppercase tracking-[0.2em] font-semibold rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </button>
                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="py-2.5 px-4 border border-stone-300 dark:border-white/15 text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white text-[10px] uppercase tracking-[0.2em] rounded-xs transition-colors"
                  >
                    Receipt
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
