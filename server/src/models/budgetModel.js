/**
 * Budget Model
 *
 * Monthly budgets and category limits per user.
 */

import mongoose from 'mongoose';

const categoryLimitSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    month: {
      type: Date,
      required: true
    },
    overallLimit: {
      type: Number,
      required: true,
      min: 0
    },
    categories: [categoryLimitSchema]
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;