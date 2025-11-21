/**
 * Investment Utilities
 *
 * Helpers for returns calculations.
 */

/**
 * Calculate absolute and percentage return.
 * @param {number} invested
 * @param {number} current
 */
export const calculateReturn = (invested, current) => {
  const absolute = current - invested;
  const percent = invested === 0 ? 0 : (absolute / invested) * 100;
  return { absolute, percent };
};