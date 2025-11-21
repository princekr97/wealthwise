/**
 * Loan Routes
 *
 * Routes for loans and EMI payments.
 */

import express from 'express';
import {
  getLoans,
  createLoan,
  updateLoan,
  deleteLoan,
  addLoanPayment,
  getLoanCalendar
} from '../controllers/loanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getLoans);
router.post('/', createLoan);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);
router.post('/:id/payment', addLoanPayment);
router.get('/calendar', getLoanCalendar);

export default router;