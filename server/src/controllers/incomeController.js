/**
 * Income Controller
 *
 * Handles CRUD operations and summaries for incomes.
 */

import Joi from 'joi';
import Income from '../models/incomeModel.js';
import { getLastMonthsRange } from '../utils/dateRange.js';

const incomeSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  sourceType: Joi.string().trim().required(),
  date: Joi.date().required(),
  description: Joi.string().allow('').optional(),
  isRecurring: Joi.boolean().optional(),
  creditTo: Joi.string().trim().required()
});

/**
 * GET /api/income
 * Get paginated list of incomes for the current user.
 */
export const getIncomes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      from,
      to,
      sourceType
    } = req.query;

    const query = { userId };

    if (sourceType) {
      query.sourceType = sourceType;
    }

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [items, total] = await Promise.all([
      Income.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Income.countDocuments(query)
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
 * POST /api/income
 * Create a new income record.
 */
export const createIncome = async (req, res, next) => {
  try {
    const { error, value } = incomeSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const income = await Income.create({
      ...value,
      userId: req.user.id
    });

    res.status(201).json(income);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/income/:id
 * Update an existing income record.
 */
export const updateIncome = async (req, res, next) => {
  try {
    const { error, value } = incomeSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      value,
      { new: true, runValidators: true }
    );

    if (!income) {
      res.status(404);
      throw new Error('Income not found');
    }

    res.json(income);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/income/:id
 * Delete an income record.
 */
export const deleteIncome = async (req, res, next) => {
  try {
    const deleted = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) {
      res.status(404);
      throw new Error('Income not found');
    }

    res.json({ message: 'Income deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/income/summary
 * Get income total for last N months or custom range.
 * Query: months (default 1) OR from,to
 */
export const getIncomeSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { months, from, to } = req.query;

    let startDate;
    let endDate;

    if (from || to) {
      startDate = from ? new Date(from) : new Date('1970-01-01');
      endDate = to ? new Date(to) : new Date();
    } else {
      const monthsNum = Number(months || 1);
      const { start, end } = getLastMonthsRange(monthsNum);
      startDate = start;
      endDate = end;
    }

    const result = await Income.aggregate([
      {
        $match: {
          userId: Income.db.castObjectId(userId),
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