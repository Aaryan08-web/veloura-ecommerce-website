import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';

let genAIModern = null;
let genAILegacy = null;

const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Gemini] GEMINI_API_KEY environment variable is not configured. Chatbot will not function.');
    return null;
  }
  return apiKey;
};

const getModernClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  if (!genAIModern) {
    try {
      genAIModern = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });
    } catch {
      genAIModern = null;
    }
  }
  return genAIModern;
};

const getLegacyClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  if (!genAILegacy) {
    try {
      genAILegacy = new GoogleGenerativeAI(apiKey);
    } catch {
      genAILegacy = null;
    }
  }
  return genAILegacy;
};

const SYSTEM_INSTRUCTION = `You are "Veloura Assistant", the intelligent customer service and shopping AI chatbot for VELOURA, a luxury modern fashion and lifestyle e-commerce store.

STRICT DOMAIN GUARDRAILS & TOPIC RESTRICTIONS:
1. You must ONLY help customers with queries related to:
   - Products (recommendations, materials, sizing, fit, colors, styling, care instructions)
   - Orders (order tracking, order status, order placement, modifications)
   - Shipping & Delivery (delivery timeframes, shipping rates, carriers, express shipping)
   - Returns & Refunds (30-day return policy, exchange procedures, refund timelines)
   - Payments (accepted payment methods, card processing, Razorpay, promo codes)
   - General purchase assistance (adding to cart, checkout guidance, gifting, account orders)

2. STRICT REFUSAL RULE FOR UNRELATED TOPICS:
   If the user asks ANY question outside these e-commerce topics (e.g., general knowledge, math calculations, coding, politics, philosophy, entertainment, non-Veloura topics), you MUST POLITELY DECLINE.
   Example refusal response: "I'm designed specifically to assist you with Veloura products, orders, shipping, returns, and payment questions. How can I assist with your shopping today?"

STORE KNOWLEDGE BASE:
- Store Name: VELOURA (Wear Your Aura)
- Shipping: Free worldwide express shipping on orders over ₹1,500. Standard shipping takes 3-5 business days (₹150 for orders under ₹1,500).
- Returns: Hassle-free 30-day return policy for unworn items with original tags. Refunds are processed within 3-5 business days.
- Payments: Accepts all major credit/debit cards (Visa, MasterCard, Amex) and Razorpay secure payment gateway.
- Promo Codes: "VELOURA15" for 15% off any order, and "FIRST10" for 10% off the first order.
- Sizing: True to size. Premium cotton, linen, silk, and wool blends.
- Contact: support@veloura.com or via the store Contact page.

TONE & STYLE:
- Polite, helpful, concise, and professional.
- Format all prices using rupees (₹) e.g., ₹1,299 or ₹4,500.
- Use clean Markdown styling and bullet points when listing products or steps.`;

const getFallbackReply = (message) => {
  const q = (message || '').toLowerCase().trim();

  // Guardrail check in fallback mode
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

  if (q.includes('track') || q.includes('where is my order') || q.includes('order status') || (q.includes('order') && q.includes('id'))) {
    return "Sure! Please provide your order ID (e.g. VEL-88214) or the email used while placing the order, and I'll help you check the status. You can also view all active shipments under your Account > Orders page.";
  }
  if (q.includes('shipping') || q.includes('delivery')) {
    return "We offer complimentary express shipping on all orders over ₹1,500! Standard shipping arrives in 3–5 business days (₹150 for orders under ₹1,500). Express priority courier takes 1–2 business days.";
  }
  if (q.includes('return') || q.includes('refund') || q.includes('exchange')) {
    return 'Veloura provides a 30-day hassle-free return and exchange policy on all unworn items with original tags intact. Refunds are credited back to your original payment method within 3–5 business days.';
  }
  if (q.includes('payment') || q.includes('pay') || q.includes('card') || q.includes('razorpay')) {
    return 'We accept all major credit and debit cards (Visa, MasterCard, American Express) as well as secure checkout via Razorpay with encrypted tokenization.';
  }
  if (q.includes('discount') || q.includes('coupon') || q.includes('promo') || q.includes('code')) {
    return 'You can use promo code **VELOURA15** at checkout for 15% off your order, or **FIRST10** for 10% off your first purchase!';
  }
  if (q.includes('size') || q.includes('fit') || q.includes('sizing')) {
    return 'Our apparel fits true to size with tailored proportions. For an oversized or relaxed streetwear drape, we recommend sizing up by one size.';
  }
  if (q.includes('recommend') || q.includes('best') || q.includes('product')) {
    return 'Our top recommendations this season include the **Aura Silk Midi Dress**, **Heritage Leather Chelsea Boots**, and the **Cashmere Blend Trench Coat**. Explore our curated catalog for more options!';
  }

  return "Hello! 👋 I'm Veloura Assistant. I can help you with products, orders, shipping, returns, payments, and general purchase assistance. How can I help you today?";
};

// POST /api/chatbot  { message, history? }
export const chatWithBot = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'A message is required.' });
    }

    const cleanMessage = String(message).trim();

    // Prepare live catalog snippet
    let productContext = '';
    try {
      let sample = [];
      if (isDbConnected()) {
        sample = await Product.find({ isActive: true }).limit(10).select('name category price');
      } else {
        sample = memoryDb.products.filter((p) => p.isActive).slice(0, 10);
      }
      if (sample && sample.length > 0) {
        productContext = `\n\nLive Store Catalog Sample:\n${sample
          .map((p) => `- ${p.name} (₹${p.price})`)
          .join('\n')}`;
      }
    } catch {
      // non-fatal
    }

    const fullInstruction = SYSTEM_INSTRUCTION + productContext;

    // Try @google/genai first
    const modernClient = getModernClient();
    if (modernClient) {
      try {
        const response = await modernClient.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: cleanMessage,
          config: {
            systemInstruction: fullInstruction,
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        });
        if (response && response.text) {
          return res.json({ reply: response.text.trim() });
        }
      } catch (modernErr) {
        console.warn('[Gemini modern call fallback]:', modernErr.message);
      }
    }

    // Try @google/generative-ai
    const legacyClient = getLegacyClient();
    if (legacyClient) {
      try {
        const model = legacyClient.getGenerativeModel({
          model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          systemInstruction: fullInstruction,
        });

        const chat = model.startChat({
          history: history.slice(-8).map((h) => ({
            role: h.role === 'bot' || h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text || h.message || '' }],
          })),
        });

        const result = await chat.sendMessage(cleanMessage);
        const reply = result.response.text();
        if (reply) {
          return res.json({ reply: reply.trim() });
        }
      } catch (legacyErr) {
        console.warn('[Gemini legacy call fallback]:', legacyErr.message);
      }
    }

    // Fallback response with guardrail logic
    const reply = getFallbackReply(cleanMessage);
    return res.json({ reply });
  } catch (err) {
    const reply = getFallbackReply(req.body?.message || '');
    res.json({ reply });
  }
};

