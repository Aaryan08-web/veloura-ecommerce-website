import express from 'express';
import { getWishlist, toggleWishlist, clearWishlist } from '../controllers/wishlistController.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protectUser);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/', clearWishlist);

export default router;
