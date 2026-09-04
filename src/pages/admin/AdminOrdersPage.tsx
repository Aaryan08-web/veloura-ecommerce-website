import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { adminClient } from '../../services/adminClient';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { OrderDetailsModal } from './OrderDetailsModal';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminClient.getOrders();
      setOrders(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer orders from MongoDB.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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
    setIsUpdating(true);
    try {
      const updated = await adminClient.updateOrderStatus(orderId, payload);
      setSelectedOrder(updated);
      setSuccessMessage(`Order #${updated.orderNumber || orderId.slice(-6)} successfully updated.`);
      await fetchOrders();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const orderId = order.id || order._id || '';
    const orderNumber = order.orderNumber || '';
    const customerName =
      typeof order.user === 'object' && order.user?.name
        ? order.user.name
        : order.shippingAddress?.fullName || '';
    const customerEmail =
      typeof order.user === 'object' && order.user?.email
        ? order.user.email
        : order.guestEmail || order.shippingAddress?.email || '';
    const paymentId = order.razorpay?.paymentId || '';

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        orderId.toLowerCase().includes(q) ||
        orderNumber.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q) ||
        customerEmail.toLowerCase().includes(q) ||
        paymentId.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if ((order.status || 'Order Placed').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
    }

    // Payment Status filter
    if (paymentStatusFilter !== 'all') {
      const currentPs =
        order.paymentStatus || (order.paymentMethod?.toLowerCase().includes('cod') ? 'pending' : 'paid');
      if (currentPs.toLowerCase() !== paymentStatusFilter.toLowerCase()) {
        return false;
      }
    }

    // Payment Method filter
    if (paymentMethodFilter !== 'all') {
      const method = (order.paymentMethod || 'razorpay').toLowerCase();
      if (!method.includes(paymentMethodFilter.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Calculate order metrics
  const totalVolume = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const paidCount = orders.filter(
    (o) => o.paymentStatus === 'paid' || (!o.paymentStatus && !o.paymentMethod?.includes('cod'))
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-stone-950 dark:text-white uppercase">
              Orders & Payments Ledger
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 rounded-full">
              {orders.length} Records
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Track customer transactions, Razorpay gateway details, payment statuses, and shipment fulfillment in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-[0.15em] font-medium bg-white dark:bg-zinc-800 border border-stone-300 dark:border-white/10 rounded-md hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Transaction Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-3.5 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">Total Volume</span>
          <span className="text-lg font-serif font-bold font-mono text-stone-950 dark:text-white">
            {formatCurrency(totalVolume)}
          </span>
        </div>
        <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-3.5 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">Paid Orders</span>
          <span className="text-lg font-serif font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {paidCount}
          </span>
        </div>
        <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-3.5 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">Pending / COD</span>
          <span className="text-lg font-serif font-bold font-mono text-amber-600 dark:text-amber-400">
            {orders.length - paidCount}
          </span>
        </div>
        <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-3.5 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">Total Orders</span>
          <span className="text-lg font-serif font-bold font-mono text-stone-950 dark:text-white">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-xs text-red-800 dark:text-red-300 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchOrders} className="underline uppercase tracking-wider font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Email, Payment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>

          {/* Fulfillment Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white"
            >
              <option value="all">All Order Statuses</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid (Settled)</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white"
            >
              <option value="all">All Payment Methods</option>
              <option value="razorpay">Razorpay Online</option>
              <option value="cod">Cash on Delivery (COD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg shadow-xs overflow-hidden">
        {isLoading && orders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-stone-400" />
            <p className="text-xs uppercase tracking-wider text-stone-500">Querying orders in MongoDB...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto opacity-40 mb-2" />
            <p className="font-semibold text-stone-700 dark:text-stone-300">No orders found matching the filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 dark:bg-zinc-900/60 border-b border-stone-200 dark:border-white/10 text-[10px] uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Customer & Contact</th>
                  <th className="py-3 px-3">Payment Info</th>
                  <th className="py-3 px-3">Payment Status</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-white/5">
                {filteredOrders.map((order) => {
                  const orderId = order.id || order._id || '';
                  const customerName =
                    typeof order.user === 'object' && order.user?.name
                      ? order.user.name
                      : order.shippingAddress?.fullName || 'Guest Customer';
                  const customerEmail =
                    typeof order.user === 'object' && order.user?.email
                      ? order.user.email
                      : order.guestEmail || order.shippingAddress?.email || 'N/A';
                  const dateStr = order.createdAt || order.date || new Date().toISOString();
                  const paymentId =
                    order.razorpay?.paymentId ||
                    (order.paymentMethod?.toLowerCase().includes('razorpay') ? 'pay_razorpay' : 'COD');
                  const paymentStatus =
                    order.paymentStatus || (order.paymentMethod?.toLowerCase().includes('cod') ? 'pending' : 'paid');

                  return (
                    <tr
                      key={orderId}
                      className="hover:bg-stone-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Order ID */}
                      <td className="py-3 px-4 font-mono font-medium text-stone-950 dark:text-white">
                        <div className="flex flex-col">
                          <span>#{order.orderNumber || orderId.slice(-8)}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {order.items?.length || 1} item(s)
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        <div>
                          <p>{new Date(dateStr).toLocaleDateString()}</p>
                          <p className="text-[10px] text-stone-400">{new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3">
                        <div className="max-w-xs">
                          <p className="font-medium text-stone-900 dark:text-white truncate">
                            {customerName}
                          </p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate">
                            {customerEmail}
                          </p>
                        </div>
                      </td>

                      {/* Payment Info */}
                      <td className="py-3 px-3">
                        <div className="max-w-xs">
                          <span className="capitalize font-medium text-stone-800 dark:text-stone-200 block text-[11px]">
                            {order.paymentMethod || 'Razorpay Online'}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono select-all block truncate">
                            {paymentId}
                          </span>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded border ${
                            paymentStatus === 'paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : paymentStatus === 'failed'
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                          }`}
                        >
                          {paymentStatus}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-3 font-mono font-bold text-stone-950 dark:text-white whitespace-nowrap">
                        {formatCurrency(order.total)}
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-stone-300 rounded text-[11px] font-medium">
                          {order.status || 'Order Placed'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white dark:bg-white dark:text-stone-950 hover:opacity-90 rounded text-[10px] uppercase font-bold tracking-wider transition-opacity shadow-xs"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details & Status Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        onUpdateStatus={handleUpdateOrderStatus}
        isLoading={isUpdating}
      />
    </div>
  );
};
