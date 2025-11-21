/**
 * Income Model
 *
 * Represents an income record linked to a user.
 */

import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    sourceType: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    creditTo: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

incomeSchema.index({ userId: 1, date: -1 });

const Income = mongoose.model('Income', incomeSchema);

export default Income;