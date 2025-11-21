/**
 * Formatters
 *
 * Common formatting helpers for currency, dates, and percentages.
 */

export const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

export const formatCurrencyShort = (value) => {
  const num = Number(value) || 0;
  if (num >= 1_00_00_000) {
    return `₹${(num / 1_00_00_000).toFixed(1)}Cr`;
  }
  if (num >= 1_00_000) {
    return `₹${(num / 1_00_000).toFixed(1)}L`;
  }
  if (num >= 1_000) {
    return `₹${(num / 1_000).toFixed(1)}K`;
  }
  return `₹${num.toFixed(0)}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatPercent = (value, decimals = 1) => {
  const num = Number(value) || 0;
  return `${num.toFixed(decimals)}%`;
};