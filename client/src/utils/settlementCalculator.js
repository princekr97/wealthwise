/**
 * Settlement Simplification Service
 * 
 * Implements a greedy debt simplification algorithm.
 * Reduces complex multi-party debts into minimum number of payments.
 * 
 * Algorithm:
 * 1. Separate users into creditors (receive money) and debtors (pay money)
 * 2. Sort both by amount (descending)
 * 3. Greedily match largest debtor with largest creditor
 * 4. Repeat until all balances are zero
 * 
 * Example:
 * Input:  A=+1000, B=-400, C=+300, D=+500, E=-1400
 * Output: E→A=1000, E→D=400, B→C=300, B→D=100
 * 
 * Result: 4 payments instead of potentially 10+ individual settlements
 */

/**
 * Calculate optimal settlement suggestions for a group
 * @param {Object} balances - Map of userId → balance (positive = owed, negative = owes)
 * @param {Array} members - Array of group members with name/email/phone
 * @returns {Array} - Array of settlement suggestions
 */
export const calculateSettlements = (balances, members) => {
    try {
        // Create member lookup for quick access
        const memberMap = {};
        members.forEach(member => {
            const memberId = getMemberId(member);
            memberMap[memberId] = {
                id: memberId,
                name: member.name,
                email: member.email,
                phone: member.phone,
                userId: member.userId
            };
        });

        // Separate creditors and debtors
        const creditors = []; // People who should receive money
        const debtors = [];   // People who should pay money

        Object.entries(balances).forEach(([userId, balance]) => {
            // Skip negligible amounts (< ₹0.01 due to rounding)
            if (Math.abs(balance) < 0.01) return;

            if (balance > 0) {
                creditors.push({
                    userId,
                    amount: balance,
                    name: memberMap[userId]?.name || 'Unknown',
                    phone: memberMap[userId]?.phone,
                    email: memberMap[userId]?.email
                });
            } else if (balance < 0) {
                debtors.push({
                    userId,
                    amount: Math.abs(balance),
                    name: memberMap[userId]?.name || 'Unknown',
                    phone: memberMap[userId]?.phone,
                    email: memberMap[userId]?.email
                });
            }
        });

        // Sort descending by amount (greedy strategy)
        creditors.sort((a, b) => b.amount - a.amount);
        debtors.sort((a, b) => b.amount - a.amount);

        // Calculate optimal settlements
        const settlements = [];
        let i = 0; // creditor index
        let j = 0; // debtor index

        while (i < creditors.length && j < debtors.length) {
            const creditor = creditors[i];
            const debtor = debtors[j];

            // Calculate payment amount (minimum of what debtor owes and creditor is owed)
            const paymentAmount = Math.min(creditor.amount, debtor.amount);

            // Only record if payment is significant
            if (paymentAmount >= 0.01) {
                settlements.push({
                    from: {
                        userId: debtor.userId,
                        name: debtor.name,
                        phone: debtor.phone,
                        email: debtor.email
                    },
                    to: {
                        userId: creditor.userId,
                        name: creditor.name,
                        phone: creditor.phone,
                        email: creditor.email
                    },
                    amount: Math.round(paymentAmount * 100) / 100 // Round to 2 decimals
                });
            }

            // Update remaining amounts
            creditor.amount -= paymentAmount;
            debtor.amount -= paymentAmount;

            // Move to next if current is settled
            if (creditor.amount < 0.01) i++;
            if (debtor.amount < 0.01) j++;
        }

        return settlements;

    } catch (error) {
        console.error('Settlement calculation error:', error);
        throw new Error('Failed to calculate settlements');
    }
};

/**
 * Helper to get consistent member ID
 * @param {Object} member - Group member object
 * @returns {string} - Member ID
 */
const getMemberId = (member) => {
    if (!member) return 'unknown';
    if (member.userId && typeof member.userId === 'object' && member.userId._id) {
        return String(member.userId._id);
    }
    if (member.userId) return String(member.userId);
    return String(member.email || member.phone || member.name);
};

/**
 * Validate if all settlements will correctly zero out balances
 * @param {Array} settlements - Array of settlement suggestions
 * @returns {boolean} - True if math is correct
 */
export const validateSettlements = (settlements) => {
    const netChanges = {};

    settlements.forEach(settlement => {
        const { from, to, amount } = settlement;

        // Debtor pays (negative)
        netChanges[from.userId] = (netChanges[from.userId] || 0) - amount;

        // Creditor receives (positive)
        netChanges[to.userId] = (netChanges[to.userId] || 0) + amount;
    });

    // All net changes should be near zero
    return Object.values(netChanges).every(change => Math.abs(change) < 0.1);
};

/**
 * Format settlement for user-friendly display
 * @param {Object} settlement - Single settlement object
 * @returns {string} - Human-readable description
 */
export const formatSettlement = (settlement) => {
    const { from, to, amount } = settlement;
    return `${from.name} pays ${to.name} ₹${amount.toFixed(2)}`;
};
