/**
 * Dashboard Page
 *
 * Financial overview with summary cards, charts, and health metrics.
 * Uses standardized layout components for consistency.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Skeleton,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Info as InfoIcon } from '@mui/icons-material';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { useAuthStore } from '../store/authStore';

// Standardized layout components
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import SummaryCard from '../components/layout/SummaryCard';
import SummaryCardGrid from '../components/layout/SummaryCardGrid';
import ChartCard, { ChartGrid, EmptyChartState, CategoryLegend } from '../components/layout/ChartCard';
import PageLoader from '../components/common/PageLoader';

const CATEGORY_COLORS = [
  '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#6B7280', '#A78BFA', '#0EA5E9',
  '#6366F1', '#F59E0B', '#14B8A6'
];

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const user = useAuthStore((state) => state.user);

  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c] = await Promise.all([
          dashboardService.summary(),
          dashboardService.charts()
        ]);
        setSummary(s);
        setCharts(c);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Loading state with PageLoader
  if (loading) {
    return <PageLoader message="Loading Dashboard..." />;
  }

  const cards = summary?.cards || {};
  const health = summary?.health || {};
  const expenseCat = charts?.expenseByCategory || [];
  const incomeVsExpense = charts?.incomeVsExpenseTrend || [];

  // Dynamic chart height based on breakpoint
  const chartHeight = isMobile ? 250 : (isTablet ? 280 : 320);

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title={`👋 Welcome Back, ${user?.name?.split(' ')[0] || 'Investor'}!`}
        subtitle="Your financial overview at a glance"
        rightContent={
          <Card sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 1.5 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', animation: 'pulse 2s infinite' }} />
              <MuiTooltip
                title="Financial Health Score (0-100): 40% Savings Rate + 40% Low Debt-to-Income + 20% Positive Net Lending"
                arrow
                placement="bottom"
                enterTouchDelay={0}
                leaveTouchDelay={3000}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.85rem' },
                    cursor: 'pointer',
                    opacity: 0.8,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  Health: <span style={{ color: theme.palette.primary.main }}>{health.score || 0}/100</span>
                </Typography>
              </MuiTooltip>
            </Stack>
          </Card>
        }
      />

      {/* Summary Cards - 2x2 Grid */}
      <SummaryCardGrid columns={4}>
        <SummaryCard
          icon="💰"
          label="Total Income"
          value={formatCurrency(cards.income || 0)}
          valueColor="success"
          trend={cards.incomeChange ? `${cards.incomeChange > 0 ? '+' : ''}${cards.incomeChange.toFixed(1)}%` : undefined}
          tooltip="Total earnings this month from all sources like Salary, Freelance, and Investments."
        />
        <SummaryCard
          icon="💸"
          label="Total Expenses"
          value={formatCurrency(cards.expenses || 0)}
          valueColor="error"
          trend={cards.expensesChange ? `${cards.expensesChange > 0 ? '+' : ''}${cards.expensesChange.toFixed(1)}%` : undefined}
          tooltip="Total spending this month across all categories like Food, Bills, and Rent."
        />
        <SummaryCard
          icon="🏦"
          label="Net Savings"
          value={formatCurrency(cards.savings || 0)}
          valueColor={(cards.savings || 0) >= 0 ? "success" : "error"}
          trend={cards.savingsChange ? `${cards.savingsChange > 0 ? '+' : ''}${cards.savingsChange.toFixed(1)}%` : undefined}
          tooltip="Calculated as Total Income - Total Expenses. This is your actual surplus for the month."
        />
        <SummaryCard
          icon="📌"
          label="EMI Due"
          value={formatCurrency(cards.emiDue || 0)}
          valueColor="warning"
          subtitle={cards.loanCount ? `${cards.loanCount} active loans` : undefined}
          tooltip="Total monthly EMI commitment for all your active loans and liabilities."
        />
      </SummaryCardGrid>

      {/* Charts */}
      <ChartGrid>
        {/* Expense Breakdown */}
        <ChartCard
          title="📂 Expense Breakdown"
          subtitle={expenseCat.length > 0 ? `${expenseCat.length} categories` : undefined}
          height={chartHeight}
          footer={expenseCat.length > 0 ? (
            <CategoryLegend data={expenseCat} colors={CATEGORY_COLORS} formatter={formatCurrency} />
          ) : undefined}
        >
          {expenseCat.length === 0 ? (
            <EmptyChartState message="Add expenses to see category breakdown" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCat}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={isMobile ? 40 : (isTablet ? 55 : 65)}
                  outerRadius={isMobile ? 70 : (isTablet ? 90 : 110)}
                  paddingAngle={2}
                  stroke="transparent"
                >
                  {expenseCat.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Income vs Expense Trend */}
        <ChartCard
          title="📈 Income vs Expense Trend"
          height={chartHeight}
          footer={incomeVsExpense.length > 0 ? (
            <TrendSummary data={incomeVsExpense} />
          ) : undefined}
        >
          {incomeVsExpense.length === 0 ? (
            <EmptyChartState message="Add transactions to see trends" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeVsExpense} margin={{ left: isMobile ? -10 : 0, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={theme.palette.text.secondary}
                  tickLine={false}
                  fontSize={isMobile ? 10 : 11}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  tickLine={false}
                  fontSize={isMobile ? 10 : 11}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: isMobile ? 10 : 12, paddingTop: '10px' }}
                  verticalAlign="bottom"
                  height={isMobile ? 30 : 25}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22C55E"
                  fill="url(#incomeGradient)"
                  strokeWidth={isMobile ? 1.5 : 2}
                  name="Income"
                  dot={!isMobile ? { fill: '#22C55E', r: 4 } : false}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#EF4444"
                  fill="url(#expenseGradient)"
                  strokeWidth={isMobile ? 1.5 : 2}
                  name="Expense"
                  dot={!isMobile ? { fill: '#EF4444', r: 4 } : false}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </ChartGrid>

      {/* Financial Health Metrics - CSS Grid for equal widths */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2
        }}
      >
        <HealthMetricCard
          icon="💾"
          label="Savings Rate"
          value={formatPercent(health.savingsRate || 0)}
          description="Portion of income saved"
          progress={Math.min(100, health.savingsRate || 0)}
          color="#22C55E"
          tooltip="Percentage of your income that you save. Calculated as: (Savings / Income) × 100"
          trend={<TrendingUpIcon sx={{ color: 'success.main', fontSize: { xs: 18, sm: 20 } }} />}
        />
        <HealthMetricCard
          icon="📊"
          label="Debt-to-Income"
          value={formatPercent(health.debtToIncome || 0)}
          description="EMI load vs income"
          progress={Math.min(100, health.debtToIncome || 0)}
          color={health.debtToIncome > 50 ? '#EF4444' : '#F59E0B'}
          tooltip="Percentage of monthly income used for EMI payments. >50% indicates high debt burden"
          trend={<TrendingDownIcon sx={{ color: 'warning.main', fontSize: { xs: 18, sm: 20 } }} />}
        />
        <HealthMetricCard
          icon="💰"
          label="Net Outstanding"
          value={formatCurrency((health.toReceive || 0) - (health.toPay || 0))}
          description="To receive minus to pay"
          tooltip="Money you are owed minus money you owe. Positive = others owe you more"
          trend={
            <Box sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              {((health.toReceive || 0) - (health.toPay || 0)) > 0 ? '📈' : '📉'}
            </Box>
          }
          extra={
            <Box sx={{ display: 'flex', gap: 2, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              <Typography variant="caption" sx={{ fontSize: 'inherit' }}>
                Receive: <span style={{ fontWeight: 600, color: '#22C55E' }}>{formatCurrency(health.toReceive || 0)}</span>
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 'inherit' }}>
                Pay: <span style={{ fontWeight: 600, color: '#EF4444' }}>{formatCurrency(health.toPay || 0)}</span>
              </Typography>
            </Box>
          }
        />
      </Box>
    </PageContainer>
  );
}


