/**
 * Expense Routes
 *
 * Routes for expense CRUD and analytics.
 */

import express from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getExpensesByCategory
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Specific routes MUST come before /:id routes
router.get('/summary', getExpenseSummary);
router.get('/by-category', getExpensesByCategory);

// General CRUD routes
router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;