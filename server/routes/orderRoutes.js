import express from 'express';
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, trackOrder } from '../controllers/orderController.js';
import { protectUser, protectAdmin, optionalUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/track/:identifier', trackOrder);
router.post('/', optionalUser, createOrder);
router.get('/my', protectUser, getMyOrders);
router.get('/:id', optionalUser, getOrderById);

// Admin
router.get('/', protectAdmin, getAllOrders);
router.put('/:id/status', protectAdmin, updateOrderStatus);

export default router;
