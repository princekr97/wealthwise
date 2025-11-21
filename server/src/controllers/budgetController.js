/**
 * Budget Controller
 *
 * Manage monthly budgets and category limits.
 */

import Joi from 'joi';
import Budget from '../models/budgetModel.js';

const categorySchema = Joi.object({
  category: Joi.string().trim().required(),
  limit: Joi.number().min(0).required()
});

const budgetSchema = Joi.object({
  month: Joi.alternatives().try(
    Joi.date(),
    Joi.string().pattern(/^\d{4}-\d{2}$/)
  ).required(),
  overallLimit: Joi.number().min(0).required(),
  categories: Joi.array().items(categorySchema).optional()
});

/**
 * GET /api/budgets
 * List all budgets for user (optionally filter by year).
 */
export const getBudgets = async (req, res, next) => {
  try {
    const query = { userId: req.user.id };
    const { year } = req.query;

    if (year) {
      const y = Number(year);
      const start = new Date(Date.UTC(y, 0, 1));
      const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
      query.month = { $gte: start, $lte: end };
    }

    const budgets = await Budget.find(query).sort({ month: -1 });
    res.json(budgets);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/budgets
 */
export const createBudget = async (req, res, next) => {
  try {
    const { error, value } = budgetSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const existing = await Budget.findOne({
      userId: req.user.id,
      month: value.month
    });

    if (existing) {
      res.status(409);
      throw new Error('Budget for this month already exists');
    }

    const budget = await Budget.create({
      ...value,
      userId: req.user.id
    });

    res.status(201).json(budget);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/budgets/:id
 */
export const updateBudget = async (req, res, next) => {
  try {
    const { error, value } = budgetSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      value,
      { new: true, runValidators: true }
    );

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    res.json(budget);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/budgets/:id
 */
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    res.json({ message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
};