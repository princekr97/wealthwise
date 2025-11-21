/**
 * Investment Model
 *
 * Represents an investment portfolio item.
 */

import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    platform: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    amountInvested: {
      type: Number,
      required: true,
      min: 0
    },
    currentValue: {
      type: Number,
      required: true,
      min: 0
    },
    purchaseDate: {
      type: Date,
      required: true
    },
    units: {
      type: Number,
      min: 0
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

investmentSchema.index({ userId: 1, type: 1 });

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;