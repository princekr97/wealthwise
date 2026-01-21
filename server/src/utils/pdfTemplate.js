/**
 * Complete Trip Expense Report - Enhanced Version
 * Uses same settlement logic as the app for consistency.
 * 
 * @module pdfTemplate
 */

import { calculateSettlements } from './settlementCalculator.js';
import { getHeaderImageBase64 } from './imageHelper.js';

// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================

const CATEGORY_COLORS = {
  'Food': '#10b981', 'Dining': '#10b981',
  'Groceries': '#84cc16',
  'Travel': '#3b82f6', 'Transport': '#0ea5e9',
  'Stays': '#8b5cf6', 'Accommodation': '#8b5cf6',
  'Entertainment': '#f59e0b', 'Movies': '#f59e0b',
  'Bills': '#ef4444', 'Utilities': '#ef4444',
  'Health': '#be185d', 'Medical': '#be185d',
  'Drinks': '#f97316', 'Party': '#f97316',
  'Gifts': '#14b8a6',
  'Shopping': '#db2777',
  'Misc.': '#64748b', 'Others': '#64748b',
  'Payment': '#6366f1',
  'Fuel': '#eab308', 'Maintenance': '#78716c'
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * HTML Escape Helper
 * Prevents XSS and rendering issues
 * @param {string} text 
 * @returns {string} escaped text
 */
const escape = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Generate Avatar URL using DiceBear API - unique per user
 * @param {string} name - User name
 * @param {string} userId - User ID for uniqueness
 * @returns {string} Avatar URL
 */
const getAvatarUrl = (name, userId = '') => {
  const seed = userId || name || 'Unknown';
  const safeName = encodeURIComponent(seed);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'feca57', 'ff6b6b', 'ee5a6f', '4ecdc4', '45b7d1', '96ceb4', 'dfe6e9', 'fab1a0', 'fdcb6e', '6c5ce7', 'a29bfe', 'fd79a8', '55efc4', '81ecec'];
  const bgColor = colors[hash % colors.length];
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${safeName}&backgroundColor=${bgColor}`;
};

/**
 * Get Category Color
 * Returns predefined color or generates a consistent hash color
 * @param {string} category 
 * @returns {string} Hex or HSL color
 */
const getCategoryColor = (category) => {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash % 360)}, 70%, 45%)`;
};

/**
 * Get readable Member ID
 * @param {object} m - Member object
 * @returns {string} Member ID
 */
const getMemberId = (m) => m?.userId?._id || m?.userId || m?._id || m?.email;

/**
 * Format Date Range
 * @param {Array} expenses 
 * @param {string} createdAt 
 * @returns {string} Formatted date range (e.g., "Jan 12 - Jan 15, 2026")
 */
