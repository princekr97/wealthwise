/**
 * Goal Controller
 *
 * Manage savings goals.
 */

import Joi from 'joi';
import Goal from '../models/goalModel.js';

const goalSchema = Joi.object({
  name: Joi.string().trim().required(),
  targetAmount: Joi.number().min(0).required(),
  currentAmount: Joi.number().min(0).required(),
  deadline: Joi.alternatives().try(
    Joi.date(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
  ).required()
});

/**
 * GET /api/goals
 */
export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ deadline: 1 });
    res.json(goals);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/goals
 */
export const createGoal = async (req, res, next) => {
  try {
    const { error, value } = goalSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const goal = await Goal.create({
      ...value,
      userId: req.user.id
    });

    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/goals/:id
 */
export const updateGoal = async (req, res, next) => {
  try {
    const { error, value } = goalSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      value,
      { new: true, runValidators: true }
    );

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    res.json(goal);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/goals/:id
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    res.json({ message: 'Goal deleted' });
  } catch (err) {
    next(err);
  }
};