/**
 * TrendSummary - Summary stats below trend chart
 */
function TrendSummary({ data }) {
  const theme = useTheme();
  const totalIncome = data.reduce((sum, item) => sum + (item.income || 0), 0);
  const totalExpense = data.reduce((sum, item) => sum + (item.expense || 0), 0);
  const netSavings = totalIncome - totalExpense;

  return (
    <Box
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        pt: 2,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
        gap: 1
      }}
    >
      <Box>
        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
          Total Income
        </Typography>
        <Typography sx={{ fontWeight: 600, color: '#22C55E', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          {formatCurrency(totalIncome)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
          Total Expense
        </Typography>
        <Typography sx={{ fontWeight: 600, color: '#EF4444', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          {formatCurrency(totalExpense)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
          Net Savings
        </Typography>
        <Typography sx={{ fontWeight: 600, color: netSavings >= 0 ? '#22C55E' : '#EF4444', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          {formatCurrency(netSavings)}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * HealthMetricCard - Card for displaying health metrics with progress bar
 */
function HealthMetricCard({ icon, label, value, description, progress, color, tooltip, trend, extra }) {
  const theme = useTheme();
  return (
    <Card>
      <CardContent sx={{ minHeight: { xs: 150, sm: 160, md: 170 } }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Typography
              color="textSecondary"
              variant="caption"
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {icon} {label}
              {tooltip && (
                <MuiTooltip title={tooltip} arrow placement="top">
                  <InfoIcon sx={{ fontSize: '0.85rem', opacity: 0.6, cursor: 'pointer' }} />
                </MuiTooltip>
              )}
            </Typography>
            {trend}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
            {value}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            {description}
          </Typography>
          {progress !== undefined && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 3
                }
              }}
            />
          )}
          {extra}
        </Stack>
      </CardContent>
    </Card>
  );
}