/**
 * Investment Controller
 *
 * CRUD for investments and portfolio analytics.
 */

import Joi from 'joi';
import Investment from '../models/investmentModel.js';
import { calculateReturn } from '../utils/investmentUtils.js';

const investmentSchema = Joi.object({
  type: Joi.string().trim().required(),
  platform: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  amountInvested: Joi.number().min(0).required(),
  currentValue: Joi.number().min(0).required(),
  purchaseDate: Joi.date().required(),
  units: Joi.number().min(0).allow(null).optional()
});

/**
 * GET /api/investments
 */
export const getInvestments = async (req, res, next) => {
  try {
    const items = await Investment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/investments
 */
export const createInvestment = async (req, res, next) => {
  try {
    const { error, value } = investmentSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const investment = await Investment.create({
      ...value,
      userId: req.user.id
    });

    res.status(201).json(investment);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/investments/:id
 */
export const updateInvestment = async (req, res, next) => {
  try {
    const { error, value } = investmentSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const item = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      value,
      { new: true, runValidators: true }
    );

    if (!item) {
      res.status(404);
      throw new Error('Investment not found');
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/investments/:id
 */
export const deleteInvestment = async (req, res, next) => {
  try {
    const deleted = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) {
      res.status(404);
      throw new Error('Investment not found');
    }

    res.json({ message: 'Investment deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/investments/portfolio
 * Aggregate portfolio allocation and returns by type.
 */
export const getInvestmentPortfolio = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const investments = await Investment.find({ userId });

    const byTypeMap = new Map();

    investments.forEach((inv) => {
      const key = inv.type;
      const existing = byTypeMap.get(key) || {
        type: key,
        totalInvested: 0,
        totalCurrent: 0
      };
      existing.totalInvested += inv.amountInvested;
      existing.totalCurrent += inv.currentValue;
      byTypeMap.set(key, existing);
    });

    const byType = Array.from(byTypeMap.values()).map((item) => {
      const { absolute, percent } = calculateReturn(item.totalInvested, item.totalCurrent);
      return {
        ...item,
        absoluteReturn: absolute,
        percentReturn: percent
      };
    });

    const totals = byType.reduce(
      (acc, item) => {
        acc.totalInvested += item.totalInvested;
        acc.totalCurrent += item.totalCurrent;
        return acc;
      },
      { totalInvested: 0, totalCurrent: 0 }
    );

    const { absolute, percent } = calculateReturn(totals.totalInvested, totals.totalCurrent);

    res.json({
      totals: {
        invested: totals.totalInvested,
        current: totals.totalCurrent,
        absoluteReturn: absolute,
        percentReturn: percent
      },
      byType
    });
  } catch (err) {
    next(err);
  }
};