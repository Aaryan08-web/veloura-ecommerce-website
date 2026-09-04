import Wishlist from '../models/Wishlist.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';

export const getWishlist = async (req, res) => {
  if (!isDbConnected()) {
    const wishlist = memoryDb.wishlist.get(req.user._id);
    return res.json({ wishlist });
  }
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  res.json({ wishlist });
};

export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!isDbConnected()) {
    const wishlist = memoryDb.wishlist.toggle(req.user._id, productId);
    return res.json({ wishlist });
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

  const exists = wishlist.products.some((p) => p.toString() === productId);
  if (exists) {
    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
  } else {
    wishlist.products.push(productId);
  }
  await wishlist.save();
  await wishlist.populate('products');
  res.json({ wishlist });
};

export const clearWishlist = async (req, res) => {
  if (!isDbConnected()) {
    const wishlist = memoryDb.wishlist.clear(req.user._id);
    return res.json({ wishlist });
  }
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.products = [];
    await wishlist.save();
  }
  res.json({ wishlist });
};
