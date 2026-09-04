import React, { useState } from 'react';
import { X, CreditCard, User, Truck, Package, Clock, ShieldCheck, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    orderId: string,
    payload: {
      status?: string;
      paymentStatus?: 'paid' | 'pending' | 'failed' | 'refunded';
      trackingNumber?: string;
      description?: string;
    }
  ) => Promise<void>;
  isLoading?: boolean;
}

const ORDER_STATUS_OPTIONS = [
  'Order Placed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const PAYMENT_STATUS_OPTIONS: Array<'paid' | 'pending' | 'failed' | 'refunded'> = [
  'paid',
  'pending',
  'failed',
  'refunded',
];

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  isLoading = false,
}) => {
  if (!isOpen || !order) return null;

  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>(order.status || 'Order Placed');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'paid' | 'pending' | 'failed' | 'refunded'>(
    order.paymentStatus || (order.paymentMethod?.toLowerCase().includes('cod') ? 'pending' : 'paid')
  );
  const [trackingNumber, setTrackingNumber] = useState<string>(order.trackingNumber || '');
  const [statusNote, setStatusNote] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = order.id || order._id || '';
  const customerName =
    typeof order.user === 'object' && order.user?.name
      ? order.user.name
      : order.shippingAddress?.fullName || 'Valued Guest';
  const customerEmail =
    typeof order.user === 'object' && order.user?.email
      ? order.user.email
      : order.guestEmail || order.shippingAddress?.email || 'N/A';
  const customerPhone = order.shippingAddress?.phone || 'N/A';
  const transactionDate = order.createdAt || order.date || new Date().toISOString();
  const paymentId =
    order.razorpay?.paymentId ||
    (order.paymentMethod?.toLowerCase().includes('razorpay') ? 'pay_razorpay_verified' : 'N/A (Cash on Delivery)');

  const handleApplyChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUpdateSuccess(false);

    try {
      await onUpdateStatus(orderId, {
        status: selectedOrderStatus,
        paymentStatus: selectedPaymentStatus,
        trackingNumber: trackingNumber.trim() || undefined,
        description: statusNote.trim() || `Status updated to ${selectedOrderStatus}`,
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update order status.');
    }
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      case 'failed':
        return 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'refunded':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      default:
        return 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-50 dark:bg-[#121212] text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-white/10 rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-white/10 flex items-center justify-between bg-stone-100/60 dark:bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-serif text-lg sm:text-xl font-light uppercase tracking-wider text-stone-950 dark:text-white">
                Order #{order.orderNumber || orderId.slice(-8)}
              </h3>
              <span
                className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${getPaymentStatusBadge(
                  selectedPaymentStatus
                )}`}
              >
                Payment: {selectedPaymentStatus}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Placed on {new Date(transactionDate).toLocaleDateString()} at {new Date(transactionDate).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full hover:bg-stone-200 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {updateSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Order and payment records successfully updated in MongoDB Atlas!</span>
            </div>
          )}

          {/* Section 1: Payment & Transaction Ledger Card */}
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-lg p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 dark:border-white/5 text-stone-900 dark:text-white font-semibold text-xs uppercase tracking-[0.15em]">
              <CreditCard className="w-4 h-4 text-amber-500" />
              Payment & Transaction Ledger
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Internal Order ID</span>
                <span className="font-mono text-stone-800 dark:text-stone-200 select-all font-medium text-[11px] truncate block">
                  {orderId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Gateway / Payment ID</span>
                <span className="font-mono text-stone-800 dark:text-stone-200 select-all font-medium text-[11px] truncate block">
                  {paymentId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Payment Method</span>
                <span className="capitalize font-medium text-stone-800 dark:text-stone-200">
                  {order.paymentMethod || 'Razorpay Online'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Total Transaction</span>
                <span className="font-bold text-stone-950 dark:text-white font-mono text-sm">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Customer & Shipping Destination Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-lg p-4 text-xs">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-100 dark:border-white/5 font-semibold text-[11px] uppercase tracking-[0.15em] text-stone-900 dark:text-white">
                <User className="w-4 h-4 text-stone-500" />
                Customer Information
              </div>
              <div className="space-y-1.5 text-stone-600 dark:text-stone-300">
                <p>
                  <span className="text-stone-400 font-medium">Name:</span> <strong className="text-stone-900 dark:text-white">{customerName}</strong>
                </p>
                <p>
                  <span className="text-stone-400 font-medium">Email:</span> <span className="font-mono">{customerEmail}</span>
                </p>
                <p>
                  <span className="text-stone-400 font-medium">Phone:</span> <span className="font-mono">{customerPhone}</span>
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-lg p-4 text-xs">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-100 dark:border-white/5 font-semibold text-[11px] uppercase tracking-[0.15em] text-stone-900 dark:text-white">
                <MapPin className="w-4 h-4 text-stone-500" />
                Shipping Destination
              </div>
              <div className="space-y-1 text-stone-600 dark:text-stone-300">
                <p className="font-medium text-stone-900 dark:text-white">{order.shippingAddress?.fullName || customerName}</p>
                <p>{order.shippingAddress?.street || order.shippingAddress?.addressLine1 || 'N/A'}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode || order.shippingAddress?.zipCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p className="uppercase text-[10px] text-stone-400 tracking-wider">
                  {order.shippingAddress?.country || 'India'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Ordered Items Table */}
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 dark:border-white/5 font-semibold text-xs uppercase tracking-[0.15em] text-stone-900 dark:text-white">
              <Package className="w-4 h-4 text-stone-500" />
              Purchased Items ({order.items?.length || 0})
            </div>
            <div className="divide-y divide-stone-100 dark:divide-white/5">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        item.image ||
                        item.selectedColor?.image ||
                        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={item.title || item.name}
                      className="w-12 h-16 object-cover rounded bg-stone-100 dark:bg-zinc-800 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-stone-900 dark:text-white truncate">
                        {item.title || item.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {item.selectedSize && (
                          <span className="px-1.5 py-0.5 bg-stone-100 dark:bg-zinc-800 rounded font-mono">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10"
                              style={{ backgroundColor: item.selectedColor.hex || '#111' }}
                            />
                            {item.selectedColor.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-stone-900 dark:text-white font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(order.subtotal || order.total)}</span>
              </div>
              {Boolean(order.discount) && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount Applied</span>
                  <span className="font-mono">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>Shipping & Insurance</span>
                <span className="font-mono">
                  {order.shippingFee || order.shipping ? formatCurrency(order.shippingFee || order.shipping || 0) : 'Complimentary'}
                </span>
              </div>
              <div className="flex justify-between text-stone-950 dark:text-white font-bold text-sm pt-2 border-t border-stone-200 dark:border-white/10">
                <span>Total Amount</span>
                <span className="font-mono">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Live Order & Payment Status Controls Form */}
          <form onSubmit={handleApplyChanges} className="bg-stone-100 dark:bg-zinc-900/90 border border-stone-300 dark:border-white/10 rounded-lg p-5 space-y-4">
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-stone-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-stone-500" />
              Order Status & Fulfillment Controls
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order Status */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Order Fulfillment Status
                </label>
                <select
                  value={selectedOrderStatus}
                  onChange={(e) => setSelectedOrderStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white font-medium"
                >
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Payment Gateway Status
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e: any) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white font-medium"
                >
                  {PAYMENT_STATUS_OPTIONS.map((ps) => (
                    <option key={ps} value={ps}>
                      {ps.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Carrier Tracking Number (e.g. DHL / BlueDart)
                </label>
                <input
                  type="text"
                  placeholder="e.g. VEL-EXP-9923841"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-stone-300 dark:border-white/10 rounded text-xs font-mono"
                />
              </div>

              {/* Custom Status Note */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Tracking Update Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Package dispatched from Milan atelier"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-stone-300 dark:border-white/10 rounded text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-stone-900 text-white dark:bg-white dark:text-stone-950 hover:opacity-90 rounded text-xs font-bold uppercase tracking-[0.15em] transition-all disabled:opacity-50"
              >
                {isLoading ? 'Updating MongoDB...' : 'Save & Update Status'}
              </button>
            </div>
          </form>

          {/* Section 5: Tracking History Timeline */}
          {order.trackingUpdates && order.trackingUpdates.length > 0 && (
            <div className="border border-stone-200 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-zinc-900">
              <h5 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Audit Trail & Tracking History
              </h5>
              <div className="space-y-3">
                {order.trackingUpdates.map((update, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-amber-500/60 pl-3 py-0.5">
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-white">
                        {typeof update.status === 'string' ? update.status : 'Status Update'}
                      </p>
                      <p className="text-stone-500 dark:text-stone-400 text-[11px]">{update.description}</p>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                        {new Date(update.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
