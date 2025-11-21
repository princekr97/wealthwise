/**
 * Loan Model
 *
 * Represents a loan with EMI schedule linked to a user.
 */

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    loanType: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    principal: {
      type: Number,
      required: true,
      min: 0
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0
    },
    tenure: {
      type: Number,
      required: true,
      min: 1
    },
    emiAmount: {
      type: Number,
      required: true,
      min: 0
    },
    emiDueDate: {
      type: Number,
      required: true,
      min: 1,
      max: 31
    },
    startDate: {
      type: Date,
      required: true
    },
    remainingBalance: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active'
    },
    payments: [paymentSchema]
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

loanSchema.index({ userId: 1, status: 1 });

const Loan = mongoose.model('Loan', loanSchema);

export default Loan;