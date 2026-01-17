import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import ChartCard, { ChartGrid, CategoryLegend } from '../layout/ChartCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function GroupAnalytics({ expenses, members, currency, currentUser }) {
    const theme = useTheme();

    // 0. Calculate Dashboard Stats
    const stats = React.useMemo(() => {
        let totalGroupSpend = 0;
        let myTotalSpend = 0;
        let myNetBalance = 0;

        if (!currentUser) return { totalGroupSpend: 0, myTotalSpend: 0, myNetBalance: 0 };

        const currentUserId = String(currentUser._id || currentUser);

        expenses.forEach(exp => {
            if (exp.category === 'Settlement') return;

            // Total Spend
            totalGroupSpend += exp.amount;

            // My Spend (Paid By Me) - STRICT CHECK + NAME FALLBACK
            let payerIdNormalized;
            let payerName;

            if (exp.paidBy && typeof exp.paidBy === 'object') {
                payerIdNormalized = String(exp.paidBy._id || exp.paidBy.id);
                payerName = exp.paidBy.name;
            } else {
                payerIdNormalized = String(exp.paidBy);
            }

            const isIdMatch = payerIdNormalized === currentUserId && payerIdNormalized !== 'null' && payerIdNormalized !== 'undefined';
            // Only try name match if ID match fails AND we have valid names to compare
            const isNameMatch = !isIdMatch && payerName && currentUser.name && payerName.trim().toLowerCase() === currentUser.name.trim().toLowerCase();

            if (isIdMatch || isNameMatch) {
                myTotalSpend += exp.amount;
                myNetBalance += exp.amount;
            }

            // My consumption (Split)
            if (exp.splits) {
                exp.splits.forEach(split => {
                    const splitUserId = String(split.user?._id || split.user);
                    const splitUserName = split.user?.name || split.userName; // Handle fallback name in split

                    const isSplitIdMatch = splitUserId === currentUserId;
                    const isSplitNameMatch = !isSplitIdMatch && splitUserName && currentUser.name && splitUserName.trim().toLowerCase() === currentUser.name.trim().toLowerCase();

                    if (isSplitIdMatch || isSplitNameMatch) {
                        // Correct logic: if I am in the split, I "consumed" this amount.
                        // If I paid, it was added above (+Paid).
                        // Consumed is always subtracted (-Consumed).
                        // Net = Paid - Consumed.
                        myNetBalance -= split.amount;
                    }
                });
            }
        });

        return { totalGroupSpend, myTotalSpend, myNetBalance };
    }, [expenses, currentUser]);

    // 1. Prepare Data: Expenses by Category
    const categoryData = React.useMemo(() => {
        const map = {};
        expenses.forEach(exp => {
            if (exp.category === 'Settlement') return; // Exclude settlements
            if (!map[exp.category]) map[exp.category] = 0;
            map[exp.category] += exp.amount;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    // 2. Prepare Data: Spending by Member
    const memberSpendingData = React.useMemo(() => {
        const map = {};
        members.forEach(m => map[m.name] = 0);

        expenses.forEach(exp => {
            if (exp.category === 'Settlement') return;
            if (!exp.paidBy) return; // Skip expenses with missing paidBy

            const payerName = exp.paidBy.name;
            if (map[payerName] !== undefined) {
                map[payerName] += exp.amount;
            } else {
                map[payerName] = (map[payerName] || 0) + exp.amount;
            }
        });

        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort desc
    }, [expenses, members]);

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    if (expenses.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No expenses to analyze yet.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 1 }}>
            {/* Premium Metric Cards - Redesigned & Compact */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gridTemplateRows: 'auto auto',
                    gap: { xs: 1.5, sm: 2 },  // Reduced from 2/2.5
                    mb: 3 // Reduced from 4
                }}
            >
                {/* Card 1 - Total Group Spending */}
                <Box
                    sx={{
                        gridColumn: { xs: '1', sm: '1' },
                        gridRow: { xs: 'auto', sm: '1' },
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '16px', // Reduced from 20
                        padding: { xs: 2.5, sm: 3 }, // Reduced from 3/4
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)'
                        },
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 32px rgba(59, 130, 246, 0.2)'
                        }
                    }}
                >
                    <Box sx={{ fontSize: '2rem', mb: 1, lineHeight: 1 }}>💰</Box> {/* Reduced icon/mb */}
                    <Typography
                        sx={{
                            fontSize: { xs: '1.5rem', sm: '1.75rem' },  // Reduced from 2/2.25
                            fontWeight: 700,
                            color: '#3B82F6',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                            mb: 0.4
                        }}
                    >
                        {formatCurrency(stats.totalGroupSpend)}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.65rem',  // Reduced from 0.75
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: '#94A3B8',
                            opacity: 0.9
                        }}
                    >
                        TOTAL GROUP SPENDING
                    </Typography>
                </Box>

                {/* Card 2 - You Paid */}
                <Box
                    sx={{
                        gridColumn: { xs: '1', sm: '2' },
                        gridRow: { xs: 'auto', sm: '1' },
                        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(20, 184, 166, 0.2)',
                        borderRadius: '16px',
                        padding: { xs: 2.5, sm: 3 },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.3), transparent)'
                        },
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 32px rgba(20, 184, 166, 0.2)'
                        }
                    }}
                >
                    <Box sx={{ fontSize: '2rem', mb: 1, lineHeight: 1 }}>💸</Box>
                    <Typography
                        sx={{
                            fontSize: { xs: '1.5rem', sm: '1.75rem' },
                            fontWeight: 700,
                            color: '#10B981',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                            mb: 0.4
                        }}
                    >
                        {formatCurrency(stats.myTotalSpend)}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: '#94A3B8',
                            opacity: 0.9
                        }}
                    >
                        YOU PAID
                    </Typography>
                </Box>

                {/* Card 3 - Your Net Balance */}
                <Box
                    sx={{
                        gridColumn: { xs: '1', sm: '1 / 3' },
                        gridRow: { xs: 'auto', sm: '2' },
                        background: stats.myNetBalance >= 0
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(251, 113, 133, 0.05) 100%)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: `1px solid ${stats.myNetBalance >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 107, 107, 0.2)'}`,
                        borderRadius: '16px',
                        padding: { xs: 2.5, sm: 3 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: stats.myNetBalance >= 0
                                ? 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)'
                                : 'linear-gradient(90deg, transparent, rgba(255, 107, 107, 0.3), transparent)'
                        },
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: stats.myNetBalance >= 0
                                ? '0 12px 32px rgba(16, 185, 129, 0.15)'
                                : '0 12px 32px rgba(255, 107, 107, 0.15)'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ fontSize: '2rem', lineHeight: 1 }}>
                            {stats.myNetBalance >= 0 ? '📈' : '📉'}
                        </Box>
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                                    fontWeight: 700,
                                    color: stats.myNetBalance >= 0 ? '#10B981' : '#FF6B6B',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.1,
                                    mb: 0.4
                                }}
                            >
                                {formatCurrency(Math.abs(stats.myNetBalance))}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    color: '#94A3B8',
                                    opacity: 0.9
                                }}
                            >
                                YOUR NET BALANCE
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.65rem',
                                    color: stats.myNetBalance >= 0 ? '#10B981' : '#FF6B6B',
                                    fontWeight: 500,
                                    mt: 0.4
                                }}
                            >
                                {stats.myNetBalance >= 0 ? 'You are owed' : 'You owe'}
                            </Typography>
                        </Box>
                    </Box>
                    {/* Optional: Animated sparkle for positive balance */}
                    {stats.myNetBalance >= 0 && Math.abs(stats.myNetBalance) > 0.1 && (
                        <Box
                            sx={{
                                fontSize: '1.25rem',
                                animation: 'pulse 2s ease-in-out infinite'
                            }}
                        >
                            ✨
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Charts Grid */}
            <ChartGrid>
                {/* Category Breakdown */}
                <ChartCard
                    title="📂 Expenses by Category"
                    subtitle={`${categoryData.length} categories`}
                    footer={
                        <CategoryLegend
                            data={categoryData}
                            colors={COLORS}
                            formatter={formatCurrency}
                        />
                    }
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                innerRadius={isMobile ? 35 : 55} // Reduced
                                outerRadius={isMobile ? 65 : 85} // Reduced
                                paddingAngle={2}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    padding: '8px 12px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Member Spending */}
                <ChartCard
                    title="👥 Spending by Member"
                    subtitle="Who spent the most?"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={memberSpendingData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            barSize={30}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                            />
                            <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                                {memberSpendingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </ChartGrid>
        </Box>
    );
}
