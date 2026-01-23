import Group from '../models/groupModel.js';
import GroupExpense from '../models/groupExpenseModel.js';
import User from '../models/userModel.js';
import crypto from 'crypto';
import { getUserGroups } from '../services/shadowUserService.js';


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
            email: req.user.email,
            phone: req.user.phoneNumber // Include phone from authenticated user
        });

        if (members && members.length > 0) {
            for (const member of members) {
                // Find if user exists by email or phone
                let user;
                if (member.email) {
                    user = await User.findOne({ email: member.email });
                }
                if (!user && member.phone) {
                    user = await User.findOne({ phoneNumber: member.phone });
                }

                if (user) {
                    processedMembers.push({
                        userId: user._id,
                        name: user.name,
                        email: user.email || member.email,
                        phone: user.phoneNumber || member.phone // Save phone too
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

// @desc    Get user's groups (created OR member of, including shadow-linked)
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
    try {
        // Get user details for shadow matching
        const user = await User.findById(req.user._id);
        
        // Use enhanced service that finds:
        // 1. Groups user created
        // 2. Groups where user is a registered member
        // 3. Groups where user was added as shadow and now linked
        const groups = await getUserGroups(
            req.user._id,
            user.email,
            user.phoneNumber
        );

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

        // Check if user is a member (including shadow user matching)
        const user = await User.findById(req.user._id);
        const isMember = group.members.some((member) => {
            // Direct userId match
            if (member.userId && member.userId.toString() === req.user._id.toString()) {
                return true;
            }
            // Shadow user match by email
            if (user.email && member.email && member.email.toLowerCase() === user.email.toLowerCase()) {
                return true;
            }
            // Shadow user match by phone
            if (user.phoneNumber && member.phone && member.phone === user.phoneNumber) {
                return true;
            }
            return false;
        }) || group.createdBy.toString() === req.user._id.toString();

        if (!isMember) {
            res.status(403);
            throw new Error('Not authorized to access this group');
        }

        // Fetch expenses
        const expenses = await GroupExpense.find({ group: req.params.id })
            .populate('paidBy', 'name email')
            .populate('splits.user', 'name email')
            .sort({ date: -1, createdAt: -1 });

        // Fix expenses for shadow members - ensure we don't lose IDs when populate fails
        const fixedExpenses = expenses.map(exp => {
            const rawPaidBy = exp.get('paidBy', null, { getters: false }); // Original ID
            const expense = exp.toObject();

            // Fix paidBy if populate failed (common for shadow members)
            if (!expense.paidBy || !expense.paidBy.name) {
                // Use stored paidByName if available, and restore the original ID
                if (expense.paidByName) {
                    expense.paidBy = { _id: rawPaidBy, name: expense.paidByName };
                } else {
                    // Fallback: look up in group members using the raw ID
                    const payer = group.members.find(m => {
                        const mId = m.userId?._id?.toString() || m.userId?.toString() || m._id?.toString();
                        return mId === rawPaidBy?.toString();
                    });
                    
                    if (payer) {
                        expense.paidBy = { _id: rawPaidBy, name: payer.name, email: payer.email };
                    } else if (rawPaidBy) {
                        // Last resort: just keep the ID
                        expense.paidBy = { _id: rawPaidBy, name: 'Unknown' };
                    }
                }
            }

            // Fix splits similarly
            expense.splits = expense.splits.map((split, index) => {
                const rawSplitUser = exp.splits[index].get('user', null, { getters: false }); // Original ID

                if (!split.user || !split.user.name) {
                    if (split.userName) {
                        split.user = { _id: rawSplitUser, name: split.userName };
                    } else {
                        const member = group.members.find(m => {
                            const mId = m.userId?._id?.toString() || m.userId?.toString() || m._id?.toString();
                            return mId === rawSplitUser?.toString();
                        });
                        
                        if (member) {
                            split.user = { _id: rawSplitUser, name: member.name, email: member.email };
                        } else if (rawSplitUser) {
                            split.user = { _id: rawSplitUser, name: 'Unknown' };
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

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
const addMemberToGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        const { name, email, phone } = req.body;

        if (!name || !phone) {
             res.status(400);
             throw new Error('Name and Phone are required');
        }

        // Check if user exists
        let user;
        if (email) {
            user = await User.findOne({ email });
        }
        if (!user && phone) {
            user = await User.findOne({ phoneNumber: phone });
        }

        let newMember;
        if (user) {
            newMember = {
                userId: user._id,
                name: user.name,
                email: user.email || email,
                phone: user.phoneNumber || phone
            };
        } else {
             // Shadow member
             const identifier = email || phone;
             const shadowUserId = crypto.createHash('sha256')
                        .update(identifier + req.params.id) // Scope to group to avoid cross-group ID collisions
                        .digest('hex')
                        .substring(0, 24);

            newMember = {
                userId: shadowUserId,
                name: name,
                email: email,
                phone: phone,
                isShadowUser: true
            };
        }

        // Check duplicates
        const exists = group.members.some(m => 
            (m.userId && m.userId.toString() === newMember.userId.toString()) ||
            (m.phone === phone)
        );

        if (exists) {
            res.status(400);
            throw new Error('Member already in group');
        }

        group.members.push(newMember);
        await group.save();

        res.json(group);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Remove member from group (safe with balance check)
// @route   DELETE /api/groups/:id/members/:memberId
// @access  Private
const removeMember = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        // Check if user is a member of the group
        const isMember = group.members.some(
            (member) => member.userId && member.userId.toString() === req.user._id.toString()
        ) || group.createdBy.toString() === req.user._id.toString();

        if (!isMember) {
            res.status(403);
            throw new Error('Not authorized to remove members');
        }

        const memberIdToRemove = req.params.memberId;

        // Check if member exists
        const memberIndex = group.members.findIndex(m => 
            (m.userId && m.userId.toString() === memberIdToRemove) || 
            (m._id && m._id.toString() === memberIdToRemove) ||
            (m.userId === memberIdToRemove) // For shadow users
        );

        if (memberIndex === -1) {
            res.status(404);
            throw new Error('Member not found in group');
        }

        const memberToRemove = group.members[memberIndex];
        // Helper for robust ID extraction
        const getSafeId = (obj) => {
            if (!obj) return null;
            if (typeof obj === 'string') return obj;
            if (obj._id) return obj._id.toString();
            return obj.toString();
        };

        const targetUserId = getSafeId(memberToRemove.userId) || getSafeId(memberToRemove._id);

        // ============================================
        // CRITICAL: Calculate member's balance
        // ============================================
        // FIX: Exclude deleted expenses! phantom debt shouldn't block removal
        const allExpenses = await GroupExpense.find({ 
            group: group._id,
            isDeleted: { $ne: true } 
        });
        
        let memberBalance = 0;
        let paidTotal = 0;
        let owedTotal = 0;

        console.log(`\n🔍 Calculating balance for member: ${memberToRemove.name} (ID: ${targetUserId})`);
        console.log(`📊 Total expenses to check: ${allExpenses.length}`);

        for (const exp of allExpenses) {
            const payerId = getSafeId(exp.paidBy);
            
            // If this member paid the expense, they are owed (+)
            if (payerId === targetUserId) {
                paidTotal += exp.amount;
                memberBalance += exp.amount;
                console.log(`  ✅ Paid: ₹${exp.amount} (${exp.description || exp.category})`);
            }

            // If this member is in splits, they owe (-)
            if (exp.splits) {
                exp.splits.forEach(split => {
                    const splitUserId = getSafeId(split.user);
                    if (splitUserId === targetUserId) {
                        owedTotal += split.amount;
                        memberBalance -= split.amount;
                        console.log(`  ❌ Owes: ₹${split.amount} (${exp.description || exp.category})`);
                    }
                });
            }
        }

        console.log(`\n💰 Final Balance Calculation:`);
        console.log(`   Total Paid: ₹${paidTotal.toFixed(2)}`);
        console.log(`   Total Owed: ₹${owedTotal.toFixed(2)}`);
        console.log(`   Net Balance: ₹${memberBalance.toFixed(2)}`);
        console.log(`   Absolute Balance: ₹${Math.abs(memberBalance).toFixed(2)}`);

        // BLOCK removal if unsettled balance (with ₹5 tolerance for rounding/settlement errors)
        if (Math.abs(memberBalance) > 5) {
            res.status(400);
            const owesOrOwed = memberBalance > 0 ? 'is owed' : 'owes';
            throw new Error(
                `Cannot remove member with unsettled balance. ${memberToRemove.name} ${owesOrOwed} ₹${Math.abs(memberBalance).toFixed(2)}. Please settle all debts first.`
            );
        }

        // Safe to remove: Balance is settled
        // Remove member from array
        group.members.splice(memberIndex, 1);
        await group.save();

        res.json({ 
            message: 'Member removed successfully', 
            removedMemberId: targetUserId,
            finalBalance: memberBalance.toFixed(2)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add multiple members to group
// @route   POST /api/groups/:id/members/bulk
// @access  Private
const addMembersToGroupBulk = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        const { members } = req.body; // Expect array of { name, email, phone }

        if (!Array.isArray(members) || members.length === 0) {
            res.status(400);
            throw new Error('Members array is required');
        }

        const addedMembers = [];
        const errors = [];

        for (const memberData of members) {
            const { name, email, phone } = memberData;

            if (!name || !phone) {
                errors.push({ name, error: 'Name and Phone required' });
                continue;
            }

            // Check if user exists
            let user;
            if (email) user = await User.findOne({ email });
            if (!user && phone) user = await User.findOne({ phoneNumber: phone });

            let newMember;
            if (user) {
                newMember = {
                    userId: user._id,
                    name: user.name,
                    email: user.email || email,
                    phone: user.phoneNumber || phone
                };
            } else {
                // Shadow member
                const identifier = email || phone;
                const shadowUserId = crypto.createHash('sha256')
                    .update(identifier + req.params.id)
                    .digest('hex')
                    .substring(0, 24);

                newMember = {
                    userId: shadowUserId,
                    name: name,
                    email: email,
                    phone: phone,
                    isShadowUser: true
                };
            }

            // Check duplicates in current group state
            const exists = group.members.some(m => 
                (m.userId && m.userId.toString() === newMember.userId.toString()) ||
                (m.phone === phone)
            );

            if (!exists) {
                group.members.push(newMember);
                addedMembers.push(newMember);
            } else {
                errors.push({ name, error: 'Member already in group' });
            }
        }

        if (addedMembers.length > 0) {
            await group.save();
        }

        res.json({
            message: `Successfully added ${addedMembers.length} members`,
            added: addedMembers,
            errors: errors.length > 0 ? errors : undefined,
            group
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { 
    createGroup, 
    getGroups, 
    getGroupDetails, 
    updateGroup, 
    deleteGroup, 
    addMemberToGroup, 
    addMembersToGroupBulk,
    removeMember 
};
