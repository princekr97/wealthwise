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
            date: date ? new Date(date) : new Date(),
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
        if (date) expense.date = new Date(date);
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

// @desc    Delete expense (soft delete for audit trail)
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

        // Soft delete: Mark as deleted instead of removing
        expense.isDeleted = true;
        expense.deletedAt = new Date();
        expense.deletedBy = req.user?._id || null;
        await expense.save();

        res.json({ message: 'Expense deleted', deletedAt: expense.deletedAt });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Settle up debt
// @route   POST /api/groups/:groupId/settle
// @access  Private
const settleDebt = async (req, res) => {
    try {
        const { payerId, receiverId, amount, payerName, receiverName } = req.body;
        const { groupId } = req.params;

        // Verify group exists
        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        // ENHANCEMENT: Calculate actual debt for validation (non-blocking)
        let actualDebt = 0;
        let warningMessage = null;
        
        try {
            const expenses = await GroupExpense.find({ group: groupId });
            
            expenses.forEach(exp => {
                const expPayerId = String(exp.paidBy?._id || exp.paidBy);
                
                // If receiver paid an expense
                if (expPayerId === String(receiverId)) {
                    exp.splits?.forEach(split => {
                        const splitUserId = String(split.user?._id || split.user);
                        // And payer was in the split, payer owes receiver
                        if (splitUserId === String(payerId)) {
                            actualDebt += split.amount;
                        }
                    });
                }
                
                // If payer paid an expense
                if (expPayerId === String(payerId)) {
                    exp.splits?.forEach(split => {
                        const splitUserId = String(split.user?._id || split.user);
                        // And receiver was in the split, receiver owes payer (reduce debt)
                        if (splitUserId === String(receiverId)) {
                            actualDebt -= split.amount;
                        }
                    });
                }
            });
            
            // Warn if settlement exceeds debt by more than ₹10 (reasonable buffer)
            if (amount > actualDebt + 10) {
                warningMessage = `Note: Settlement amount (₹${amount}) exceeds calculated debt (₹${actualDebt.toFixed(2)})`;
            }
        } catch (calcError) {
            // If debt calculation fails, continue anyway (backward compatibility)
            console.warn('Debt calculation failed, proceeding with settlement:', calcError);
        }

        // Create settlement expense
        // CRITICAL: Settlement logic to CANCEL debt
        // Original debt: receiverId paid expenses, payerId was in splits → payerId owes receiverId
        // Settlement: payerId gives receiverId cash
        // To cancel debt in expense model: Record as payerId "paid", receiverId is in splits
        // This creates OPPOSITE transaction: payerId paid, receiverId owes → cancels original
        const expense = await GroupExpense.create({
            group: groupId,
            description: 'Settlement',
            amount,
            date: Date.now(),
            category: 'Settlement',
            paidBy: payerId,  // The DEBTOR making the payment
            paidByName: payerName,  // Store name for shadow users
            splits: [
                { 
                    user: receiverId,  // The CREDITOR receiving payment
                    userName: receiverName,  // Store name for shadow users
                    amount: amount, 
                    owed: amount 
                }
            ]
        });

        // Return success with optional warning
        const response = {
            ...expense.toObject(),
            warning: warningMessage
        };

        res.status(201).json(response);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { addExpense, updateExpense, deleteExpense, settleDebt, bulkSettleDebts };

// @desc    Bulk settle multiple debts
// @route   POST /api/groups/:groupId/settle/bulk
// @access  Private
const bulkSettleDebts = async (req, res) => {
    try {
        const { settlements } = req.body; // Array of { payerId, receiverId, amount, payerName, receiverName }
        const { groupId } = req.params;

        if (!Array.isArray(settlements) || settlements.length === 0) {
            res.status(400);
            throw new Error('Settlements array is required and must not be empty');
        }

        // Verify group exists
        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        const expensePromises = settlements.map(async (settlement) => {
            const { payerId, receiverId, amount, payerName, receiverName } = settlement;
            
            // Create settlement expense for each
            return GroupExpense.create({
                group: groupId,
                description: 'Settlement',
                amount,
                date: Date.now(),
                category: 'Settlement',
                paidBy: payerId,
                paidByName: payerName,
                splits: [
                    { 
                        user: receiverId, 
                        userName: receiverName,
                        amount: amount, 
                        owed: amount 
                    }
                ]
            });
        });

        const expenses = await Promise.all(expensePromises);

        res.status(201).json({ 
            message: `Successfully processed ${expenses.length} settlements`,
            settlements: expenses 
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
