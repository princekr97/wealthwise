/**
 * Dashboard Controller
 *
 * Aggregated overview for main dashboard cards and charts.
 */

import mongoose from 'mongoose';
import Expense from '../models/expenseModel.js';
import Income from '../models/incomeModel.js';
import Loan from '../models/loanModel.js';
import Investment from '../models/investmentModel.js';
import PersonalLending from '../models/personalLendingModel.js';
import { getLastMonthsRange } from '../utils/dateRange.js';

/**
 * GET /api/dashboard/summary
 * Returns high-level cards: income, expenses, savings, EMI due, debt ratio, savings rate.
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { start, end } = getLastMonthsRange(1);
    const { start: prevStart, end: prevEnd } = getLastMonthsRange(2);

    const [incomeAgg, expenseAgg, prevIncomeAgg, prevExpenseAgg, activeLoans, lendings] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: start, $lte: end }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: start, $lte: end }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Income.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: prevStart, $lte: prevEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: prevStart, $lte: prevEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Loan.find({ userId, status: 'active' }),
      PersonalLending.find({ userId })
    ]);

    const incomeTotal = incomeAgg[0]?.total || 0;
    const expenseTotal = expenseAgg[0]?.total || 0;
    const prevIncomeTotal = prevIncomeAgg[0]?.total || 0;
    const prevExpenseTotal = prevExpenseAgg[0]?.total || 0;
    const savings = incomeTotal - expenseTotal;

    // Calculate percentage changes
    const incomeChange = prevIncomeTotal === 0 ? (incomeTotal > 0 ? 100 : 0) : ((incomeTotal - prevIncomeTotal) / prevIncomeTotal) * 100;
    const expensesChange = prevExpenseTotal === 0 ? (expenseTotal > 0 ? 100 : 0) : ((expenseTotal - prevExpenseTotal) / prevExpenseTotal) * 100;
    const prevSavings = prevIncomeTotal - prevExpenseTotal;
    const savingsChange = prevSavings === 0 ? (savings > 0 ? 100 : 0) : ((savings - prevSavings) / Math.abs(prevSavings)) * 100;

    const monthlyEmiDue = activeLoans.reduce((sum, loan) => sum + loan.emiAmount, 0);
    const totalEmi = monthlyEmiDue;
    const monthlyIncome = incomeTotal;
    const debtToIncome = monthlyIncome === 0 ? 0 : (totalEmi / monthlyIncome) * 100;
    const savingsRate = monthlyIncome === 0 ? 0 : (savings / monthlyIncome) * 100;

    const toReceive = lendings
      .filter((l) => l.type === 'given' && l.status !== 'settled')
      .reduce((sum, l) => sum + l.amount, 0);

    const toPay = lendings
      .filter((l) => l.type === 'taken' && l.status !== 'settled')
      .reduce((sum, l) => sum + l.amount, 0);

    // Calculate health score (0-100)
    // 40% weight: Savings Rate (target: 20% of income)
    const savingsRateScore = Math.min(40, (savingsRate / 20) * 40);
    
    // 40% weight: Low Debt-to-Income (target: <30% is good, 0% is perfect)
    const debtScore = Math.max(0, 40 - (debtToIncome / 100) * 40);
    
    // 20% weight: Lending balance (positive if you lend more than borrow)
    const lendingScore = toReceive > toPay ? 20 : (toPay > 0 ? Math.max(0, 20 - ((toPay - toReceive) / Math.max(toPay, 1)) * 20) : 10);
    
    const healthScore = Math.round(Math.min(100, Math.max(0, savingsRateScore + debtScore + lendingScore)));

    res.json({
      period: { from: start, to: end },
      cards: {
        income: incomeTotal,
        expenses: expenseTotal,
        savings,
        emiDue: monthlyEmiDue,
        incomeChange: isFinite(incomeChange) ? Math.round(incomeChange * 100) / 100 : 0,
        expensesChange: isFinite(expensesChange) ? Math.round(expensesChange * 100) / 100 : 0,
        savingsChange: isFinite(savingsChange) ? Math.round(savingsChange * 100) / 100 : 0,
        loanCount: activeLoans.length
      },
      health: {
        score: healthScore,
        savingsRate: isFinite(savingsRate) ? Math.round(savingsRate * 100) / 100 : 0,
        debtToIncome: isFinite(debtToIncome) ? Math.round(debtToIncome * 100) / 100 : 0,
        toReceive,
        toPay
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/charts
 * Returns dataset for dashboard charts:
 * - expenseByCategory
 * - incomeVsExpenseTrend (6 months)
 */
export const getDashboardCharts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const months = 6;
    const { start, end } = getLastMonthsRange(months);

    const [expenseByCategory, incomeMonthly, expenseMonthly] = await Promise.all([
      Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        },
        { $sort: { total: -1 } }
      ]),
      Income.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: {
              y: { $year: '$date' },
              m: { $month: '$date' }
            },
            total: { $sum: '$amount' }
          }
        }
      ]),
      Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: {
              y: { $year: '$date' },
              m: { $month: '$date' }
            },
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const trendMap = new Map();

    const addToMap = (arr, key) => {
      arr.forEach((item) => {
        const year = item._id.y;
        const month = item._id.m;
        const id = `${year}-${month}`;
        const existing = trendMap.get(id) || { year, month, income: 0, expense: 0 };
        existing[key] = item.total;
        trendMap.set(id, existing);
      });
    };

    addToMap(incomeMonthly, 'income');
    addToMap(expenseMonthly, 'expense');

    const trend = Array.from(trendMap.values())
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .map((item) => ({
        label: `${item.month}/${String(item.year).slice(-2)}`,
        income: item.income,
        expense: item.expense
      }));

    res.json({
      expenseByCategory: expenseByCategory.map((c) => ({
        category: c._id,
        total: c.total
      })),
      incomeVsExpenseTrend: trend
    });
  } catch (err) {
    next(err);
  }
};