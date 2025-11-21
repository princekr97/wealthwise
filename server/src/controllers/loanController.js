/**
 * Loan Controller
 *
 * CRUD for loans and EMI payments + simple calendar data.
 */

import Joi from 'joi';
import Loan from '../models/loanModel.js';

import {
  calculateEmi,
  calculateRemainingBalance
} from '../utils/loanUtils.js';

const loanSchema = Joi.object({
  loanType: Joi.string().trim().required(),
  bankName: Joi.string().trim().required(),
  principal: Joi.number().min(0).required(),
  interestRate: Joi.number().min(0).required(),
  tenure: Joi.number().integer().min(1).required(),
  emiAmount: Joi.number().min(0).allow(null),
  emiDueDate: Joi.number().integer().min(1).max(31).required(),
  startDate: Joi.date().required(),
  status: Joi.string().valid('active', 'closed').optional()
});

const paymentSchema = Joi.object({
  date: Joi.date().required(),
  amount: Joi.number().min(0).required()
});

/**
 * GET /api/loans
 * List loans for user.
 */
export const getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/loans
 * Create a new loan. Computes emiAmount and remainingBalance if needed.
 */
export const createLoan = async (req, res, next) => {
  try {
    const { error, value } = loanSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    let emiAmount = value.emiAmount;
    if (!emiAmount || emiAmount <= 0) {
      const tenureMonths = value.tenure * 12;
      emiAmount = calculateEmi(value.principal, value.interestRate, tenureMonths);
    }

    const remainingBalance = value.principal;

    const loan = await Loan.create({
      ...value,
      emiAmount,
      remainingBalance,
      userId: req.user.id
    });

    res.status(201).json(loan);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/loans/:id
 * Update loan details (not payments).
 */
export const updateLoan = async (req, res, next) => {
  try {
    const { error, value } = loanSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const existing = await Loan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) {
      res.status(404);
      throw new Error('Loan not found');
    }

    let emiAmount = value.emiAmount;
    if (!emiAmount || emiAmount <= 0) {
      const tenureMonths = value.tenure * 12;
      emiAmount = calculateEmi(value.principal, value.interestRate, tenureMonths);
    }

    existing.loanType = value.loanType;
    existing.bankName = value.bankName;
    existing.principal = value.principal;
    existing.interestRate = value.interestRate;
    existing.tenure = value.tenure;
    existing.emiAmount = emiAmount;
    existing.emiDueDate = value.emiDueDate;
    existing.startDate = value.startDate;
    existing.status = value.status || existing.status;

    existing.remainingBalance = calculateRemainingBalance(existing.principal, existing.payments);

    const saved = await existing.save();
    res.json(saved);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/loans/:id
 */
export const deleteLoan = async (req, res, next) => {
  try {
    const deleted = await Loan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) {
      res.status(404);
      throw new Error('Loan not found');
    }

    res.json({ message: 'Loan deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/loans/:id/payment
 * Record an EMI payment.
 */
export const addLoanPayment = async (req, res, next) => {
  try {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!loan) {
      res.status(404);
      throw new Error('Loan not found');
    }

    loan.payments.push(value);
    loan.remainingBalance = calculateRemainingBalance(loan.principal, loan.payments);

    if (loan.remainingBalance === 0 && loan.status !== 'closed') {
      loan.status = 'closed';
    }

    const saved = await loan.save();
    res.json(saved);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/loans/calendar
 * Simple EMI calendar: list of upcoming EMIs for active loans.
 */
export const getLoanCalendar = async (req, res, next) => {
  try {
    const loans = await Loan.find({
      userId: req.user.id,
      status: 'active'
    });

    const today = new Date();
    const events = loans.map((loan) => {
      const nextDue = new Date(today);
      nextDue.setDate(loan.emiDueDate);
      if (nextDue < today) {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }
      return {
        loanId: loan._id,
        loanType: loan.loanType,
        bankName: loan.bankName,
        emiAmount: loan.emiAmount,
        dueDate: nextDue
      };
    });

    res.json({ events });
  } catch (err) {
    next(err);
  }
};