import Group from '../models/groupModel.js';
import GroupExpense from '../models/groupExpenseModel.js';
import User from '../models/userModel.js';
import crypto from 'crypto';

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    try {
        const { name, members, type, currency } = req.body;

        // Validate members input
        // Members should be an array of objects or strings (emails)
        // For V1, we'll try to find users by email
        const processedMembers = [];

        // Add the creator
        processedMembers.push({
            userId: req.user._id,
            name: req.user.name,
            email: req.user.email
        });

        if (members && members.length > 0) {
            for (const member of members) {
                // Find if user exists
                const user = await User.findOne({ email: member.email });

                if (user) {
                    processedMembers.push({
                        userId: user._id,
                        name: user.name,
                        email: member.email
                    });
                } else {
                    // Shadow member - create a unique identifier based on email/phone
                    // This ensures consistent tracking across the app
                    const identifier = member.email || member.phone;

                    if (!identifier) {
                        throw new Error(`Member "${member.name}" must have either email or mobile number`);
                    }

                    const shadowUserId = crypto.createHash('sha256')
                        .update(identifier)
                        .digest('hex')
                        .substring(0, 24); // MongoDB ObjectId is 24 chars

                    processedMembers.push({
                        userId: shadowUserId, // Use generated ID for shadow users
                        name: member.name || member.email?.split('@')[0] || member.phone,
                        email: member.email,
                        phone: member.phone,
                        isShadowUser: true // Mark as shadow user
                    });
                }
            }
        }

        const group = await Group.create({
            name,
            createdBy: req.user._id,
            type: type || 'Other',
            currency: currency || 'INR',
            members: processedMembers
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get user's groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
    try {
        // Find groups where the user is the creator OR is in the members list
        const groups = await Group.find({
            $or: [
                { createdBy: req.user._id },
                { 'members.userId': req.user._id }
            ]
        }).sort({ updatedAt: -1 });

        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get group details including expenses
// @route   GET /api/groups/:id
// @access  Private
const getGroupDetails = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        // Check if user is a member
        const isMember = group.members.some(
            (member) => member.userId && member.userId.toString() === req.user._id.toString()
        ) || group.createdBy.toString() === req.user._id.toString();

        if (!isMember) {
            res.status(403);
            throw new Error('Not authorized to access this group');
        }

        // Fetch expenses
        const expenses = await GroupExpense.find({ group: req.params.id })
            .populate('paidBy', 'name email')
            .populate('splits.user', 'name email')
            .sort({ date: -1 });

        // Fix expenses for shadow members
        const fixedExpenses = expenses.map(exp => {
            const expense = exp.toObject();

            // Fix paidBy if populate failed
            if (!expense.paidBy || !expense.paidBy.name) {
                // Try to use stored paidByName first
                if (expense.paidByName) {
                    expense.paidBy = { _id: expense.paidBy, name: expense.paidByName };
                } else {
                    // Fallback to group members
                    const payer = group.members.find(m =>
                        (m.userId?._id?.toString() || m.userId?.toString()) === (expense.paidBy?.toString() || expense.paidBy?._id?.toString())
                    );
                    if (payer) {
                        expense.paidBy = { _id: expense.paidBy, name: payer.name, email: payer.email };
                    }
                }
            }

            // Fix splits
            expense.splits = expense.splits.map(split => {
                if (!split.user || !split.user.name) {
                    // Try to use stored userName first
                    if (split.userName) {
                        split.user = { _id: split.user, name: split.userName };
                    } else {
                        // Fallback to group members
                        const member = group.members.find(m =>
                            (m.userId?._id?.toString() || m.userId?.toString()) === (split.user?.toString() || split.user?._id?.toString())
                        );
                        if (member) {
                            split.user = { _id: split.user, name: member.name, email: member.email };
                        }
                    }
                }
                return split;
            });

            return expense;
        });

        res.json({
            ...group.toObject(),
            expenses: fixedExpenses
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        // Only creator can update
        if (group.createdBy.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this group');
        }

        group.name = req.body.name || group.name;
        group.type = req.body.type || group.type;
        group.currency = req.body.currency || group.currency;

        const updatedGroup = await group.save();
        res.json(updatedGroup);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        // Only creator can delete
        if (group.createdBy.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to delete this group');
        }

        // Cascade delete expenses
        await GroupExpense.deleteMany({ group: req.params.id });
        await group.deleteOne();

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createGroup, getGroups, getGroupDetails, updateGroup, deleteGroup };
