/**
 * Date Range Utilities
 *
 * Shared helpers for building common reporting windows.
 */

/**
 * Get the start and end Date for a given month and year.
 * @param {number} year
 * @param {number} monthIndex - 0-based month index (0 = Jan).
 * @returns {{start: Date, end: Date}}
 */
export const getMonthRange = (year, monthIndex) => {
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
  return { start, end };
};

/**
 * Get the date range for the last N months including current month.
 * @param {number} months
 * @returns {{start: Date, end: Date}}
 */
export const getLastMonthsRange = (months) => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - (months - 1));
  start.setDate(1); // Start from the 1st day of that month
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999); // End at the last moment of today

  return { start, end };
};