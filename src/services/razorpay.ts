export interface OpenRazorpayOptions {
  keyId: string;
  amount: number; // in paise
  orderId: string;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss?: () => void;
}

export const openRazorpayCheckout = async (options: OpenRazorpayOptions): Promise<void> => {
  const RazorpayConstructor = await loadRazorpay();
  const razorpay = new RazorpayConstructor({
    key: options.keyId,
    amount: options.amount,
    currency: options.currency || 'INR',
    name: options.name || 'VELOURA Atelier',
    description: options.description,
    order_id: options.orderId,
    prefill: options.prefill,
    handler: options.onSuccess,
    modal: { ondismiss: options.onDismiss },
  });
  razorpay.open();
};

const loadRazorpay = (): Promise<any> => new Promise((resolve, reject) => {
  if ((window as any).Razorpay) return resolve((window as any).Razorpay);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => (window as any).Razorpay ? resolve((window as any).Razorpay) : reject(new Error('Razorpay failed to load.'));
  script.onerror = () => reject(new Error('Unable to load Razorpay Checkout. Check your network or Content Security Policy.'));
  document.head.appendChild(script);
});
