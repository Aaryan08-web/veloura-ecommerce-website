import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';

const populateCart = (cart) => cart.populate('items.product');

const VALID_COUPONS = {
  VELOURA15: 15,
  AURA20: 20,
  FIRST10: 10,
};

export const getCart = async (req, res) => {
  if (!isDbConnected()) {
    const cart = memoryDb.cart.get(req.user._id);
    return res.json({ cart });
  }
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  await populateCart(cart);
  res.json({ cart });
};

export const addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;

    if (!isDbConnected()) {
      const product = memoryDb.products.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      if (product.stock < quantity) return res.status(400).json({ message: 'Not enough stock available.' });

      const cart = memoryDb.cart.get(req.user._id);
      const existing = cart.items.find(
        (item) =>
          (item.product?._id === productId || item.product?.id === productId || item.product === productId) &&
          item.size === size &&
          item.color?.name === color?.name
      );

      const items = cart.items.map((i) => ({
        _id: i._id || `item_${Math.random().toString(36).slice(2, 8)}`,
        product: i.product?._id || i.product?.id || i.product,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      }));

      if (existing) {
        const itemInRaw = items.find(
          (item) =>
            item.product === productId &&
            item.size === size &&
            item.color?.name === color?.name
        );
        if (itemInRaw) itemInRaw.quantity += quantity;
      } else {
        items.push({
          _id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          product: productId,
          size,
          color,
          quantity,
        });
      }

      const updated = memoryDb.cart.save(req.user._id, { items, couponCode: cart.couponCode });
      return res.status(201).json({ cart: updated });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Not enough stock available.' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existing = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color?.name === color?.name
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, size, color, quantity });
    }

    await cart.save();
    await populateCart(cart);
    res.status(201).json({ cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add item to cart.', error: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!isDbConnected()) {
      const cart = memoryDb.cart.get(req.user._id);
      let items = cart.items.map((i) => ({
        _id: i._id || i.id,
        product: i.product?._id || i.product?.id || i.product,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      }));

      const itemIdx = items.findIndex((i) => i._id === itemId || String(i._id) === String(itemId));
      if (itemIdx === -1) return res.status(404).json({ message: 'Cart item not found.' });

      if (quantity <= 0) {
        items.splice(itemIdx, 1);
      } else {
        items[itemIdx].quantity = quantity;
      }

      const updated = memoryDb.cart.save(req.user._id, { items, couponCode: cart.couponCode });
      return res.json({ cart: updated });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found.' });

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    await populateCart(cart);
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart item.', error: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  const { itemId } = req.params;
  if (!isDbConnected()) {
    const cart = memoryDb.cart.get(req.user._id);
    const items = cart.items
      .filter((i) => (i._id || i.id) !== itemId && String(i._id || i.id) !== String(itemId))
      .map((i) => ({
        _id: i._id || i.id,
        product: i.product?._id || i.product?.id || i.product,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      }));
    const updated = memoryDb.cart.save(req.user._id, { items, couponCode: cart.couponCode });
    return res.json({ cart: updated });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found.' });
  cart.items.id(itemId)?.deleteOne();
  await cart.save();
  await populateCart(cart);
  res.json({ cart });
};

export const clearCart = async (req, res) => {
  if (!isDbConnected()) {
    const updated = memoryDb.cart.save(req.user._id, { items: [], couponCode: undefined });
    return res.json({ cart: updated });
  }
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.couponCode = undefined;
    await cart.save();
  }
  res.json({ cart });
};

export const applyCoupon = async (req, res) => {
  const { code } = req.body;
  const clean = (code || '').trim().toUpperCase();
  if (!VALID_COUPONS[clean]) {
    return res.status(400).json({ message: 'Invalid promo code.' });
  }

  if (!isDbConnected()) {
    const cart = memoryDb.cart.get(req.user._id);
    const items = cart.items.map((i) => ({
      _id: i._id || i.id,
      product: i.product?._id || i.product?.id || i.product,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    }));
    const updated = memoryDb.cart.save(req.user._id, { items, couponCode: clean });
    return res.json({ cart: updated, discountPercent: VALID_COUPONS[clean] });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found.' });
  cart.couponCode = clean;
  await cart.save();
  await populateCart(cart);
  res.json({ cart, discountPercent: VALID_COUPONS[clean] });
};
