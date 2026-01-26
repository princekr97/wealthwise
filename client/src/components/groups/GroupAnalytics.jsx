import React from 'react';
import { Box, Typography, useTheme, useMediaQuery, Tooltip as MuiTooltip, alpha } from '@mui/material';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import ChartCard, { ChartGrid, CategoryLegend } from '../layout/ChartCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';

    if (active && payload && payload.length) {
        return (
            <Box
                sx={{
                    backgroundColor: isLight ? '#FFFFFF' : '#1e293b',
                    border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: isLight ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 10px 40px rgba(0, 0, 0, 0.5)',
                    p: 1.5,
                    minWidth: '150px'
                }}
            >
                <Typography sx={{ color: isLight ? '#64748B' : '#94a3b8', fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>
                    {payload[0].payload.name || payload[0].name || label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: payload[0].payload.fill || '#3b82f6',
                            boxShadow: isLight ? 'none' : `0 0 10px ${payload[0].payload.fill || '#3b82f6'}`
                        }}
                    />
                    <Typography sx={{ color: isLight ? '#1E293B' : 'white', fontSize: '1.1rem', fontWeight: 700 }}>
                        {formatCurrency(payload[0].value)}
                    </Typography>
                </Box>
            </Box>
        );
    }
    return null;
};

// Creative Metric Card Component
const MetricCard = ({ title, value, icon, theme, color, children }) => (
    <Box
        sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            p: 3,
            height: '100%',
            background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.03)} 100%)`
                : `linear-gradient(135deg, #FFFFFF 0%, ${alpha(color, 0.08)} 100%)`,
            backdropFilter: 'blur(32px)',
            border: `1px solid ${alpha(color, 0.2)}`,
            boxShadow: theme.palette.mode === 'dark'
                ? `0 10px 40px -15px ${alpha('#000', 0.5)}, inset 0 1px 1px ${alpha('#fff', 0.05)}`
                : `0 10px 30px -10px ${alpha(color, 0.15)}`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default',
            '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: theme.palette.mode === 'dark'
                    ? `0 20px 60px -12px ${alpha(color, 0.25)}, inset 0 1px 1px ${alpha('#fff', 0.1)}`
                    : `0 20px 40px -12px ${alpha(color, 0.2)}`,
                border: `1px solid ${alpha(color, 0.4)}`,
            }
        }}
    >
        {/* Subtle Decorative Glow Component */}
        <Box sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(color, 0.25)} 0%, transparent 70%)`,
            zIndex: 0,
            pointerEvents: 'none'
        }} />

        <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
                {/* Brand-colored Icon Container */}
                <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '16px',
                    bgcolor: alpha(color, 0.15),
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: `0 8px 16px -4px ${alpha(color, 0.3)}`,
                    border: `1px solid ${alpha(color, 0.1)}`
                }}>
                    {React.cloneElement(icon, { width: 24, height: 24, strokeWidth: 2.5 })}
                </Box>

                {/* Subdued Typography for Title */}
                <Typography sx={{
                    color: alpha(theme.palette.text.primary, 0.5),
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    mb: 1
                }}>
                    {title}
                </Typography>
            </Box>

            {/* High-Impact Value Display */}
            <Box>
                {children ? children : (
                    <Typography sx={{
                        fontSize: { xs: '1.5rem', md: '2.25rem' },
                        fontWeight: 800,
                        color: theme.palette.text.primary,
                        letterSpacing: '-1.5px',
                        lineHeight: 1,
                        background: 'linear-gradient(to bottom, #FFFFFF 0%, #CBD5E1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: theme.palette.mode === 'dark' ? 'transparent' : 'inherit'
                    }}>
                        {value}
                    </Typography>
                )}
            </Box>
        </Box>
    </Box>
);

// Wrap component in React.memo for performance (prevent unnecessary re-renders)
const GroupAnalytics = ({ expenses, members, currency, currentUser }) => {
    const theme = useTheme();

    // 0. Calculate Dashboard Stats
    const stats = React.useMemo(() => {
        let totalGroupSpend = 0;
        let myTotalSpend = 0;
        let mySettlementPaid = 0;
        let mySettlementReceived = 0;
        let myNetBalance = 0;
        let myTotalConsumption = 0;

        if (!currentUser || !members) return { totalGroupSpend: 0, myTotalSpend: 0, myNetBalance: 0, myTotalConsumption: 0 };

        // 1. Identify "Me" in the members list (Robust matching)
        const myMember = members.find(m => {
            const mId = m.userId?._id || m.userId || m._id;
            const cId = currentUser._id || currentUser.id;

            if (cId && String(mId) === String(cId)) return true;
            if (currentUser.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
            if (currentUser.phone && m.phone && m.phone === currentUser.phone) return true;
            return false;
        });

        // 2. Collect all "My Identities" for matching against expenses
        const myIdentities = new Set();
        if (currentUser._id) myIdentities.add(String(currentUser._id));
        if (currentUser.id) myIdentities.add(String(currentUser.id));
        if (myMember) {
            const mId = myMember.userId?._id || myMember.userId || myMember._id;
            if (mId) myIdentities.add(String(mId));
            if (myMember.name) myIdentities.add(myMember.name.trim().toLowerCase());
            if (myMember.email) myIdentities.add(myMember.email.trim().toLowerCase());
        }
        // Always include current user's profile info as fallback
        if (currentUser.name) myIdentities.add(currentUser.name.trim().toLowerCase());
        if (currentUser.email) myIdentities.add(currentUser.email.trim().toLowerCase());

        const isMe = (userObj, userName) => {
            if (!userObj && !userName) return false;

            // Check ID
            const uid = userObj?._id || userObj?.id || (typeof userObj === 'string' ? userObj : null);
            if (uid && myIdentities.has(String(uid))) return true;

            // Check Name
            const name = (userObj?.name || userName || '').trim().toLowerCase();
            if (name && myIdentities.has(name)) return true;

            return false;
        };

        expenses.forEach(exp => {
            const isSettlement = exp.category === 'Settlement';

            // Total Spend (Exclude settlements from group metrics)
            if (!isSettlement) {
                totalGroupSpend += exp.amount;
            }

            // My Spend (Did I pay for this?)
            if (isMe(exp.paidBy, exp.paidByName)) {
                if (isSettlement) {
                    mySettlementPaid += exp.amount;
                } else {
                    myTotalSpend += exp.amount;
                    myNetBalance += exp.amount; // + Credit (Paid)
                }
            }

            // My consumption (Was I part of the split?)
            if (exp.splits) {
                exp.splits.forEach(split => {
                    if (isMe(split.user, split.userName)) {
                        if (isSettlement) {
                            mySettlementReceived += split.amount;
                        } else {
                            myNetBalance -= split.amount; // - Debit (Consumed)
                            myTotalConsumption += split.amount;
                        }
                    }
                });
            }
        });

        return { totalGroupSpend, myTotalSpend, mySettlementPaid, mySettlementReceived, myNetBalance, myTotalConsumption };
    }, [expenses, currentUser, members]);

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
            {/* Minimalist Glass Metric Cards - Unified 2x2 Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 3,
                    gridAutoRows: '1fr', // Ensure all cards have the same height
                    mb: 5
                }}
            >
                {/* 1. Total Spending */}
                <MetricCard
                    title="Total Spending"
                    value={formatCurrency(stats.totalGroupSpend)}
                    theme={theme}
                    color="#3b82f6"
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" />
                            <path d="M3 11h18" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    }
                />

                {/* 2. Expenses Paid */}
                <MetricCard
                    title="Expenses Paid"
                    value={formatCurrency(stats.myTotalSpend)}
                    theme={theme}
                    color="#10b981"
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                            <path d="M3 10h18M7 14h2M7 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    }
                />

                {/* 3. Settlements */}
                <MetricCard
                    title="Settlements"
                    theme={theme}
                    color="#8b5cf6"
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 9V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V9M7 9H17M7 9H5C3.89543 9 3 9.89543 3 11V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V11C21 9.89543 20.1046 9 19 9H17M12 14V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    }
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 0.5, mt: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minWidth: 0 }}>
                            <Typography noWrap sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px', mr: 1 }}>
                                Paid₹
                            </Typography>
                            <Typography noWrap sx={{ fontSize: { xs: '0.80rem', sm: '1.2rem' }, fontWeight: 700, color: theme.palette.text.primary }}>
                                {formatCurrency(stats.mySettlementPaid)}
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: '1px', bgcolor: alpha('#8b5cf6', 0.15), my: 0.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minWidth: 0 }}>
                            <Typography noWrap sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', mr: 1 }}>
                                Get₹
                            </Typography>
                            <Typography noWrap sx={{ fontSize: { xs: '0.80rem', sm: '1.2rem' }, fontWeight: 700, color: theme.palette.text.primary }}>
                                {formatCurrency(stats.mySettlementReceived)}
                            </Typography>
                        </Box>
                    </Box>
                </MetricCard>

                {/* 4. Your Share (Consumption) */}
                <MetricCard
                    title="Your Share"
                    theme={theme}
                    color="#f59e0b"
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    }
                >
                    <Box sx={{ mt: 0.5 }}>
                        <Typography sx={{
                            fontSize: { xs: '1.4rem', md: '2.1rem' },
                            fontWeight: 800,
                            color: theme.palette.text.primary,
                            letterSpacing: '-1.2px',
                            lineHeight: 1
                        }}>
                            {formatCurrency(stats.myTotalConsumption)}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    pl: 1,
                                    pr: 0.75,
                                    py: 0.5,
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    backdropFilter: 'blur(8px)',
                                    maxWidth: '100%'
                                }}
                            >
                                <Typography sx={{
                                    fontSize: '0.65rem',
                                    color: '#94A3B8',
                                    fontWeight: 600,
                                    letterSpacing: '0.2px',
                                    whiteSpace: 'nowrap'
                                }}>
                                    Group Average:
                                </Typography>

                                <Typography sx={{
                                    fontSize: '0.65rem',
                                    color: '#f59e0b',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap'
                                }}>
                                    {formatCurrency(stats.totalGroupSpend / (members.length || 1))}
                                </Typography>

                                <MuiTooltip
                                    title="Your Share is your personal consumption. It differs from the Average if you were excluded from certain expenses or splits were unequal."
                                    arrow
                                    placement="top"
                                    enterTouchDelay={0}
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 16,
                                            height: 16,
                                            borderRadius: '50%',
                                            background: alpha('#f59e0b', 0.15),
                                            color: '#f59e0b',
                                            cursor: 'help',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                background: alpha('#f59e0b', 0.25)
                                            }
                                        }}
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="16" x2="12" y2="12"></line>
                                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg>
                                    </Box>
                                </MuiTooltip>
                            </Box>
                        </Box>
                    </Box>
                </MetricCard>
            </Box>


            {/* Charts Grid */}
            <ChartGrid>
                {/* Category Breakdown */}
                <ChartCard
                    title="Expenses by Category"
                    subtitle={`${categoryData.length} categories`}
                    collapsible={true}
                    defaultExpanded={true}
                    height={380}
                    color="#ec4899" // Pink - Unique
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
                                innerRadius={isMobile ? 50 : 70}
                                outerRadius={isMobile ? 90 : 115}
                                paddingAngle={2}
                                stroke="transparent"
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
                    height={Math.max(200, memberSpendingData.length * 50)}
                    defaultExpanded={true}
                    color="#06b6d4" // Cyan - Unique
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={memberSpendingData}
                            layout="vertical"
                            margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
                            barSize={Math.min(40, Math.max(20, 280 / Math.max(memberSpendingData.length, 1)))}
                            barGap={5}
                        >
                            <defs>
                                <linearGradient id="barGradient1" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                width={100}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                {memberSpendingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                <LabelList
                                    dataKey="value"
                                    position="right"
                                    formatter={(v) => formatCurrency(v)}
                                    style={{ fill: theme.palette.text.primary, fontSize: '11px', fontWeight: 800 }}
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
