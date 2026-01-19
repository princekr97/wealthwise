/**
 * Settlement Simplification Service
 * Server-side copy of client settlement calculator for PDF generation
 */

export const calculateSettlements = (balances, members) => {
  try {
    // Create member lookup
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
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([userId, balance]) => {
      if (Math.abs(balance) < 1) return;

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

    // Sort descending
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Calculate optimal settlements
    const settlements = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const paymentAmount = Math.min(creditor.amount, debtor.amount);

      if (paymentAmount >= 1) {
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
          amount: Math.round(paymentAmount * 100) / 100
        });
      }

      creditor.amount -= paymentAmount;
      debtor.amount -= paymentAmount;

      if (creditor.amount < 1) i++;
      if (debtor.amount < 1) j++;
    }

    return settlements;
  } catch (error) {
    console.error('Settlement calculation error:', error);
    return [];
  }
};

const getMemberId = (member) => {
  if (!member) return 'unknown';
  if (member.userId && typeof member.userId === 'object' && member.userId._id) {
    return String(member.userId._id);
  }
  if (member.userId) return String(member.userId);
  return String(member.email || member.phone || member.name);
};
