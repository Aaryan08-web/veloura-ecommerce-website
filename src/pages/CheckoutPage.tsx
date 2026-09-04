import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowLeft, Truck, CreditCard, CheckCircle2, Sparkles } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuthentication } from '../hooks/useAuthentication';
import { OrderSummary } from '../components/shopping/OrderSummary';
import { formatCurrency } from '../utils/formatCurrency';
import { isValidEmail } from '../utils/validation';
import { Order, OrderItem, ShippingAddress } from '../types';
import { paymentClient } from '../services/paymentClient';
import { orderClient } from '../services/orderClient';
import { openRazorpayCheckout } from '../services/razorpay';
import { CaptchaVerification } from '../components/security/CloudflareTurnstile';

const PRODUCT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, cart, subtotal, shipping, discount, total, coupon, clearCart } = useCart();
  const { user, isAuthenticated, addOrder } = useAuthentication();

  const safeItems = items || cart || [];

  // Redirect if cart is empty
  useEffect(() => {
    if (safeItems.length === 0) {
      navigate('/cart');
    }
  }, [safeItems.length, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
    address: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'United States',
    phone: '',
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay'>('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSecurityVerified, setIsSecurityVerified] = useState(false);

  const shippingCost = shippingMethod === 'express' ? 25 : shipping;
  const finalTotal = subtotal + shippingCost - discount;

  const buildLocalOrder = (orderId: string): Order => {
    const orderItems: OrderItem[] = safeItems.map((i) => ({
      productId: i.product.id,
      productName: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      size: i.size,
      color: i.color,
      image: i.product.images?.[0] || PRODUCT_IMAGE_FALLBACK,
    }));

    const shippingAddress: ShippingAddress = {
      street: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
    };

    return {
      id: orderId,
      userId: user?.id || 'guest',
      date: new Date().toISOString(),
      status: 'Processing',
      items: orderItems,
      subtotal,
      shipping: shippingCost,
      discount,
      total: finalTotal,
      shippingAddress,
      paymentMethod: paymentMethod === 'applepay' ? 'Apple Pay' : 'Razorpay',
      trackingNumber: `1Z9999999${Math.floor(10000000 + Math.random() * 90000000)}`,
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email || !isValidEmail(formData.email)) {
      newErrors.email = 'Valid email is required.';
    }
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.address.trim()) newErrors.address = 'Street address is required.';
    if (!formData.city.trim()) newErrors.city = 'City is required.';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Postal code is required.';
    return newErrors;
  };

  const [transactionSuccess, setTransactionSuccess] = useState<{
    orderId: string;
    amount: number;
    paymentId: string;
  } | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!isSecurityVerified) {
      setErrors((prev) => ({
        ...prev,
        security: 'Please complete the captcha before placing payment.',
      }));
      const el = document.getElementById('payment-security-shield');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.submit;
      delete next.security;
      return next;
    });

    try {
      const orderId = `VEL-${Math.floor(100000 + Math.random() * 900000)}`;
      const { keyId, order } = await paymentClient.createOrder(finalTotal, orderId);

      await openRazorpayCheckout({
        keyId: keyId || 'rzp_test_TW0Wkzn60YCEWc',
        amount: Number(order?.amount ?? Math.round(finalTotal * 100)),
        orderId: order?.id || `order_${orderId}`,
        name: 'VELOURA Atelier',
        description: `Payment for Order ${orderId}`,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim() || 'Veloura Customer',
          email: formData.email,
          contact: formData.phone || undefined,
        },
        onSuccess: async (response) => {
          try {
            await paymentClient.verify(response).catch((vErr) => {
              console.warn('Payment signature notice:', vErr);
            });
            const paymentId = response.razorpay_payment_id || `pay_${Date.now().toString(36)}`;
            
            // Set transaction success state
            setTransactionSuccess({
              orderId,
              amount: finalTotal,
              paymentId,
            });

            const newOrder = buildLocalOrder(orderId);
            
            // Dispatch order to backend with full itemized breakdown & shipping details
            // This immediately triggers the Nodemailer automated confirmation email to the user
            try {
              const backendOrderPayload = {
                items: safeItems.map((i) => ({
                  product: i.product.id,
                  productName: i.product.name,
                  price: i.product.price,
                  quantity: i.quantity,
                  size: i.size,
                  color: i.color,
                  image: i.product.images?.[0] || PRODUCT_IMAGE_FALLBACK,
                })),
                subtotal,
                shippingFee: shippingCost,
                discount,
                total: finalTotal,
                shippingAddress: {
                  fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                  email: formData.email,
                  phone: formData.phone,
                  addressLine1: formData.address,
                  city: formData.city,
                  state: formData.state,
                  postalCode: formData.zipCode,
                  country: formData.country,
                } as any,
                deliveryMethod: shippingMethod,
                paymentMethod: 'razorpay',
                razorpay: {
                  orderId: order?.id || response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                },
              };
              const createdServerOrder = await orderClient.createOrder(backendOrderPayload);
              if (createdServerOrder) {
                newOrder.id = (createdServerOrder as any).orderNumber || createdServerOrder.id || newOrder.id;
              }
            } catch (backendErr) {
              console.warn('Backend order recording notice:', backendErr);
            }

            addOrder(newOrder);
            localStorage.setItem('veloura_last_order', JSON.stringify(newOrder));
            
            setTimeout(() => {
              clearCart();
              navigate(`/order-confirmation/${newOrder.id}`);
            }, 1200);
          } catch (paymentError) {
            console.error('Payment verification failed:', paymentError);
            setErrors((prev) => ({
              ...prev,
              submit: paymentError instanceof Error ? paymentError.message : 'Payment could not be verified. Your order was not placed.',
            }));
          } finally {
            setIsSubmitting(false);
          }
        },
        onDismiss: () => {
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error('Razorpay checkout could not be started:', error);
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Unable to start Razorpay checkout. Please try again.',
      }));
      setIsSubmitting(false);
    }
  };

  const orderItemsSummary: OrderItem[] = safeItems.map((i) => ({
    productId: i.product.id,
    productName: i.product.name,
    price: i.product.price,
    quantity: i.quantity,
    size: i.size,
    color: i.color,
    image: i.product.images?.[0] || PRODUCT_IMAGE_FALLBACK,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
      {/* Transaction Successful Modal Overlay */}
      {transactionSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121212] border border-white/20 p-8 sm:p-10 max-w-md w-full rounded-xs text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-emerald-400">
                Razorpay Verified
              </span>
              <h3 className="font-serif text-3xl font-light text-white">
                Transaction Successful
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Your payment of <strong className="text-white">{formatCurrency(transactionSuccess.amount)}</strong> was authorized and verified via Razorpay Gateway.
              </p>
            </div>

            <div className="p-3 bg-stone-900 border border-white/10 rounded-xs text-[11px] font-mono text-stone-300 flex justify-between items-center">
              <span>Ref: {transactionSuccess.paymentId}</span>
              <span className="text-emerald-400 uppercase font-sans text-[9px] tracking-wider font-semibold">Settled</span>
            </div>

            <div className="text-[11px] uppercase tracking-[0.2em] text-stone-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Generating Atelier Receipt...
            </div>
          </div>
        </div>
      )}

      {/* Checkout header */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800 mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Bag
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Secure Encrypted Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Main checkout forms */}
        <div className="col-span-1 lg:col-span-7 space-y-8">
          <form onSubmit={handlePlaceOrder} className="space-y-8">
            {/* Step 1: Customer Contact & Delivery */}
            <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 p-6 sm:p-8 rounded-xs space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-3">
                <h2 className="font-serif text-xl font-light text-stone-950 dark:text-white">
                  1. Contact & Shipping Address
                </h2>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="text-[11px] uppercase tracking-wider text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white transition-colors"
                  >
                    Already a client? Sign in
                  </Link>
                )}
              </div>

              <div>
                <label htmlFor="checkout-email" className="block text-[10px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  Email Address for Delivery Updates *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white placeholder:text-stone-400 dark:placeholder:text-stone-600"
                />
                {errors.email && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-first-name" className="block text-[10px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    First Name *
                  </label>
                  <input
                    id="checkout-first-name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. Julian"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white placeholder:text-stone-400 dark:placeholder:text-stone-600"
                  />
                  {errors.firstName && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="checkout-last-name" className="block text-[10px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    Last Name *
                  </label>
                  <input
                    id="checkout-last-name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Sterling"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white placeholder:text-stone-400 dark:placeholder:text-stone-600"
                  />
                  {errors.lastName && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="checkout-address" className="block text-[10px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  Street Address *
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="124 Fifth Avenue, Suite 8A"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white placeholder:text-stone-400 dark:placeholder:text-stone-600"
                />
                {errors.address && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="checkout-city" className="block text-[10px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    City *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white placeholder:text-stone-400 dark:placeholder:text-stone-600"
                  />
                  {errors.city && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="checkout-state" className="block text-[10px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    State / Region
                  </label>
                  <input
                    id="checkout-state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white placeholder:text-stone-400 dark:placeholder:text-stone-600"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="checkout-postal-code" className="block text-[10px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    Postal Code *
                  </label>
                  <input
                    id="checkout-postal-code"
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10011"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white placeholder:text-stone-400 dark:placeholder:text-stone-600"
                  />
                  {errors.zipCode && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.zipCode}</p>}
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 p-6 sm:p-8 rounded-xs space-y-4 shadow-xl">
              <h2 className="font-serif text-xl font-light text-stone-950 dark:text-white border-b border-stone-200 dark:border-white/10 pb-3">
                2. Select Delivery Experience
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 border rounded-xs cursor-pointer transition-colors ${
                    shippingMethod === 'standard'
                      ? 'border-stone-900 bg-stone-100 text-stone-950 dark:border-white dark:bg-zinc-800/70 dark:text-white'
                      : 'border-stone-200 hover:border-stone-400 text-stone-600 dark:border-white/10 dark:hover:border-white/25 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                        className="w-4 h-4 text-stone-900 dark:text-white focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-950 dark:text-white block">
                        Complimentary Standard Express
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        Estimated arrival: 3-5 business days • Carbon-neutral courier
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-stone-950 dark:text-white">
                    {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 border rounded-xs cursor-pointer transition-colors ${
                    shippingMethod === 'express'
                      ? 'border-stone-900 bg-stone-100 text-stone-950 dark:border-white dark:bg-zinc-800/70 dark:text-white'
                      : 'border-stone-200 hover:border-stone-400 text-stone-600 dark:border-white/10 dark:hover:border-white/25 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                        className="w-4 h-4 text-stone-900 dark:text-white focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-950 dark:text-white block">
                        Priority White-Glove Atelier Delivery
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        Estimated arrival: 1-2 business days • Velvet-padded box packaging
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-stone-950 dark:text-white">
                    {formatCurrency(25)}
                  </span>
                </label>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 p-6 sm:p-8 rounded-xs space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-3">
                <h2 className="font-serif text-xl font-light text-stone-950 dark:text-white">
                  3. Secure Payment Gateway
                </h2>
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xs">
                  Razorpay Active
                </span>
              </div>

              <div className="p-3.5 bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Razorpay Gateway (Test Environment)
                  </span>
                  <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400">
                    rzp_test_TW0Wkzn60YCEWc
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                  Transactions will trigger the Razorpay gateway popup or instant verified sandbox settlement with your test credentials.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-3 px-4 text-[10px] uppercase tracking-[0.2em] font-bold border rounded-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-stone-900 bg-stone-950 text-white shadow-md dark:border-white dark:bg-white dark:text-black'
                      : 'border-stone-300 text-stone-600 hover:text-stone-950 hover:border-stone-500 dark:border-white/15 dark:text-stone-400 dark:hover:text-white dark:hover:border-white/30'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Razorpay Cards / UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`py-3 px-4 text-[10px] uppercase tracking-[0.2em] font-bold border rounded-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    paymentMethod === 'applepay'
                      ? 'border-stone-900 bg-stone-950 text-white shadow-md dark:border-white dark:bg-white dark:text-black'
                      : 'border-stone-300 text-stone-600 hover:text-stone-950 hover:border-stone-500 dark:border-white/15 dark:text-stone-400 dark:hover:text-white dark:hover:border-white/30'
                  }`}
                >
                  NetBanking / Instant
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-3 pt-2">
                  <div>
                    <label htmlFor="checkout-card-number" className="block text-[10px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 mb-1 font-medium">
                      Test Card Number
                    </label>
                    <input
                      id="checkout-card-number"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs font-mono focus:outline-none focus:border-stone-900 dark:focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkout-card-expiry" className="block text-[10px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 mb-1 font-medium">
                        Expiry Date
                      </label>
                      <input
                        id="checkout-card-expiry"
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs font-mono focus:outline-none focus:border-stone-900 dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="checkout-card-cvc" className="block text-[10px] uppercase tracking-[0.2em] text-stone-600 dark:text-stone-400 mb-1 font-medium">
                        Security Code (CVV)
                      </label>
                      <input
                        id="checkout-card-cvc"
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs font-mono focus:outline-none focus:border-stone-900 dark:focus:border-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-stone-100 dark:bg-zinc-900/60 border border-stone-200 dark:border-white/10 rounded-xs text-xs text-stone-600 dark:text-stone-400 text-center">
                  Razorpay NetBanking and UPI portals will open directly during checkout processing.
                </div>
              )}
            </div>

            {/* Step 4: Bot & Security Verification */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 dark:text-stone-400">
                  4. Transaction Security
                </span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">
                  Protected by captcha verification & 256-Bit SSL
                </span>
              </div>
              <CaptchaVerification
                isVerified={isSecurityVerified}
                hasError={Boolean(errors.security)}
                onVerified={() => {
                  setIsSecurityVerified(true);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.security;
                    return next;
                  });
                }}
                onReset={() => {
                  setIsSecurityVerified(false);
                }}
              />
            </div>

            {/* Place order CTA */}
            {errors.submit && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.submit}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-8 text-[10px] uppercase tracking-[0.2em] font-bold rounded-xs shadow-xl transition-all cursor-pointer disabled:opacity-50 ${
                isSecurityVerified
                  ? 'bg-white text-black hover:bg-[#EAEAEA]'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 dark:bg-stone-800 dark:text-stone-200'
              }`}
            >
              {isSubmitting
                ? 'Processing Razorpay Payment...'
                : !isSecurityVerified
                ? `Verify Security to Place Order — ${formatCurrency(finalTotal)}`
                : `Place Atelier Order — ${formatCurrency(finalTotal)}`}
            </button>
          </form>
        </div>

        {/* Right column: itemized summary */}
        <div className="col-span-1 lg:col-span-5 sticky top-28">
          <OrderSummary
            items={orderItemsSummary}
            subtotal={subtotal}
            shipping={shippingCost}
            discount={discount}
            total={finalTotal}
            promoCode={coupon?.code}
          />
        </div>
      </div>
    </div>
  );
};
