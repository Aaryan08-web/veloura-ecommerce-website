import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayKey,
} from '../controllers/paymentController.js';
import { optionalUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/key', getRazorpayKey);
router.post('/create-order', optionalUser, createRazorpayOrder);
router.post('/verify', optionalUser, verifyRazorpayPayment);

export default router;
