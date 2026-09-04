import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Database,
  RefreshCw,
  CreditCard,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { adminClient } from '../../services/adminClient';
import { AdminDashboardData, Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { OrderDetailsModal } from './OrderDetailsModal';
import { SalesAnalyticsChart } from '../../components/admin/SalesAnalyticsChart';

export const AdminOverviewPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminClient.getDashboardStats();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateOrderStatus = async (
    orderId: string,
    payload: {
      status?: string;
      paymentStatus?: 'paid' | 'pending' | 'failed' | 'refunded';
      trackingNumber?: string;
      description?: string;
    }
  ) => {
    const updated = await adminClient.updateOrderStatus(orderId, payload);
    setSelectedOrder(updated);
    fetchStats();
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">
            Loading Real-Time Analytics from MongoDB Atlas...
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    userCount: 0,
    productCount: 0,
    orderCount: 0,
    revenue: 0,
    paidOrders: 0,
    pendingOrders: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-stone-950 dark:text-white uppercase">
            Executive Overview
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Real-time telemetry, store metrics, and inventory health powered by MongoDB Atlas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchStats}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-[0.15em] font-medium bg-white dark:bg-zinc-800 border border-stone-300 dark:border-white/10 rounded-md hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.15em] font-bold bg-stone-900 text-white dark:bg-white dark:text-stone-950 rounded-md hover:opacity-90 transition-opacity shadow-xs"
          >
            <Package className="w-3.5 h-3.5" />
            Manage Products
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchStats} className="underline uppercase tracking-wider font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 dark:text-stone-400">
              Total Revenue
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-2xl font-normal text-stone-950 dark:text-white font-mono">
              {formatCurrency(stats.revenue)}
            </h3>
            <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {stats.paidOrders ?? 0} settled transactions
              </span>
            </p>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 dark:text-stone-400">
              Customer Orders
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-md">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-2xl font-normal text-stone-950 dark:text-white font-mono">
              {stats.orderCount}
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">
              <Link to="/admin/orders" className="text-stone-900 dark:text-white underline hover:opacity-80">
                View all orders & payments &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Metric 3: Active Products */}
        <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 dark:text-stone-400">
              Catalog Items
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-md">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-2xl font-normal text-stone-950 dark:text-white font-mono">
              {stats.productCount}
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">
              <span>In MongoDB collection</span>
            </p>
          </div>
        </div>

        {/* Metric 4: Registered Users */}
        <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 dark:text-stone-400">
              Customer Accounts
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-md">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-2xl font-normal text-stone-950 dark:text-white font-mono">
              {stats.userCount}
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">
              <Link to="/admin/users" className="text-stone-900 dark:text-white underline hover:opacity-80">
                View accounts &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Sales Revenue & Orders Analytics Chart */}
      <SalesAnalyticsChart />

      {/* Main Split Grid: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Ledger (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-white/5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-stone-950 dark:text-white">
                Recent Orders & Payment Feed
              </h2>
              <p className="text-[11px] text-stone-500">
                Latest customer purchases with live payment statuses
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white font-medium flex items-center gap-1"
            >
              All Orders
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.15em] text-stone-400 border-b border-stone-100 dark:border-white/5">
                    <th className="pb-2.5 font-semibold">Order</th>
                    <th className="pb-2.5 font-semibold">Customer</th>
                    <th className="pb-2.5 font-semibold">Total</th>
                    <th className="pb-2.5 font-semibold">Payment Status</th>
                    <th className="pb-2.5 font-semibold">Fulfillment</th>
                    <th className="pb-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-white/5">
                  {data.recentOrders.map((order) => {
                    const orderId = order.id || order._id || '';
                    const customerName =
                      typeof order.user === 'object' && order.user?.name
                        ? order.user.name
                        : order.shippingAddress?.fullName || 'Guest';

                    return (
                      <tr key={orderId} className="hover:bg-stone-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 font-mono font-medium text-stone-900 dark:text-stone-200">
                          #{order.orderNumber || orderId.slice(-6)}
                        </td>
                        <td className="py-3 text-stone-700 dark:text-stone-300">
                          {customerName}
                        </td>
                        <td className="py-3 font-mono font-semibold text-stone-900 dark:text-white">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded border ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : order.paymentStatus === 'failed'
                                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                            }`}
                          >
                            {order.paymentStatus || (order.paymentMethod?.includes('cod') ? 'pending' : 'paid')}
                          </span>
                        </td>
                        <td className="py-3 text-stone-600 dark:text-stone-400">
                          {order.status || 'Processing'}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsOrderModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-stone-500">
              No orders have been recorded in the database yet.
            </div>
          )}
        </div>

        {/* Low Stock & Inventory Health Alerts (1 Col) */}
        <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100 dark:border-white/5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-stone-950 dark:text-white">
                Low Stock Alerts
              </h2>
            </div>

            {data?.lowStock && data.lowStock.length > 0 ? (
              <div className="space-y-3">
                {data.lowStock.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-stone-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                        {item.category || 'Apparel'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        item.stock <= 0
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                All product inventories are well-stocked.
              </div>
            )}
          </div>

          {/* Database Diagnostics Box */}
          <div className="mt-6 pt-4 border-t border-stone-100 dark:border-white/5">
            <div className="bg-stone-50 dark:bg-zinc-900/80 rounded-md p-3 text-xs border border-stone-200 dark:border-white/5">
              <div className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                Database Telemetry
              </div>
              <div className="space-y-1 text-[11px] font-mono text-stone-600 dark:text-stone-400">
                <p>Status: <span className="text-emerald-500 font-bold">ONLINE</span></p>
                <p>Cluster: <span className="text-stone-800 dark:text-stone-200">cluster0.3byix6m.mongodb.net</span></p>
                <p>Database: <span className="text-stone-800 dark:text-stone-200">veloura</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    </div>
  );
};
