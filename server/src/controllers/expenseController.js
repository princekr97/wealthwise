/**
 * Expense Controller
 *
 * Handles CRUD operations and summaries for expenses.
 */

import Joi from 'joi';
import mongoose from 'mongoose';
import Expense from '../models/expenseModel.js';
import { getLastMonthsRange } from '../utils/dateRange.js';

const expenseSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  category: Joi.string().trim().required(),
  date: Joi.date().required(),
  description: Joi.string().allow('').optional(),
  priority: Joi.string().valid('high', 'medium', 'low').required(),
  paymentMethod: Joi.string().trim().required(),
  bankName: Joi.string().allow('').optional(),
  isRecurring: Joi.boolean().optional()
});

/**
 * GET /api/expenses
 * Get paginated list of expenses for the current user.
 * Query: page, limit, from, to, category
 */
export const getExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      from,
      to,
      category
    } = req.query;

    const query = { userId };

    if (category) {
      query.category = category;
    }

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [items, total] = await Promise.all([
      Expense.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Expense.countDocuments(query)
    ]);

    res.json({
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/expenses
 * Create a new expense.
 */
export const createExpense = async (req, res, next) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const expense = await Expense.create({
      ...value,
      userId: req.user.id
    });

    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/expenses/:id
 * Update an existing expense.
 */
export const updateExpense = async (req, res, next) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      value,
      { new: true, runValidators: true }
    );

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    res.json(expense);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/expenses/:id
 * Delete an expense.
 */
export const deleteExpense = async (req, res, next) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) {
      res.status(404);
      throw new Error('Expense not found');
    }

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/expenses/summary
 * Get total expenses for current month / custom range.
 * Query: from, to
 */
export const getExpenseSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    let startDate;
    let endDate;

    if (from || to) {
      startDate = from ? new Date(from) : new Date('1970-01-01');
      endDate = to ? new Date(to) : new Date();
    } else {
      const { start, end } = getLastMonthsRange(1);
      startDate = start;
      endDate = end;
    }

    const result = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = result[0] || { total: 0, count: 0 };

    res.json({
      range: { from: startDate, to: endDate },
      total: summary.total,
      count: summary.count
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/expenses/by-category
 * Returns totals grouped by category for last N months (default 1).
 * Query: months
 */
export const getExpensesByCategory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const months = Number(req.query.months || 1);
    const { start, end } = getLastMonthsRange(months);

    const data = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({
      range: { from: start, to: end },
      categories: data.map((item) => ({
        category: item._id,
        totalAmount: item.totalAmount,
        count: item.count
      }))
    });
  } catch (err) {
    next(err);
  }
};