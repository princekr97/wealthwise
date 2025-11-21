/**
 * Income Routes
 *
 * Routes for income CRUD and analytics.
 */

import express from 'express';
import {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeSummary
} from '../controllers/incomeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getIncomes);
router.post('/', createIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);
router.get('/summary', getIncomeSummary);

export default router;