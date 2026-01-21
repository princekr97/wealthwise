/**
 * Number Utility Functions
 * Helper functions for number formatting and calculations
 */

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} Formatted currency string
 * @example
 * formatCurrency(1234.56) // "₹1,235"
 * formatCurrency(1234.56, 'USD') // "$1,235"
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places (default: 0)
 * @returns {number} Percentage (0-100)
 * @example
 * calculatePercentage(25, 100) // 25
 * calculatePercentage(33.33, 100, 1) // 33.3
 */
export const calculatePercentage = (value, total, decimals = 0) => {
  if (!total || total === 0) return 0;
  const percentage = (value / total) * 100;
  return Number(percentage.toFixed(decimals));
};

/**
 * Calculate sum of array of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Sum
 * @example
 * sum([1, 2, 3, 4]) // 10
 */
export const sum = (numbers) => {
  if (!Array.isArray(numbers)) return 0;
  return numbers.reduce((acc, num) => acc + (Number(num) || 0), 0);
};

/**
 * Calculate average of array of numbers
 * @param {Array<number>} numbers - Array of numbers
 * @returns {number} Average
 * @example
 * average([10, 20, 30]) // 20
 */
export const average = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
};

/**
 * Round number to specified decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {number} Rounded number
 * @example
 * roundTo(3.14159, 2) // 3.14
 */
export const roundTo = (num, decimals = 2) => {
  return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 * @example
 * formatLargeNumber(1500) // "1.5K"
 * formatLargeNumber(1500000) // "1.5M"
 */
export const formatLargeNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1e9) return sign + (absNum / 1e9).toFixed(1) + 'B';
  if (absNum >= 1e6) return sign + (absNum / 1e6).toFixed(1) + 'M';
  if (absNum >= 1e3) return sign + (absNum / 1e3).toFixed(1) + 'K';
  return sign + absNum.toString();
};

/**
 * Clamp number between min and max
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 * @example
 * clamp(150, 0, 100) // 100
 * clamp(-10, 0, 100) // 0
 */
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};
