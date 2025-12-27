import GroupExpense from '../models/groupExpenseModel.js';
import Group from '../models/groupModel.js';

// @desc    Add expense to group
// @route   POST /api/groups/:groupId/expenses
// @access  Private
const addExpense = async (req, res) => {
    try {
        const { description, amount, date, category, paidBy, splits } = req.body;
        const { groupId } = req.params;

        // Verify group exists
        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        // Verify splits sum up to total (allowing for small floating point errors)
        const totalSplit = splits.reduce((sum, split) => sum + Number(split.amount), 0);
        if (Math.abs(totalSplit - Number(amount)) > 0.1) {
            res.status(400);
            throw new Error(`Splits sum (${totalSplit}) does not match total amount (${amount})`);
        }

        // Get payer name from group members
        const payer = group.members.find(m =>
            (m.userId?._id?.toString() || m.userId?.toString()) === (paidBy?.toString() || req.user._id.toString())
        );
        const paidByName = payer ? payer.name : req.user.name;

        // Add userName to each split
        const splitsWithNames = splits.map(split => {
            const userId = split.user || split.userId; // Accept both formats
            const member = group.members.find(m =>
                (m.userId?._id?.toString() || m.userId?.toString()) === userId?.toString()
            );
            return {
                user: userId,
                amount: split.amount,
                owed: split.owed || split.amount,
                userName: member ? member.name : 'Unknown'
            };
        });

        const expense = await GroupExpense.create({
            group: groupId,
            description,
            amount,
            date: date || Date.now(),
            category: category || 'Uncategorized',
            paidBy: paidBy || req.user._id,
            paidByName, // Store name for easier access
            splits: splitsWithNames
        });

        // Populate user details - handle both registered users and shadow members
        const populatedExpense = await GroupExpense.findById(expense._id)
            .populate({
                path: 'paidBy',
                select: 'name email'
            })
            .populate({
                path: 'splits.user',
                select: 'name email'
            });

        // If populate didn't work (shadow user), get data from group members
        if (!populatedExpense.paidBy || !populatedExpense.paidBy.name) {
            const payer = group.members.find(m =>
                (m.userId?._id || m.userId) === paidBy
            );
            if (payer) {
                populatedExpense.paidBy = {
                    _id: paidBy,
                    name: payer.name,
                    email: payer.email
                };
            }
        }

        // Same for splits
        populatedExpense.splits = populatedExpense.splits.map(split => {
            if (!split.user || !split.user.name) {
                const member = group.members.find(m =>
                    (m.userId?._id || m.userId) === split.user
                );
                if (member) {
                    return {
                        ...split.toObject(),
                        user: { _id: split.user, name: member.name, email: member.email }
                    };
                }
            }
            return split;
        });

        res.status(201).json(populatedExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update expense
// @route   PUT /api/groups/:groupId/expenses/:expenseId
// @access  Private
const updateExpense = async (req, res) => {
    try {
        const { description, amount, date, category, paidBy, splits } = req.body;
        const { expenseId } = req.params;

        const expense = await GroupExpense.findById(expenseId);
        if (!expense) {
            res.status(404);
            throw new Error('Expense not found');
        }

        // Verify splits sum
        if (splits && amount) {
            const totalSplit = splits.reduce((sum, split) => sum + Number(split.amount), 0);
            if (Math.abs(totalSplit - Number(amount)) > 0.1) {
                res.status(400);
                throw new Error(`Splits sum (${totalSplit}) does not match total amount (${amount})`);
            }
        }

        expense.description = description || expense.description;
        expense.amount = amount || expense.amount;
        expense.date = date || expense.date;
        expense.category = category || expense.category;
        expense.paidBy = paidBy || expense.paidBy;
        expense.splits = splits || expense.splits;

        await expense.save();

        await expense.populate('paidBy', 'name email');
        await expense.populate('splits.user', 'name email');

        res.json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete expense
// @route   DELETE /api/groups/:groupId/expenses/:expenseId
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;

        const expense = await GroupExpense.findById(expenseId);
        if (!expense) {
            res.status(404);
            throw new Error('Expense not found');
        }

        await expense.deleteOne();
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Settle up debt
// @route   POST /api/groups/:groupId/settle
// @access  Private
const settleDebt = async (req, res) => {
    try {
        const { payerId, receiverId, amount } = req.body;
        const { groupId } = req.params;

        // Verify group exists
        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        const expense = await GroupExpense.create({
            group: groupId,
            description: 'Settlement',
            amount,
            date: Date.now(),
            category: 'Settlement',
            paidBy: payerId,
            splits: [
                { user: receiverId, amount: amount, owed: amount }
            ]
        });

        res.status(201).json(expense);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { addExpense, updateExpense, deleteExpense, settleDebt };
