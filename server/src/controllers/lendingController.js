/**
 * Lending Controller
 *
 * Manage money lent/borrowed.
 */

import Joi from 'joi';
import PersonalLending from '../models/personalLendingModel.js';

const lendingSchema = Joi.object({
  personName: Joi.string().trim().required(),
  contact: Joi.string().allow('').optional(),
  amount: Joi.number().min(0).required(),
  type: Joi.string().valid('given', 'taken').required(),
  date: Joi.date().required(),
  expectedReturnDate: Joi.date().allow(null),
  status: Joi.string().valid('pending', 'partial', 'settled').optional(),
  notes: Joi.string().allow('').optional()
});

const paymentSchema = Joi.object({
  date: Joi.date().required(),
  amount: Joi.number().min(0).required()
});

/**
 * GET /api/lending
 */
export const getLendings = async (req, res, next) => {
  try {
    const items = await PersonalLending.find({ userId: req.user.id }).sort({
      createdAt: -1
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/lending
 */
export const createLending = async (req, res, next) => {
  try {
    const { error, value } = lendingSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const item = await PersonalLending.create({
      ...value,
      userId: req.user.id
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/lending/:id
 */
export const updateLending = async (req, res, next) => {
  try {
    const { error, value } = lendingSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const item = await PersonalLending.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      value,
      { new: true, runValidators: true }
    );

    if (!item) {
      res.status(404);
      throw new Error('Record not found');
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/lending/:id
 */
export const deleteLending = async (req, res, next) => {
  try {
    const deleted = await PersonalLending.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) {
      res.status(404);
      throw new Error('Record not found');
    }

    res.json({ message: 'Lending record deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/lending/:id/payment
 * Add a partial payment, and adjust status.
 */
export const addLendingPayment = async (req, res, next) => {
  try {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const item = await PersonalLending.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!item) {
      res.status(404);
      throw new Error('Record not found');
    }

    item.partialPayments.push(value);

    const paid = item.partialPayments.reduce((sum, p) => sum + p.amount, 0);

    if (paid === 0) {
      item.status = 'pending';
    } else if (paid < item.amount) {
      item.status = 'partial';
    } else {
      item.status = 'settled';
    }

    const saved = await item.save();
    res.json(saved);
  } catch (err) {
    next(err);
  }
};