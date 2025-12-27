import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import SummaryCardGrid from '../layout/SummaryCardGrid';
import SummaryCard from '../layout/SummaryCard';
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

            // My Spend (Paid By Me)
            const payerId = String(exp.paidBy?._id || exp.paidBy);
            if (payerId === currentUserId) {
                myTotalSpend += exp.amount;
                myNetBalance += exp.amount;
            }

            // My consumption (Split)
            exp.splits.forEach(split => {
                const splitUserId = String(split.user?._id || split.user);
                if (splitUserId === currentUserId) {
                    myNetBalance -= split.amount;
                }
            });
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
            {/* Summary Cards */}
            <SummaryCardGrid columns={4}>
                <SummaryCard
                    label="Total Group Spending"
                    value={formatCurrency(stats.totalGroupSpend)}
                    icon="💰"
                    valueColor="info"
                />
                <SummaryCard
                    label="You Paid"
                    value={formatCurrency(stats.myTotalSpend)}
                    icon="💸"
                    valueColor="success"
                    subtitle="Total amount you paid upfront"
                />
                <SummaryCard
                    label="Your Net Balance"
                    value={formatCurrency(Math.abs(stats.myNetBalance))}
                    icon={stats.myNetBalance >= 0 ? "📈" : "📉"}
                    valueColor={stats.myNetBalance >= 0 ? "success" : "error"}
                    subtitle={stats.myNetBalance >= 0 ? "You are owed" : "You owe"}
                />
            </SummaryCardGrid>

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
                                innerRadius={isMobile ? 40 : 60}
                                outerRadius={isMobile ? 70 : 90}
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
