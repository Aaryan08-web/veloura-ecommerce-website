import { apiRequest } from './httpClient';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface QuickSuggestion {
  id: string;
  label: string;
  iconName: 'Package' | 'Truck' | 'RotateCcw' | 'CreditCard' | 'Sparkles' | 'HelpCircle';
  prompt: string;
}

export const DEFAULT_QUICK_SUGGESTIONS: QuickSuggestion[] = [
  {
    id: 'track_order',
    label: 'Track My Order',
    iconName: 'Package',
    prompt: 'Where is my order? How can I track my shipment?',
  },
  {
    id: 'returns',
    label: 'Returns & Refunds',
    iconName: 'RotateCcw',
    prompt: 'What is your return and refund policy?',
  },
  {
    id: 'shipping',
    label: 'Shipping Info',
    iconName: 'Truck',
    prompt: 'What are your shipping rates and delivery times?',
  },
  {
    id: 'payment',
    label: 'Payment Help',
    iconName: 'CreditCard',
    prompt: 'What payment methods and discount codes are available?',
  },
];

export const geminiChatService = {
  /**
   * Send a chat message to Veloura AI Assistant powered by Gemini API
   */
  async sendMessage(
    message: string,
    history: { role: 'user' | 'bot'; text: string }[] = []
  ): Promise<string> {
    try {
      const payload = {
        message: message.trim(),
        history: history.slice(-8).map((h) => ({
          role: h.role,
          text: h.text,
        })),
      };

      const response = await apiRequest<{ reply: string }>('/chatbot', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response && response.reply) {
        return response.reply;
      }
      throw new Error('Empty response from chatbot server');
    } catch {
      // Local fallback with strict domain guardrails
      return this.getLocalFallback(message);
    }
  },

  getLocalFallback(message: string): string {
    const q = (message || '').toLowerCase().trim();

    const isEcomTopic =
      q.includes('product') ||
      q.includes('order') ||
      q.includes('track') ||
      q.includes('ship') ||
      q.includes('deliver') ||
      q.includes('return') ||
      q.includes('refund') ||
      q.includes('exchange') ||
      q.includes('pay') ||
      q.includes('card') ||
      q.includes('price') ||
      q.includes('discount') ||
      q.includes('coupon') ||
      q.includes('size') ||
      q.includes('dress') ||
      q.includes('shirt') ||
      q.includes('jacket') ||
      q.includes('shoe') ||
      q.includes('bag') ||
      q.includes('buy') ||
      q.includes('cart') ||
      q.includes('help') ||
      q.includes('hello') ||
      q.includes('hi') ||
      q.includes('hey');

    if (!isEcomTopic && q.length > 5) {
      return "I'm designed specifically to assist you with Veloura products, orders, shipping, returns, and payment questions. How can I assist with your shopping today?";
    }

    if (q.includes('track') || q.includes('where is my order') || q.includes('order status') || (q.includes('order') && (q.includes('id') || q.includes('where')))) {
      return "Sure! Please provide your order ID (e.g. VEL-88214) or the email used while placing the order, and I'll help you check the status.";
    }
    if (q.includes('shipping') || q.includes('delivery')) {
      return "We offer complimentary express shipping on all orders over ₹1,500! Standard delivery takes 3–5 business days, and express priority takes 1–2 business days.";
    }
    if (q.includes('return') || q.includes('refund') || q.includes('exchange')) {
      return "Veloura provides a 30-day hassle-free return and exchange policy on all unworn items with original tags intact. Refunds are processed within 3–5 business days.";
    }
    if (q.includes('payment') || q.includes('pay') || q.includes('card') || q.includes('razorpay')) {
      return "We accept all major credit and debit cards (Visa, MasterCard, American Express) as well as secure checkout via Razorpay.";
    }
    if (q.includes('discount') || q.includes('coupon') || q.includes('promo') || q.includes('code')) {
      return "You can use promo code **VELOURA15** at checkout for 15% off your order, or **FIRST10** for 10% off your first purchase!";
    }
    if (q.includes('size') || q.includes('fit') || q.includes('sizing')) {
      return "Our garments fit true to size. For an oversized or relaxed streetwear silhouette, we recommend choosing one size up.";
    }

    return "Hello! 👋 I can help you with products, orders, shipping, returns, payments and general purchase assistance. How can I help you today?";
  },
};
