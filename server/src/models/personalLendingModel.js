/**
 * Personal Lending Model
 *
 * Represents money given to or taken from individuals.
 */

import mongoose from 'mongoose';

const partialPaymentSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const personalLendingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    personName: {
      type: String,
      required: true,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['given', 'taken'],
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    expectedReturnDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'settled'],
      default: 'pending'
    },
    partialPayments: [partialPaymentSchema],
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

personalLendingSchema.index({ userId: 1, status: 1 });

const PersonalLending = mongoose.model('PersonalLending', personalLendingSchema);

export default PersonalLending;