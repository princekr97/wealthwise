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
                    // Optional: User might not know friend's email
                },
                phone: {
                    type: String,
                    required: function() {
                        // 1. If no name, not required (empty/removed member)
                        if (!this.name) return false;
                        
                        // 2. If valid registered user (has userId), phone is opt-in (fetched from profile)
                        if (this.userId) return false;

                        // 3. For shadow users (no userId), phone is required so we can link them later
                        return typeof this.name === 'string' && this.name.trim().length > 0;
                    },
                    trim: true
                },
                // Soft delete support for member removal
                isActive: {
                    type: Boolean,
                    default: true
                },
                removedAt: {
                    type: Date,
                    default: null
                },
                removedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    default: null
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

// ============================================
// PERFORMANCE OPTIMIZATION: Database Indexes
// ============================================

// 1. Index for fetching groups by creator (dashboard "My Groups" query)
groupSchema.index({ createdBy: 1 });

// 2. Index for finding groups by member UserId (important for permission checks)
groupSchema.index({ 'members.userId': 1 });

// 3. Compound index for type filtering (e.g., show only "Trip" groups)
groupSchema.index({ createdBy: 1, type: 1 });

// We might want to virtual-populate expenses later
groupSchema.virtual('expenses', {
    ref: 'GroupExpense',
    localField: '_id',
    foreignField: 'group'
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
