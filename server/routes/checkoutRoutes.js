import express from 'express';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';
import Product from '../models/Product.js';
import { getRazorpayInstance, getKeyId } from '../services/paymentService';

const router = express.Router();

/**
 * POST /api/checkout
 * Server-calculated checkout: validates stock, calculates prices,
 * creates Razorpay order, and returns order details.
 * Optional authentication - guest checkout allowed.
 */
router.post('/', async (req, res) => {
  try {
    const {
      products, // [{ productId, quantity }]
      shippingMethod,
      couponCode,
    } = req.body || {};

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products are required.' });
    }

    // Calculate subtotal and validate stock
    let subtotal = 0;
    const productLookup = {};
    const insufficientStock: { productId: string; requested: number; available: number }[] = [];

    for (const item of products) {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid product data.' });
      }

      let product;
      if (isDbConnected()) {
        product = await Product.findById(productId);
      } else {
        // Fallback to memory store
        const allProducts = memoryDb.products.find();
        product = allProducts.find((p) => String(p._id) === String(productId) || String(p.id) === String(productId));
      }

      if (!product) {
        return res.status(404).json({ message: `Product ${productId} not found.` });
      }

      if (product.isActive === false) {
        return res.status(404).json({ message: `Product ${product.name} is no longer available.` });
      }

      // Validate stock
      if (product.stock < quantity) {
        insufficientStock.push({
          productId,
          requested: quantity,
          available: product.stock,
        });
      } else {
        subtotal += product.price * quantity;
        // Track product for later stock decrement
        productLookup[productId] = { product, quantity };
      }
    }

    // Handle insufficient stock
    if (insufficientStock.length > 0) {
      return res.status(400).json({
        message: 'Insufficient stock for some items.',
        insufficientStock,
      });
    }

    // Calculate shipping
    const shippingFee = subtotal >= 1500 ? 0 : 150;

    // Apply coupon discount
    let discount = 0;
    if (couponCode) {
      const validCoupons = { VELOURA15: 15, AURA20: 20, FIRST10: 10 };
      if (validCoupons[couponCode]) {
        discount = Math.round(subtotal * validCoupons[couponCode] / 100);
      }
    }

    // Calculate final total
    const total = subtotal + shippingFee - discount;

    // Create Razorpay order with server-calculated amount
    const razorpayInstance = getRazorpayInstance();
    const keyId = getKeyId();

    if (!razorpayInstance || !keyId) {
      return res.status(503).json({ message: 'Razorpay credentials not configured.' });
    }

    const amountInSubunits = Math.round(Number(total) * 100);

    const razorayOrder = await razorpayInstance.orders.create({
      amount: amountInSubunits,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      notes: {
        userId: req.user?.id || 'guest',
        createdVia: 'VELOURA Checkout',
        productCount: products.length,
      },
    });

    // Prepare response
    const response = {
      success: true,
      order: {
        id: razorayOrder.id,
        amount: razorayOrder.amount,
      },
      keyId,
      currency: 'INR',
      amount: razorayOrder.amount,
      subtotal,
      shipping: shippingFee,
      discount,
      total,
    };

    res.json(response);
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Failed to process checkout. Please try again.' });
  }
});

export default router;