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
                },
                phone: {
                    type: String,
                    trim: true,
                    // Making it strictly required might break existing docs if not handled carefully, 
                    // but user insisted "mobile no is madatory".
                    // We'll trust the controller to enforce this for new groups.
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
