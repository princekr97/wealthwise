import React from 'react';
import { Box, Typography, useTheme, useMediaQuery, Tooltip as MuiTooltip } from '@mui/material';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import ChartCard, { ChartGrid, CategoryLegend } from '../layout/ChartCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box
                sx={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    p: 1.5,
                    minWidth: '150px'
                }}
            >
                <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>
                    {payload[0].payload.name || payload[0].name || label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: payload[0].payload.fill || '#3b82f6',
                            boxShadow: `0 0 10px ${payload[0].payload.fill || '#3b82f6'}`
                        }}
                    />
                    <Typography sx={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>
                        {formatCurrency(payload[0].value)}
                    </Typography>
                </Box>
            </Box>
        );
    }
    return null;
};

// Wrap component in React.memo for performance (prevent unnecessary re-renders)
const GroupAnalytics = ({ expenses, members, currency, currentUser }) => {
    const theme = useTheme();

    // 0. Calculate Dashboard Stats
    const stats = React.useMemo(() => {
        let totalGroupSpend = 0;
        let myTotalSpend = 0;
        let myNetBalance = 0;

        if (!currentUser) return { totalGroupSpend: 0, myTotalSpend: 0, myNetBalance: 0 };

        // Helper for safe ID comparison
        const getSafeId = (obj) => {
            if (!obj) return '';
            if (typeof obj === 'object') return String(obj._id || obj.id || '');
            return String(obj);
        };

        const currentUserId = getSafeId(currentUser);

        expenses.forEach(exp => {
            if (exp.category === 'Settlement') return;

            // Total Spend
            totalGroupSpend += exp.amount;

            // My Spend (Paid By Me)
            const payerId = getSafeId(exp.paidBy);
            const payerName = exp.paidBy && exp.paidBy.name;

            const isIdMatch = currentUserId && payerId === currentUserId;
            // Only try name match if ID match fails AND we have valid names to compare
            const isNameMatch = !isIdMatch && payerName && currentUser.name &&
                payerName.trim().toLowerCase() === currentUser.name.trim().toLowerCase();

            if (isIdMatch || isNameMatch) {
                myTotalSpend += exp.amount;
                myNetBalance += exp.amount; // + Credit (Paid)
            }

            // My consumption (Split)
            if (exp.splits) {
                exp.splits.forEach(split => {
                    const splitUserId = getSafeId(split.user);
                    const splitUserName = split.user?.name || split.userName;

                    const isSplitIdMatch = currentUserId && splitUserId === currentUserId;
                    const isSplitNameMatch = !isSplitIdMatch && splitUserName && currentUser.name &&
                        splitUserName.trim().toLowerCase() === currentUser.name.trim().toLowerCase();

                    if (isSplitIdMatch || isSplitNameMatch) {
                        myNetBalance -= split.amount; // - Debit (Consumed)
                    }
                });
            }
        });

        return { totalGroupSpend, myTotalSpend, myNetBalance };
    }, [expenses, currentUser]);
    const categoryData = React.useMemo(() => {
        const map = {};
        expenses.forEach(exp => {
            if (exp.category === 'Settlement') return; // Exclude settlements
            if (!map[exp.category]) map[exp.category] = 0;
            map[exp.category] += exp.amount;
        });
        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort desc
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
            {/* Minimalist Glass Metric Cards */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 3,
                    mb: 5
                }}
            >
                {/* Total Group Spend */}
                <Box
                    sx={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
                    }}
                >
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', mb: 1, textAlign: 'center' }}>
                        Total Spending
                    </Typography>
                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', letterSpacing: '-0.5px', textAlign: 'center' }}>
                        {formatCurrency(stats.totalGroupSpend)}
                    </Typography>
                </Box>

                {/* You Paid */}
                <Box
                    sx={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
                    }}
                >
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', mb: 1, textAlign: 'center' }}>
                        You Paid
                    </Typography>
                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.5px', textAlign: 'center' }}>
                        {formatCurrency(stats.myTotalSpend)}
                    </Typography>
                </Box>

                {/* Average Spend Per Person */}
                <Box
                    sx={{
                        gridColumn: { xs: '1 / -1', md: 'auto' },
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        '&:hover': { background: 'rgba(255, 255, 255, 0.05)' }
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', mb: 1 }}>
                            Average Spend
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                color: '#f8fafc',
                                letterSpacing: '-0.5px'
                            }}
                        >
                            {formatCurrency(stats.totalGroupSpend / (members.length || 1))}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            mt: 1.5,
                            mx: 'auto',
                            px: 1.5, py: 0.5,
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: 'rgba(129, 140, 248, 0.1)',
                            color: '#818cf8',
                            width: 'fit-content'
                        }}
                    >
                        Per Person
                    </Box>
                </Box>
            </Box>

            {/* Charts Grid */}
            <ChartGrid>
                {/* Category Breakdown */}
                <ChartCard
                    title="Expenses by Category"
                    subtitle={`${categoryData.length} categories`}
                    collapsible={true}
                    height={322} // Increased by 15% (280 * 1.15)
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
                                innerRadius={isMobile ? 40 : 63} // Increased by 15%
                                outerRadius={isMobile ? 75 : 98} // Increased by 15%
                                paddingAngle={2}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Member Spending */}
                <ChartCard
                    title="Spending by Member"
                    subtitle="Who spent the most?"
                    collapsible={true}
                    height={322} // Increased by 15%
                    defaultExpanded={false}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={memberSpendingData}
                            layout="vertical"
                            margin={{ top: 5, right: 50, left: 0, bottom: 5 }} // Increased right margin for labels
                            barSize={28}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                width={100}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {memberSpendingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                <LabelList
                                    dataKey="value"
                                    position="right"
                                    formatter={(v) => formatCurrency(v)}
                                    style={{ fill: '#f8fafc', fontSize: '11px', fontWeight: 600 }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </ChartGrid>
        </Box>
    );
};

// Export with React.memo for performance optimization
export default React.memo(GroupAnalytics);

