import express from 'express';
import {
  registerUser, loginUser, getCurrentUser, updateProfile, addAddress, removeAddress,
  loginAdmin, registerAdmin,
} from '../controllers/authController.js';
import { protectUser, protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User auth
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protectUser, getCurrentUser);
router.put('/profile', protectUser, updateProfile);
router.post('/address', protectUser, addAddress);
router.delete('/address/:index', protectUser, removeAddress);

// Admin auth (separate login endpoint & separate JWT secret)
router.post('/admin/login', loginAdmin);
router.post('/admin/register', registerAdmin); // open only for bootstrap (first admin) or by a superadmin

export default router;
