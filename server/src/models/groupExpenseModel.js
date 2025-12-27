/**
 * Group Expense Model
 *
 * Represents a shared expense within a group.
 */

import mongoose from 'mongoose';

const groupExpenseSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: [true, 'Expense must belong to a group']
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount must be positive']
        },
        date: {
            type: Date,
            default: Date.now
        },
        category: {
            type: String,
            enum: [
                'Entertainment',
                'Food and Drink',
                'Home',
                'Life',
                'Transportation',
                'Utilities',
                'Uncategorized',
                'Settlement' // Special type for debt payments
            ],
            default: 'Uncategorized'
        },
        // Which member paid?
        paidBy: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'User',
            required: true
        },
        paidByName: {
            type: String,
            required: false // Optional for backward compatibility with old expenses
        },
        // If we support shadow member payers, we might need a separate field or logic
        // For V1, we assume the creator (logged in user) or a registered user paid.
        // Actually, "paidBy" should ideally link to the `members` array _id if we want full shadow support.
        // BUT for simplicity, let's assume 'paidBy' is a User ID for now.
        // Wait, the plan says "paidBy: MemberId".
        // Let's make it flexible:

        // Who owes what?
        splits: [
            {
                user: {
                    type: mongoose.Schema.Types.Mixed,
                    ref: 'User'
                },
                userName: {
                    type: String // Store name directly
                },
                // If we want to support shadow members in splits:
                // memberId: { type: mongoose.Schema.Types.ObjectId } // Ref to Group.members._id?

                amount: {
                    type: Number,
                    required: true
                },
                owed: { // Derived/Explicit amount this person owes
                    type: Number,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const GroupExpense = mongoose.model('GroupExpense', groupExpenseSchema);

export default GroupExpense;
