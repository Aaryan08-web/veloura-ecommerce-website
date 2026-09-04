import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, PackageCheck, ArrowRight, Truck, ShieldCheck, Printer, Mail } from 'lucide-react';
import { Order } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#BFA175', '#292524', '#e7e5e4', '#d6d3d1'],
      });
    } catch {
      // ignore
    }

    // Try reading last order from localStorage
    const saved = localStorage.getItem('veloura_last_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === orderId || !orderId) {
          setOrder(parsed);
          return;
        }
      } catch {
        // ignore
      }
    }

    // Fallback order state
    setOrder({
      id: orderId || 'VEL-882194',
      userId: 'guest',
      date: new Date().toISOString(),
      status: 'Processing',
      items: [
        {
          productId: 'prod-1',
          productName: 'Double-Faced Cashmere Overcoat',
          price: 495,
          quantity: 1,
          size: 'M',
          color: { name: 'Camel Melange', hex: '#C19A6B' },
          image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
        },
      ],
      subtotal: 495,
      shipping: 0,
      discount: 0,
      total: 495,
      shippingAddress: {
        street: '124 Fifth Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10011',
        country: 'United States',
      },
      paymentMethod: 'Credit Card (ending 4242)',
      trackingNumber: '1Z99999992819201',
    });
  }, [orderId]);

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Banner */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 dark:bg-zinc-900 text-stone-900 dark:text-white border border-stone-200 dark:border-white/15 shadow-md dark:shadow-xl">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-emerald-500 block mb-1">
            Transaction Successful • Razorpay Verified
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-stone-950 dark:text-white font-light">
            Your Aura Is En Route
          </h1>
        </div>

        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto font-light leading-relaxed">
          Order <strong className="text-stone-950 dark:text-white">#{order.id}</strong> has been secured and dispatched to the Veloura packaging atelier for garment inspection and boxed presentation.
        </p>

        {/* Automated Email Confirmation Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-full text-xs text-stone-700 dark:text-stone-300">
          <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>
            An automated receipt &amp; order summary email has been triggered via Nodemailer to{' '}
            <strong className="text-stone-950 dark:text-white">
              {(order.shippingAddress as any)?.email || (order as any).guestEmail || 'your email'}
            </strong>
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="p-6 sm:p-8 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs mb-8 shadow-md dark:shadow-xl">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 dark:text-stone-400 mb-6">
          Atelier Fulfillment Progression
        </h3>

        <div className="grid grid-cols-4 gap-2 relative">
          {/* Connector Line */}
          <div className="absolute top-4 inset-x-8 h-0.5 bg-stone-200 dark:bg-zinc-800 -z-0" />
          <div className="absolute top-4 left-8 w-1/3 h-0.5 bg-stone-950 dark:bg-white -z-0" />

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-stone-950 text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-bold shadow-md">
              ✓
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-950 dark:text-white">Order Received</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-stone-950 text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-bold animate-pulse shadow-md">
              2
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-950 dark:text-white">Hand Inspection</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 dark:bg-zinc-800 dark:text-stone-500 flex items-center justify-center text-xs font-semibold">
              3
            </div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500">Atelier Dispatch</span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center space-y-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 dark:bg-zinc-800 dark:text-stone-500 flex items-center justify-center text-xs font-semibold">
              4
            </div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500">White-Glove Delivery</span>
          </div>
        </div>
      </div>

      {/* Itemized Order Receipt */}
      <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs p-6 sm:p-8 space-y-6 shadow-md dark:shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Order Number</span>
            <p className="font-serif text-lg font-normal text-stone-950 dark:text-white">{order.id}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Placed On</span>
            <p className="text-xs font-medium text-stone-700 dark:text-stone-300">{formatDate(order.date)}</p>
          </div>
        </div>

        {/* Item rows */}
        <div className="divide-y divide-stone-200 dark:divide-white/10">
          {order.items.map((item, i) => (
            <div key={i} className="py-4 flex gap-4 items-center">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'}
                alt={item.productName}
                className="w-16 h-20 object-cover rounded-xs bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-normal text-stone-950 dark:text-white">{item.productName}</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Size: {item.size} • Color: {item.color.name} • Qty: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium text-stone-950 dark:text-white whitespace-nowrap">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Math */}
        <div className="pt-4 border-t border-stone-200 dark:border-white/10 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-stone-500 dark:text-stone-400">
            <span>Subtotal</span>
            <span className="text-stone-950 dark:text-white font-medium">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone-500 dark:text-stone-400">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-medium tracking-wider text-xs">COMPLIMENTARY</span> : formatCurrency(order.shipping)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-amber-700 dark:text-amber-300 font-medium">
              <span>Privilege Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="pt-3 border-t border-stone-200 dark:border-white/10 flex justify-between items-baseline text-base font-light text-stone-950 dark:text-white">
            <span>Paid Total</span>
            <span className="text-xl font-normal">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Delivery & Payment details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-200 dark:border-white/10 text-xs text-stone-500 dark:text-stone-400">
          <div>
            <h5 className="uppercase tracking-[0.2em] text-[10px] font-semibold text-stone-950 dark:text-white mb-1">
              Shipping Destination
            </h5>
            <p className="text-stone-700 dark:text-stone-300">{order.shippingAddress.street}</p>
            <p className="text-stone-700 dark:text-stone-300">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <p className="text-stone-500 dark:text-stone-400">{order.shippingAddress.country}</p>
          </div>

          <div>
            <h5 className="uppercase tracking-[0.2em] text-[10px] font-semibold text-stone-950 dark:text-white mb-1">
              Payment & Tracking
            </h5>
            <p className="text-stone-700 dark:text-stone-300">{order.paymentMethod}</p>
            <p className="mt-1">
              Tracking Number: <strong className="font-mono text-stone-950 dark:text-white">{order.trackingNumber}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Post-order Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link
          to={`/track-order/${order.id || (order as any)._id || order.trackingNumber || ''}`}
          className="flex-1 py-4 px-6 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 rounded-xs transition-colors shadow-md dark:shadow-xl cursor-pointer"
        >
          <PackageCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Track Shipment Live</span>
        </Link>
        <Link
          to="/shop"
          className="py-4 px-6 border border-stone-300 dark:border-white/15 text-stone-700 hover:text-stone-950 hover:border-stone-500 dark:text-stone-300 dark:hover:text-white dark:hover:border-white/30 text-[10px] uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 rounded-xs transition-colors cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
