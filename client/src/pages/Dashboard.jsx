/**
 * Dashboard Page - MUI Version
 *
 * Financial overview with summary cards, charts, and health metrics.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Container,
  Stack,
  Typography,
  Skeleton,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Alert,
  Tooltip as MuiTooltip,
  Chip
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
  LineChart,
  Line
} from 'recharts';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Info as InfoIcon } from '@mui/icons-material';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { useAuthStore } from '../store/authStore';

const CATEGORY_COLORS = [
  '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#6B7280', '#A78BFA', '#0EA5E9',
  '#6366F1', '#F59E0B', '#14B8A6'
];

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
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
        console.log('Dashboard Summary:', s);
        console.log('Dashboard Charts:', c);
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

  if (loading) {
    return (
      <Box sx={{ py: { xs: 2, sm: 2, md: 3, lg: 4 }, px: { xs: 1, sm: 1, md: 2, lg: 3 } }}>
        <Container maxWidth="xl" disableGutters>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
          <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3 }} sx={{ mb: 3 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={i}>
                <Skeleton variant="rounded" height={140} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3 }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <Grid item xs={12} sm={12} md={12} lg={6} key={i}>
                <Skeleton variant="rounded" height={400} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  const cards = summary?.cards || {};
  const health = summary?.health || {};
  const expenseCat = charts?.expenseByCategory || [];
  const incomeVsExpense = charts?.incomeVsExpenseTrend || [];

  // Dynamic chart height based on breakpoint
  const chartHeight = isMobile ? 250 : (isTablet ? 280 : 320);

  return (
    <Box sx={{ py: { xs: 2, sm: 2, md: 3, lg: 4 }, px: { xs: 1, sm: 1, md: 2, lg: 4 }, backgroundColor: '#020617', minHeight: '100vh' }}>
      <Box sx={{ width: '100%', mx: 'auto' }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: { xs: 2, sm: 3, md: 4 }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem', lg: '1.75rem' } }}>
              👋 Welcome back, {user?.name?.split(' ')[0] || 'Investor'}!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' } }}>
              Your financial overview at a glance
            </Typography>
          </Box>
          <Card sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 1.5 }, minWidth: { xs: 'auto', sm: 200 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main', animation: 'pulse 2s infinite' }} />
              <MuiTooltip 
                title="Financial Health Score (0-100): 40% Savings Rate (target 20%+) + 40% Low Debt-to-Income (target <30%) + 20% Positive Net Lending"
                arrow 
                placement="bottom"
              >
                <Typography variant="caption" sx={{ fontWeight: 600, whiteSpace: 'nowrap', fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.85rem' }, cursor: 'pointer', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                  Health: <span style={{ color: theme.palette.primary.main }}>{health.score || 0}/100</span>
                </Typography>
              </MuiTooltip>
            </Stack>
          </Card>
        </Stack>

        {/* Summary Cards */}
        <Grid 
          container 
          spacing={{ xs: 1.5, sm: 2, md: 2.5, lg: 3 }} 
          sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
        >
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <SummaryCard
              icon="💰"
              label="Income"
              value={formatCurrency(cards.income || 0)}
              change={cards.incomeChange !== undefined ? `${cards.incomeChange > 0 ? '+' : ''}${cards.incomeChange.toFixed(1)}%` : 'N/A'}
              color="success"
              tooltip="% change in income compared to previous month. 0% means income is the same or this is your first month."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <SummaryCard
              icon="💸"
              label="Expenses"
              value={formatCurrency(cards.expenses || 0)}
              change={cards.expensesChange !== undefined ? `${cards.expensesChange > 0 ? '+' : ''}${cards.expensesChange.toFixed(1)}%` : 'N/A'}
              color="error"
              tooltip="% change in expenses compared to previous month. Negative means you spent less."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <SummaryCard
              icon="🏦"
              label="Savings"
              value={formatCurrency(cards.savings || 0)}
              change={cards.savingsChange !== undefined ? `${cards.savingsChange > 0 ? '+' : ''}${cards.savingsChange.toFixed(1)}%` : 'N/A'}
              color="info"
              tooltip="% change in savings (Income - Expenses) compared to previous month."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <SummaryCard
              icon="📌"
              label="EMI Due"
              value={formatCurrency(cards.emiDue || 0)}
              change={cards.loanCount !== undefined ? `${cards.loanCount} loans` : '0 loans'}
              color="warning"
              tooltip="Total monthly EMI amount across all active loans."
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          {/* Expense Breakdown */}
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <Card>
              <CardContent sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
                    📂 Expense Breakdown
                  </Typography>
                  {expenseCat.length > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      {expenseCat.length} categories
                    </Typography>
                  )}
                </Box>
              </CardContent>
              
              <CardContent sx={{ pt: 1 }}>
                {expenseCat.length === 0 ? (
                  <Box sx={{ height: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                      Add expenses to see category breakdown
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ width: '100%', height: chartHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.85)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: 6,
                              fontSize: 12,
                              padding: '8px 12px'
                            }}
                            formatter={(value) => formatCurrency(value)}
                            labelFormatter={(label) => label}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Legend - Clean Grid Below Chart */}
                    <Box sx={{ 
                      mt: 3, 
                      pt: 2, 
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                      gap: { xs: 1.5, sm: 2 },
                      rowGap: { xs: 1.5, sm: 2 }
                    }}>
                      {expenseCat.map((item, index) => {
                        const total = expenseCat.reduce((sum, i) => sum + i.total, 0);
                        const percentage = ((item.total / total) * 100).toFixed(1);
                        return (
                          <Box 
                            key={index}
                            sx={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                              p: 1.5,
                              borderRadius: 1.5,
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                borderColor: 'rgba(255,255,255,0.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                                  flexShrink: 0
                                }}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                  fontWeight: 600,
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.category}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5 }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  fontWeight: 600,
                                  color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                                }}
                              >
                                {formatCurrency(item.total)}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="textSecondary"
                                sx={{ 
                                  fontSize: { xs: '0.65rem', sm: '0.7rem' }
                                }}
                              >
                                {percentage}%
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Income vs Expense Trend */}
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 300, sm: 350, md: 400 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
                  📈 Income vs Expense Trend
                </Typography>
                {incomeVsExpense.length === 0 ? (
                  <Box sx={{ height: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                      Add transactions to see trends
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ width: '100%', height: chartHeight }}>
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
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis 
                            dataKey="label" 
                            stroke="rgba(255,255,255,0.5)" 
                            tickLine={false} 
                            fontSize={isMobile ? 10 : 11}
                            tick={{ fill: 'rgba(255,255,255,0.7)' }}
                          />
                          <YAxis
                            stroke="rgba(255,255,255,0.5)"
                            tickLine={false}
                            fontSize={isMobile ? 10 : 11}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            tick={{ fill: 'rgba(255,255,255,0.7)' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: 8,
                              fontSize: isMobile ? 10 : 12,
                              padding: '8px 12px'
                            }}
                            formatter={(value) => formatCurrency(value)}
                            labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Legend 
                            wrapperStyle={{ 
                              fontSize: isMobile ? 10 : 12,
                              paddingTop: '10px'
                            }}
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
                    </Box>

                    {/* Summary Stats Below Chart */}
                    <Box sx={{ 
                      mt: 2, 
                      pt: 2, 
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                      gap: 1
                    }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                          Total Income
                        </Typography>
                        <Typography sx={{ fontWeight: 600, color: '#22C55E', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                          {formatCurrency(incomeVsExpense.reduce((sum, item) => sum + (item.income || 0), 0))}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                          Total Expense
                        </Typography>
                        <Typography sx={{ fontWeight: 600, color: '#EF4444', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                          {formatCurrency(incomeVsExpense.reduce((sum, item) => sum + (item.expense || 0), 0))}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                          Net Savings
                        </Typography>
                        <Typography sx={{ 
                          fontWeight: 600, 
                          color: incomeVsExpense.reduce((sum, item) => sum + (item.income - item.expense || 0), 0) >= 0 ? '#22C55E' : '#EF4444',
                          fontSize: { xs: '0.9rem', sm: '1rem' } 
                        }}>
                          {formatCurrency(incomeVsExpense.reduce((sum, item) => sum + (item.income - item.expense || 0), 0))}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Financial Health Metrics */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5, lg: 3 }} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6} md={4} lg={4}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 150, sm: 170, md: 180 } }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography color="textSecondary" variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      💾 Savings Rate
                      <MuiTooltip title="Percentage of your income that you save. Calculated as: (Savings / Income) × 100. Higher is better!" arrow placement="top">
                        <InfoIcon sx={{ fontSize: '0.85rem', opacity: 0.6, cursor: 'pointer' }} />
                      </MuiTooltip>
                    </Typography>
                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: { xs: 18, sm: 20 } }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                    {formatPercent(health.savingsRate || 0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Portion of income saved
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, health.savingsRate || 0)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#22C55E',
                        borderRadius: 3
                      }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={4}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 150, sm: 170, md: 180 } }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography color="textSecondary" variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      📊 Debt-to-Income
                      <MuiTooltip title="Percentage of monthly income used for EMI payments. Calculated as: (Total EMI / Income) × 100. Lower is better. >50% indicates high debt burden." arrow placement="top">
                        <InfoIcon sx={{ fontSize: '0.85rem', opacity: 0.6, cursor: 'pointer' }} />
                      </MuiTooltip>
                    </Typography>
                    <TrendingDownIcon sx={{ color: 'warning.main', fontSize: { xs: 18, sm: 20 } }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                    {formatPercent(health.debtToIncome || 0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    EMI load vs income
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, health.debtToIncome || 0)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: health.debtToIncome > 50 ? '#EF4444' : '#F59E0B',
                        borderRadius: 3
                      }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={4}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 150, sm: 170, md: 180 } }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography color="textSecondary" variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      💰 Net Outstanding
                      <MuiTooltip title="Money you are owed minus money you owe. Positive value = others owe you more. Calculated from lending/borrowing records." arrow placement="top">
                        <InfoIcon sx={{ fontSize: '0.85rem', opacity: 0.6, cursor: 'pointer' }} />
                      </MuiTooltip>
                    </Typography>
                    <Box sx={{ fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
                      {((health.toReceive || 0) - (health.toPay || 0)) > 0 ? '📈' : '📉'}
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                    {formatCurrency((health.toReceive || 0) - (health.toPay || 0))}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    To receive minus to pay
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                      Receive: <span style={{ fontWeight: 600, color: '#22C55E' }}>{formatCurrency(health.toReceive || 0)}</span>
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                      Pay: <span style={{ fontWeight: 600, color: '#EF4444' }}>{formatCurrency(health.toPay || 0)}</span>
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

function SummaryCard({ icon, label, value, change, color, tooltip }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ minHeight: { xs: 140, sm: 150, md: 160 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: { xs: 1.5, sm: 2, md: 2 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h3" sx={{ fontSize: { xs: '2rem', sm: '2.2rem', md: '2.4rem' } }}>
            {icon}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' } }}>
              {label}
            </Typography>
            {tooltip && (
              <MuiTooltip title={tooltip} arrow placement="top">
                <InfoIcon sx={{ fontSize: '0.9rem', color: 'textSecondary', opacity: 0.6, cursor: 'pointer', flexShrink: 0 }} />
              </MuiTooltip>
            )}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.15rem', md: '1.3rem' }, lineHeight: 1.2 }}>
            {value}
          </Typography>
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'inline-block',
                px: { xs: 1, sm: 1.25, md: 1.5 },
                py: { xs: 0.5, sm: 0.625, md: 0.75 },
                borderRadius: 1,
                bgcolor: `${color}.light`,
                color: `${color}.main`,
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                whiteSpace: 'nowrap'
              }}
            >
              {change}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}