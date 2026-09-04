import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, applyCoupon } from '../controllers/cartController.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Every cart route requires login — this is the enforced "guests can't add to cart" rule.
router.use(protectUser);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:itemId', updateCartItem);
router.delete('/item/:itemId', removeCartItem);
router.delete('/', clearCart);
router.post('/coupon', applyCoupon);

export default router;
