/**
 * Loan Utilities
 *
 * Helpers for EMI and balances.
 */

/**
 * Calculate EMI using standard formula.
 * @param {number} principal
 * @param {number} annualRate - e.g. 10 = 10%
 * @param {number} tenureMonths
 * @returns {number}
 */
export const calculateEmi = (principal, annualRate, tenureMonths) => {
  const monthlyRate = annualRate / (12 * 100);
  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
};

/**
 * Recalculate remaining balance given payments.
 * For now: principal - sum(payments). (simple)
 * @param {number} principal
 * @param {Array<{amount:number}>} payments
 * @returns {number}
 */
export const calculateRemainingBalance = (principal, payments) => {
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = principal - paid;
  return remaining < 0 ? 0 : remaining;
};