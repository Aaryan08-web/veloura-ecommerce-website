import express from 'express';
import {
  getDashboardStats,
  getSalesAnalytics,
  listUsers,
  toggleUserActive,
  getEmailStatus,
  sendAdminTestEmail,
  getDatabaseStatus,
} from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protectAdmin);

router.get('/stats', getDashboardStats);
router.get('/analytics/sales', getSalesAnalytics);
router.get('/users', listUsers);
router.put('/users/:id/toggle', toggleUserActive);
router.get('/email-status', getEmailStatus);
router.post('/test-email', sendAdminTestEmail);
router.get('/db-status', getDatabaseStatus);

export default router;

