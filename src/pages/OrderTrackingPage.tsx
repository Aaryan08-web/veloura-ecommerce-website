import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  PhoneCall,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface TrackingUpdate {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

interface OrderItem {
  id?: string;
  _id?: string;
  product: {
    id?: string;
    _id?: string;
    name: string;
    images?: string[];
    price: number;
    category?: string;
  } | string;
  name?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: { name: string; hex: string } | string;
  image?: string;
}

interface TrackedOrder {
  _id: string;
  id?: string;
  orderNumber?: string;
  trackingNumber?: string;
  carrier?: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  trackingUpdates?: TrackingUpdate[];
  createdAt: string;
  estimatedDelivery?: string;
}

const STEPS = [
  { key: 'placed', label: 'Order Confirmed', desc: 'Order verified & payment confirmed' },
  { key: 'processing', label: 'Atelier Processing', desc: 'Curated, tailored & quality checked' },
  { key: 'shipped', label: 'Dispatched & In Transit', desc: 'Handed over to carrier network' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Arriving with local courier' },
  { key: 'delivered', label: 'Delivered', desc: 'Safely delivered to your address' },
];

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryId = orderId || searchParams.get('id') || searchParams.get('orderNumber') || '';
  const [searchInput, setSearchInput] = useState(queryId);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (identifier: string) => {
    if (!identifier.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(identifier.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Order not found with that identifier.');
      }
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Failed to locate order.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setSearchInput(queryId);
      fetchTracking(queryId);
    }
  }, [queryId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track-order/${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const getStepIndex = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver')) return 4;
    if (s.includes('out') || s.includes('courier')) return 3;
    if (s.includes('ship') || s.includes('transit') || s.includes('dispatched')) return 2;
    if (s.includes('process') || s.includes('curat')) return 1;
    return 0;
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0A0A0A] text-stone-900 dark:text-stone-100 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-6">
          <Link to="/home" className="hover:text-stone-950 dark:hover:text-white">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-900 dark:text-stone-200 font-semibold">Track Shipment</span>
        </div>

        {/* Page Title & Search Bar */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
            Real-time Logistics
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal mt-3 text-stone-950 dark:text-white">
            Track Your Order
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 font-light">
            Enter your order reference (e.g. VEL-2026-..., ORD-..., or Tracking ID) to see live shipment progress.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Package className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Order # or Tracking Code"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-sm rounded-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-stone-950 dark:focus:border-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="px-6 py-3 bg-stone-950 hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-stone-200 text-white text-xs uppercase tracking-widest font-bold rounded-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 text-stone-900 dark:text-white animate-spin mx-auto mb-4" />
            <p className="text-sm uppercase tracking-widest text-stone-500">Querying live dispatch ledger...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-xl mx-auto p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xs text-center">
            <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200">Shipment Record Not Found</h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{error}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-3">
              Please double check the order identifier sent in your confirmation email or check your account dashboard.
            </p>
          </div>
        )}

        {/* Order Details & Timeline Card */}
        {order && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Status Overview Card */}
            <div className="p-6 sm:p-8 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 shadow-xl rounded-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 dark:border-white/10 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-stone-950 dark:text-white font-serif">
                      Order {order.orderNumber || order._id}
                    </h2>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="bg-stone-50 dark:bg-zinc-900 px-3 py-2 rounded-xs border border-stone-200 dark:border-white/10">
                    <span className="block text-[9px] uppercase tracking-wider text-stone-500">Carrier</span>
                    <span className="font-semibold text-stone-900 dark:text-white">{order.carrier || 'Veloura Express Air'}</span>
                  </div>
                  <div className="bg-stone-50 dark:bg-zinc-900 px-3 py-2 rounded-xs border border-stone-200 dark:border-white/10">
                    <span className="block text-[9px] uppercase tracking-wider text-stone-500">Tracking Code</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-white">
                      {order.trackingNumber || `VEL-TRK-${order._id.slice(-8).toUpperCase()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Progress Timeline */}
              <div className="py-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                  {STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={step.key} className="flex md:flex-col items-start gap-3 relative">
                        {/* Step Marker */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            isCompleted
                              ? 'bg-stone-950 text-white border-stone-950 dark:bg-white dark:text-black dark:border-white'
                              : 'bg-stone-100 text-stone-400 border-stone-300 dark:bg-zinc-800 dark:border-zinc-700'
                          } ${isCurrent ? 'ring-4 ring-amber-500/30 ring-offset-2' : ''}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Step Text */}
                        <div>
                          <h4
                            className={`text-xs uppercase tracking-wider font-bold ${
                              isCompleted ? 'text-stone-950 dark:text-white' : 'text-stone-400 dark:text-stone-600'
                            }`}
                          >
                            {step.label}
                          </h4>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Milestones Updates */}
              {order.trackingUpdates && order.trackingUpdates.length > 0 && (
                <div className="mt-4 pt-6 border-t border-stone-200 dark:border-white/10">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-400 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-500" />
                    Live Activity Ledger
                  </h3>
                  <div className="space-y-3">
                    {order.trackingUpdates.map((update, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-zinc-900/50 border border-stone-200 dark:border-white/5 rounded-xs"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-stone-900 dark:text-white">{update.status}</span>
                            <span className="text-[10px] text-stone-500">
                              {new Date(update.timestamp).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">{update.description}</p>
                          {update.location && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-stone-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              {update.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Two Column Section: Itemized Summary & Shipping Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items List (2 cols) */}
              <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 p-6 rounded-xs shadow-md">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-400 mb-4">
                  Package Contents ({order.items.length} items)
                </h3>
                <div className="divide-y divide-stone-200 dark:divide-white/10">
                  {order.items.map((item, idx) => {
                    const prodObj = typeof item.product === 'object' && item.product !== null ? item.product : null;
                    const prodName = item.name || prodObj?.name || 'Veloura Atelier Item';
                    const prodImg = item.image || prodObj?.images?.[0] || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80';
                    const prodColor = typeof item.color === 'object' ? item.color?.name : item.color;

                    return (
                      <div key={idx} className="py-3.5 flex items-center gap-4">
                        <img
                          src={prodImg}
                          alt={prodName}
                          className="w-16 h-20 object-cover bg-stone-100 dark:bg-zinc-800 rounded-xs border border-stone-200 dark:border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-stone-950 dark:text-white truncate">
                            {prodName}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-1">
                            {item.size && <span>Size: <strong className="text-stone-800 dark:text-stone-200">{item.size}</strong></span>}
                            {prodColor && <span>Color: <strong className="text-stone-800 dark:text-stone-200">{prodColor}</strong></span>}
                            <span>Qty: <strong className="text-stone-800 dark:text-stone-200">{item.quantity}</strong></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-stone-950 dark:text-white">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Totals */}
                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-white/10 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal || order.total)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Shipping</span>
                    <span>{order.shipping > 0 ? formatCurrency(order.shipping) : 'Free Delivery'}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-950 dark:text-white pt-2 border-t border-stone-200 dark:border-white/10">
                    <span>Total Paid</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Concierge (1 col) */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 p-6 rounded-xs shadow-md">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-600 dark:text-stone-400 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-stone-500" />
                    Delivery Destination
                  </h3>
                  <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1 leading-relaxed">
                    <p className="font-bold text-stone-950 dark:text-white text-sm">
                      {order.shippingAddress?.fullName || 'Valued Client'}
                    </p>
                    <p>{order.shippingAddress?.addressLine1}</p>
                    {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                      {order.shippingAddress?.postalCode}
                    </p>
                    <p className="text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
                      {order.shippingAddress?.country || 'India'}
                    </p>
                    {order.shippingAddress?.phone && (
                      <p className="pt-2 text-stone-500">Contact: {order.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>

                <div className="bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 p-6 rounded-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-white mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Atelier Concierge
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    Need assistance with delivery schedules, address modifications, or sizing exchanges?
                  </p>
                  <Link
                    to="/contact"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-950 dark:text-white underline hover:opacity-80"
                  >
                    Contact Client Relations
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
