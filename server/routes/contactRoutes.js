import express from 'express';
import { submitContact, listContacts, updateContactStatus } from '../controllers/contactController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', protectAdmin, listContacts);
router.put('/:id/status', protectAdmin, updateContactStatus);

export default router;
