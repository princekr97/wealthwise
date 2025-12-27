/**
 * Group Model
 *
 * Represents a group of users who share expenses.
 */

import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Group name is required'],
            trim: true
        },
        // The user who created this group
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        // Members of the group
        // Can include registered users (ObjectId) or shadow members (just Name/Email)
        members: [
            {
                userId: {
                    type: mongoose.Schema.Types.Mixed,
                    ref: 'User',
                    default: null
                },
                name: {
                    type: String,
                    required: [true, 'Member name is required'],
                    trim: true
                },
                email: {
                    type: String,
                    trim: true,
                    lowercase: true
                }
            }
        ],
        type: {
            type: String,
            enum: ['Trip', 'Home', 'Couple', 'Other'],
            default: 'Other'
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// We might want to virtual-populate expenses later
groupSchema.virtual('expenses', {
    ref: 'GroupExpense',
    localField: '_id',
    foreignField: 'group'
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
