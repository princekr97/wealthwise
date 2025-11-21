/**
 * Lending Routes
 */

import express from 'express';
import {
  getLendings,
  createLending,
  updateLending,
  deleteLending,
  addLendingPayment
} from '../controllers/lendingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getLendings);
router.post('/', createLending);
router.put('/:id', updateLending);
router.delete('/:id', deleteLending);
router.post('/:id/payment', addLendingPayment);

export default router;