const getTripDateRange = (expenses, createdAt) => {
  let startDate = new Date(createdAt);
  let endDate = new Date();

  if (expenses.length > 0) {
    const dates = expenses.map(e => new Date(e.date).getTime());
    startDate = new Date(Math.min(...dates));
    endDate = new Date(Math.max(...dates));
  }

  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${fmt(startDate)} - ${fmt(endDate)}, ${endDate.getFullYear()}`;
};

// ==========================================
// SECTIONS RENDERERS
// ==========================================

/**
 * Render Header Metadata
 * @param {object} params
 * @param {object} params.group - Group data
 * @param {number} params.totalSpending - Total spending amount
 * @param {string} params.tripDateRange - Formatted trip date range
 * @param {string} params.headerBgImage - Base64 encoded header background image
 * @returns {string} HTML string for the header section
 */
const renderHeader = ({ group, totalSpending, tripDateRange, headerBgImage }) => `
  <div class="header-banner" style="background-image: url('${headerBgImage}');">
    <h1>TRIP EXPENSE REPORT</h1>
    <div class="subtitle">${escape(group.name)}</div>
    <div class="header-meta">
      <span>Trip Date: ${tripDateRange}</span>
      <span>Participants: ${group.members.length}</span>
      <span>Total: Rs. ${totalSpending.toFixed(2)}</span>
    </div>
  </div>
`;

/**
 * Render Financial Cards
 * @param {number} total - Total group spending
 * @param {number} perPerson - Per person share
 * @returns {string} HTML string for financial summary cards
 */
const renderFinancialCards = (total, perPerson) => `
  <div class="cards">
    <div class="card card-blue">
      <div class="card-label">Total Group Spending</div>
      <div class="card-value">Rs. ${total.toFixed(2)}</div>
    </div>
    <div class="card card-green">
      <div class="card-label">Per Person Share</div>
      <div class="card-value">Rs. ${perPerson.toFixed(2)}</div>
    </div>
  </div>
`;

/**
 * Render Payment Details (Quick Contact for Payees)
 */
const renderPaymentDetails = (group, balances) => {
  // Find members who are owed money (Positive Balance)
  const payees = group.members.filter(m => {
    const bal = balances[getMemberId(m)] || 0;
    return bal > 10; // Only significant amounts
  });

  if (!payees.length) return '';

  const payeeCards = payees.map(m => {
    const phone = m.phoneNumber || m.phone || m.mobile || '';
    if (!phone) return ''; // Skip if no number
    
    return `
      <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:10px 14px; display:flex; align-items:center; gap:10px;">
        <img src="${getAvatarUrl(m.name, getMemberId(m))}" width="28" height="28" style="border-radius:50%;">
        <div>
          <div style="font-size:11px; font-weight:700; color:#166534;">Pay to ${escape(m.name)}</div>
          <div style="font-size:10px; color:#15803d;">${escape(phone)}</div>
        </div>
      </div>
    `;
  }).join('');

  if (!payeeCards) return '';

  return `
    <div style="margin-bottom:24px;">
      <div style="font-size:11px; font-weight:700; color:#64748b; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">
        Payment Details (Pay via UPI/Cash)
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        ${payeeCards}
      </div>
    </div>
  `;
};

// ... inside generateTripReportHTML ...
// Call it: ${renderPaymentDetails(group, balances)}


/**
 * Render Participants Section
 * @param {object} group - Group data
 * @param {object} balances - Balances for each member
 * @param {Array<object>} expenses - List of expenses
 * @returns {string} HTML string for participants and their contributions
 */
const renderParticipants = (group, balances, expenses) => {
  const items = group.members.map(m => {
    const memberId = getMemberId(m);
    const balance = balances[memberId] || 0;

    // Robust matching
    const idsToCheck = [m._id, m.userId, m.userId?._id, m.email].filter(Boolean).map(String);
    const totalPaid = expenses
      .filter(exp => {
        const pId = exp.paidBy?._id || exp.paidBy;
        return idsToCheck.includes(String(pId));
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const impliedShare = totalPaid - balance;
    
    // Styling states
    const isCredit = balance > 0.1;
    const isDebit = balance < -0.1;
    
    const boxColor = isCredit ? '#f0fdf4' : isDebit ? '#fef2f2' : '#f8fafc';
    const borderColor = isCredit ? '#86efac' : isDebit ? '#fca5a5' : '#cbd5e1';
    const textColor = isCredit ? '#15803d' : isDebit ? '#b91c1c' : '#64748b';
    const statusText = isCredit ? 'GETS BACK' : isDebit ? 'TO PAY' : 'SETTLED';
    const statusVal = isCredit ? `+${balance.toFixed(0)}` : isDebit ? `${balance.toFixed(0)}` : '✓';

    const phone = m.phoneNumber || m.phone || m.mobile || 'N/A';
    const email = m.email && m.email !== 'null' ? ` • ${m.email}` : '';

    return `
      <div style="background:${boxColor}; border:1px solid ${borderColor}; border-radius:12px; padding:12px; display:flex; align-items:flex-start; gap:10px;">
        <div style="flex-shrink:0; margin-top: 4px;">
          <img src="${getAvatarUrl(m.name, memberId)}" width="36" height="36" style="border-radius:50%; display:block">
        </div>
        <div style="flex:1;">
          <div style="font-weight:700; font-size:12px; color:#0f172a; margin-bottom:2px">${escape(m.name)}</div>
          <div style="font-size:9px; color:#64748b; margin-bottom:4px;">${escape(phone)}${escape(email)}</div>
          <div style="font-size:10px; color:#334155; line-height:1.4; border-top: 1px solid ${borderColor}; padding-top: 4px;">
            Paid: <strong>Rs. ${totalPaid.toFixed(0)}</strong><br>
            Spent: Rs. ${impliedShare.toFixed(0)}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="color:${textColor}; font-weight:800; font-size:12px">${statusVal}</div>
          <div style="font-size:9px; color:${textColor}; opacity:0.8; font-weight:600">${statusText}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <h2>Trip Participants & Contributions</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 30px;">
      ${items}
    </div>
  `;
};

/**
 * Render Settlement Instructions
 * @param {Array<object>} instructions - List of settlement instructions
 * @param {object} group - Full group object for looking up phones
 * @returns {string} HTML string for settlement instructions
 */
const renderSettlements = (instructions, group) => {
  if (!instructions.length) return '';

  const cards = instructions.map(inst => {
    // Lookup members for userId
    const fromMember = group.members.find(m => m.name === inst.from.name) || inst.from;
    const toMember = group.members.find(m => m.name === inst.to.name) || inst.to;
    const phone = toMember.phoneNumber || toMember.phone || toMember.mobile || '';
    const fromId = inst.from.userId || getMemberId(fromMember);
    const toId = inst.to.userId || getMemberId(toMember);

    return `
      <div class="settlement-card">
        <!-- Payer -->
        <div class="settlement-user">
          <img class="settlement-avatar" src="${getAvatarUrl(inst.from.name, fromId)}" width="36" height="36">
          <div class="settlement-name">${escape(inst.from.name)}</div>
        </div>
        
        <!-- Amount -->
        <div class="settlement-amount">
          <div class="amount-value">Rs. ${inst.amount.toFixed(0)}</div>
          <div class="arrow-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
          ${phone ? `<div style="font-size:9px; color:#bfdbfe; margin-top:4px;">Pay to: ${escape(phone)}</div>` : ''}
        </div>
        
        <!-- Payee -->
        <div class="settlement-user">
          <img class="settlement-avatar" src="${getAvatarUrl(inst.to.name, toId)}" width="36" height="36">
          <div class="settlement-name">${escape(inst.to.name)}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <h2>Settlement Plan - Who Pays Whom</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">${cards}</div>
  `;
};

/**
 * Render Category Breakdown
 * @param {Array<object>} expenses - List of expenses
 * @param {number} totalSpending - Total group spending
 * @returns {string} HTML string for category breakdown cards
 */
const renderCategories = (expenses, totalSpending) => {
  const totals = {};
  expenses.forEach(e => {
    if (e.category !== 'Settlement') {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    }
  });

  // Handle empty categories
  if (Object.keys(totals).length === 0) {
    return `
      <h2>Category-wise Breakdown</h2>
      <div style="text-align:center; padding:20px; color:#94a3b8; font-size:11px;">
        No expense categories to display
      </div>
    `;
  }

  const cards = Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => {
      const percentage = ((amt / totalSpending) * 100).toFixed(1);
      const color = getCategoryColor(cat);
      
      return `
        <div style="background:white; border:1px solid #e2e8f0; border-radius:10px; padding:12px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="badge" style="background:${color}; min-width:auto; padding:3px 8px; font-size:10px;">${escape(cat)}</span>
            <span style="font-size:10px; color:#64748b; font-weight:600">${percentage}%</span>
          </div>
          <div style="font-size:16px; font-weight:700; color:#1e293b; margin-bottom:4px;">Rs. ${amt.toFixed(0)}</div>
          <div style="background:#f1f5f9; height:4px; border-radius:2px; width:100%; overflow:hidden;">
            <div style="background:${color}; height:100%; width:${percentage}%; border-radius:2px;"></div>
          </div>
        </div>
      `;
    }).join('');

  return `
    <h2>Category-wise Breakdown</h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">${cards}</div>
  `;
};

/**
 * Render Transaction History
 * @param {Array<object>} expenses - List of expenses
 * @returns {string} HTML string for transaction history
 */
const renderTransactions = (expenses) => {
  // Filter out Settlement expenses
  const nonSettlementExpenses = expenses.filter(e => e.category !== 'Settlement');
  
  // Handle empty transactions
  if (nonSettlementExpenses.length === 0) {
    return `
      <h2>Transaction History</h2>
      <div style="text-align:center; padding:20px; color:#94a3b8; font-size:11px;">
        No transactions to display
      </div>
    `;
  }
  
  const list = nonSettlementExpenses.map(e => {
    const catColor = getCategoryColor(e.category);
    const dateObj = new Date(e.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('en-IN', { month: 'short' });
    const time = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return `
      <div style="background:white; border:1px solid #e2e8f0; border-left: 4px solid ${catColor}; border-radius:10px; padding:12px; margin-bottom:0; box-shadow:0 1px 2px rgba(0,0,0,0.03); display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; text-align:center; min-width:45px;">
            <div style="font-size:10px; color:#64748b; text-transform:uppercase; line-height:1;">${month}</div>
            <div style="font-size:14px; font-weight:700; color:#334155;">${day}</div>
          </div>
          <div>
            <div style="font-size:13px; font-weight:600; color:#1e293b; margin-bottom:3px;">${escape(e.description)}</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge" style="background:${catColor}; padding:2px 8px; font-size:9px; border-radius:4px; min-width:auto;">${escape(e.category)}</span>
              <span style="font-size:10px; color:#94a3b8;">${time} • Paid by ${escape(e.paidBy?.name || 'Unknown')}</span>
            </div>
          </div>
        </div>
        <div style="font-size:14px; font-weight:700; color:#1e293b;">Rs. ${e.amount.toFixed(0)}</div>
      </div>
    `;
  }).join('');

  return `
    <h2>Transaction History</h2>
    <div style="display:flex; flex-direction:column; gap:8px;">${list}</div>
  `;
};

/**
 * Render Footer Section
 * @returns {string} HTML string for the footer
 */
const renderFooter = () => `
  <div class="footer">
    <div class="reminder-box">
      <h4>Important Reminders</h4>
      <ul>
        <li>Please settle your dues within 7 days</li>
        <li>Mark transactions as settled after payment</li>
        <li>Keep screenshot of payment for reference</li>
        <li>Contact trip organizer for any disputes</li>
      </ul>
    </div>
    <div class="credits">
      Designed & Developed by <span style="color:#3b82f6;font-weight:600">Prince Gupta</span> •
      ${new Date().toLocaleDateString('en-IN')} •
      Report ID: TRI-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}
    </div>
  </div>
