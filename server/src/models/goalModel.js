/**
 * Goal Model
 *
 * Savings / financial goals per user.
 */

import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currentAmount: {
      type: Number,
      required: true,
      min: 0
    },
    deadline: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

goalSchema.index({ userId: 1, deadline: 1 });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;