`;

// ==========================================
// MAIN GENERATOR
// ==========================================

/**
 * Generates a complete HTML trip expense report.
 * @param {object} data - The data object containing group, expenses, and balances.
 * @param {object} data.group - The group details.
 * @param {Array<object>} data.expenses - List of expenses.
 * @param {object} data.balances - Balances for each member.
 * @returns {string} The full HTML content of the trip report.
 */
export const generateTripReportHTML = (data) => {
  const { group, expenses, balances } = data;
  const headerBgImage = getHeaderImageBase64();

  // Calculations
  const totalSpending = expenses.reduce((sum, e) => (e.category !== 'Settlement' ? sum + e.amount : sum), 0);
  const perPerson = totalSpending / (group.members.length || 1);
  const settlementsInstructions = calculateSettlements(balances, group.members);
  const tripDateRange = getTripDateRange(expenses, group.createdAt);

  // Render Full HTML
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trip Report - ${escape(group.name)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* RESET & BASE */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 0;
      color: #1e293b;
      line-height: 1.4;
      font-size: 12px;
      width: 100%;
      background: #fff;
    }
    
    /* LAYOUT UTILS */
    .container { 
      width: 100%;
      max-width: 210mm; /* Force A4 Width */
      margin: 0 auto; 
      padding: 20px; 
    }
    
    /* HEADER STYLES */
    .header-banner {
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      color: white;
      padding: 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header-banner::before {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0; height: 50%;
      background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
    }
    .header-banner h1 {
      font-size: 32px;
      margin: 0 0 10px 0;
      font-weight: 800;
      position: relative;
      z-index: 1;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3); /* Solid text for copying */
      display: inline-block;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.4);
    }
    .header-banner .subtitle {
      display: block;
      font-size: 28px;
      color: #ffffff;
      margin-top: 15px;
      margin-bottom: 25px;
      font-weight: 300;
      text-transform: uppercase;
      letter-spacing: 6px;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .header-meta {
      display: flex;
      justify-content: center;
      gap: 24px;
      font-size: 11px;
      opacity: 0.95;
      position: relative;
      z-index: 1;
    }

    /* COMPONENT STYLES */
    h2 {
      font-size: 14px;
      margin: 24px 0 12px;
      color: #0f172a;
      padding-bottom: 6px;
      border-bottom: 2px solid #e2e8f0;
      font-weight: 700;
    }

    /* Financial Cards */
    .cards { display: flex; gap: 12px; margin: 0 0 24px 0; }
    .card {
      flex: 1; padding: 18px; border-radius: 10px; color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .card-green { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .card-label { font-size: 10px; opacity: 0.95; margin-bottom: 4px; }
    .card-value { font-size: 22px; font-weight: 700; }

    /* Settlement Cards */
    .settlement-card {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 12px;
      display: grid;
      grid-template-columns: 110px 1fr 110px;
      align-items: center;
      gap: 10px;
      color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .settlement-user {
      display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%;
    }
    .settlement-avatar { margin-bottom: 6px; border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; }
    .settlement-name { font-weight: 700; font-size: 12px; line-height: 1.2; }
    .settlement-amount { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; }
    .amount-value { font-size: 18px; font-weight: 800; color: #bfdbfe; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
    .arrow-icon { margin: 3px 0; color: rgba(255,255,255,0.6); }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 9px;
      font-weight: 600;
      color: white;
      min-width: 80px;
      text-align: center;
    }

    /* Reminder Box */
    .reminder-box {
      background: #eff6ff;
      border-left: 3px solid #3b82f6;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .reminder-box h4 {
      font-size: 11px;
      color: #1e40af;
      margin-bottom: 6px;
    }
    .reminder-box ul {
      list-style: none;
      font-size: 10px;
      color: #1e40af;
      line-height: 1.6;
    }
    .reminder-box li::before {
      content: "• ";
      margin-right: 5px;
    }

    /* Footer */
    .footer { margin-top: 25px; padding-top: 15px; border-top: 2px solid #e2e8f0; }
    .credits { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 12px; }
  </style>
</head>
<body>
  ${renderHeader({ group, totalSpending, tripDateRange, headerBgImage })}
  
  <div class="container">
    ${renderFinancialCards(totalSpending, perPerson)}
    ${renderPaymentDetails(group, balances)}
    ${renderParticipants(group, balances, expenses)}
    ${renderSettlements(settlementsInstructions, group)}
    ${renderCategories(expenses, totalSpending)}
    ${renderTransactions(expenses)}

    <div class="footer">
      <div class="reminder-box">
        <h4>Important Reminders</h4>
        <ul>
          <li>Please settle your dues within 7 days</li>
          <li>Mark transactions as settled after payment</li>
          <li>Keep screenshot of payment for reference</li>
          <li>Contact trip organizer for any disputes</li>
        </ul>
      </div>
      <div class="credits">
        Designed & Developed by <span style="color:#3b82f6;font-weight:600">Prince Gupta</span> •
        ${new Date().toLocaleDateString('en-IN')} •
        Report ID: TRI-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}
      </div>
    </div>
  </div>
</body>
</html>`;
};
