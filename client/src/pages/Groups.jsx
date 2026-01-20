import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    IconButton,
    CircularProgress,
    Alert,
    Avatar,
    AvatarGroup,
    Stack,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    alpha
} from '@mui/material';
import {
    Add as AddIcon,
    Group as GroupIcon,
    ArrowForward as ArrowForwardIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../services/groupService';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import AddGroupDialog from '../components/groups/AddGroupDialog';
import { formatCurrency } from '../utils/formatters';
import SummaryCardGrid from '../components/layout/SummaryCardGrid';
import SummaryCard from '../components/layout/SummaryCard';
import PageLoader from '../components/common/PageLoader';
import { useAuthStore } from '../store/authStore';
import { getAvatarConfig } from '../utils/avatarHelper';


export default function Groups() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [groupBalances, setGroupBalances] = useState({});

    // Global Stats
    const [stats, setStats] = useState({
        totalOwed: 0,
        totalOwe: 0,
        netBalance: 0,
        todaySpending: 0,
        monthSpending: 0
    });

    // Pre-compute user identity set (performance optimization)
    const myIdentifiers = React.useMemo(() => {
        if (!user) return new Set();
        const ids = new Set();
        const myIdStr = String(user._id);
        const myEmail = user.email ? user.email.toLowerCase() : '';
        ids.add(myIdStr);
        if (myEmail) ids.add(myEmail);
        if (user.name) ids.add(user.name.toLowerCase().trim());
        return ids;
    }, [user?._id, user?.email, user?.name]);

    useEffect(() => {
        if (user) {
            fetchGroups();
        }
    }, [user]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const groupsData = await groupService.getGroups();
            setGroups(groupsData);

            // Calculate Global Stats
            // Note: This fetches details for each group (N+1 pattern)
            // TODO: Optimize with backend endpoint that returns pre-calculated stats
            let totalOwed = 0;
            let totalOwe = 0;
            let todaySpending = 0;
            let monthSpending = 0;
            const today = new Date();

            const promises = groupsData.map(g => groupService.getGroupDetails(g._id));
            const details = await Promise.all(promises);
            const balances = {};

            // Use pre-computed myIdentifiers from useMemo
            const extendedIdentifiers = new Set(myIdentifiers);

            details.forEach(groupDetail => {
                if (!groupDetail || !groupDetail.expenses) return;

                // Extend identity set with group-specific member IDs
                if (groupDetail.members) {
                    const myIdStr = String(user._id);
                    const myEmail = user.email ? user.email.toLowerCase() : '';

                    groupDetail.members.forEach(m => {
                        let isMe = false;
                        if (m.userId) {
                            const uId = (typeof m.userId === 'object' ? m.userId._id : m.userId);
                            if (String(uId) === myIdStr) isMe = true;
                        }
                        if (!isMe && m.email && m.email.toLowerCase() === myEmail) isMe = true;

                        if (isMe) {
                            if (m._id) extendedIdentifiers.add(String(m._id));
                            if (m.name) extendedIdentifiers.add(m.name.toLowerCase().trim());
                        }
                    });
                }

                let myGroupBalance = 0;

                groupDetail.expenses.forEach(exp => {
                    const amount = exp.amount;

                    // 1. Did I Pay?
                    let isPayer = false;
                    const payer = exp.paidBy;
                    if (payer) {
                        const pId = payer._id || payer;
                        if (extendedIdentifiers.has(String(pId))) isPayer = true;

                        if (!isPayer) {
                            const pName = (typeof payer === 'object' ? payer.name : String(payer));
                            if (pName && extendedIdentifiers.has(pName.toLowerCase().trim())) isPayer = true;
                        }

                        if (!isPayer && exp.paidByName && extendedIdentifiers.has(exp.paidByName.toLowerCase().trim())) isPayer = true;
                    }

                    if (isPayer) {
                        myGroupBalance += amount;
                    }

                    // 2. Did I Split?
                    if (exp.splits) {
                        exp.splits.forEach(split => {
                            let isSplitUser = false;
                            const sUser = split.user;

                            if (sUser) {
                                const sId = sUser._id || sUser;
                                if (extendedIdentifiers.has(String(sId))) isSplitUser = true;

                                if (!isSplitUser) {
                                    const sName = (typeof sUser === 'object' ? sUser.name : String(sUser));
                                    if (sName && extendedIdentifiers.has(sName.toLowerCase().trim())) isSplitUser = true;
                                }
                            }

                            if (!isSplitUser && split.userName && extendedIdentifiers.has(split.userName.toLowerCase().trim())) {
                                isSplitUser = true;
                            }

                            if (isSplitUser) {
                                myGroupBalance -= split.amount;

                                // Calculate Spending Stats
                                // Exclude Settlements (Debt Repayments/Receivals) from "Spending"
                                if (exp.date && exp.category !== 'Settlement') {
                                    const expDate = new Date(exp.date);
                                    if (!isNaN(expDate.getTime())) {
                                        // Check Today
                                        if (expDate.toDateString() === today.toDateString()) {
                                            todaySpending += split.amount;
                                        }
                                        // Check This Month
                                        if (expDate.getMonth() === today.getMonth() && expDate.getFullYear() === today.getFullYear()) {
                                            monthSpending += split.amount;
                                        }
                                    }
                                }
                            }
                        });
                    }
                });

                // Floating point fix
                myGroupBalance = Math.round(myGroupBalance * 100) / 100;

                if (myGroupBalance > 0.01) totalOwed += myGroupBalance;
                else if (myGroupBalance < -0.01) totalOwe += Math.abs(myGroupBalance);

                balances[groupDetail._id] = myGroupBalance;
            });
            setGroupBalances(balances);

            setStats({
                totalOwed,
                totalOwe,
                netBalance: totalOwed - totalOwe,
                todaySpending,
                monthSpending
            });

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch groups');
        } finally {
            setLoading(false);
        }
    };

    const handleGroupCreated = () => {
        fetchGroups();
    };

    const getTypeEmoji = (type) => {
        switch (type) {
            case 'Trip': return '✈️';
            case 'Home': return '🏠';
            case 'Couple': return '❤️';
            default: return '👥';
        }
    };

    const accordionStyle = {
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        boxShadow: 'none',
        '&:before': { display: 'none' }, // Remove default divider
        mb: 2
    };

    const accordionSummaryStyle = {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.05)',
        minHeight: 36, // Reduced from 45
        '&.Mui-expanded': {
            minHeight: 36,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottom: 'none'
        },
        '& .MuiAccordionSummary-content': {
            margin: '6px 0' // Reduced from 10px
        }
    };

    const accordionDetailsStyle = {
        p: 1.5,
        border: '1px solid rgba(255,255,255,0.05)',
        borderTop: 'none',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.01)'
    };

    return (
        <PageContainer>
            <PageHeader
                title="👥 Groups"
                subtitle="Track shared expenses with friends and family"
                actionLabel="Create Group"
                onAction={() => setIsAddDialogOpen(true)}
            />

            {/* Hero Banner */}
            <Box sx={{ mb: 3, mt: 1 }}>
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        p: { xs: 3, sm: 4 },
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Abstract SVG Background */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0.15,
                            pointerEvents: 'none'
                        }}
                    >
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                                </linearGradient>
                            </defs>
                            <circle cx="10%" cy="20%" r="120" fill="url(#grad1)" />
                            <circle cx="85%" cy="75%" r="150" fill="url(#grad1)" />
                            <circle cx="70%" cy="15%" r="80" fill="#3b82f6" opacity="0.6" />
                            <circle cx="25%" cy="80%" r="100" fill="#10b981" opacity="0.6" />
                            <path d="M0,100 Q150,50 300,100 T600,100" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.5" />
                            <path d="M100,0 Q200,100 300,50 T500,80" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.5" />
                        </svg>
                    </Box>
                    <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box
                            sx={{
                                width: { xs: 60, sm: 80 },
                                height: { xs: 60, sm: 80 },
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: { xs: '1.25rem', sm: '1.75rem' },
                                    fontWeight: 700,
                                    color: 'white',
                                    mb: 0.5,
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                Group Expense Tracker
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                                    color: '#94a3b8',
                                    fontWeight: 500
                                }}
                            >
                                Split expenses, track balances, and settle up with friends
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Financial Overview - Optimized Compact Design */}
            {!loading && (
                <Box sx={{ mb: 2.5 }}>
                    <Typography
                        sx={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            mb: 1.2,
                            color: '#FFFFFF',
                            letterSpacing: '0.3px'
                        }}
                    >
                        Financial Overview
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                            gap: 1.2
                        }}
                    >
                        {/* Card 1 - You Are Owed */}
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '12px',
                                p: 1.8,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                                }
                            }}
                        >
                            <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>📈</Typography>
                            <Typography
                                sx={{
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    color: '#10B981',
                                    mb: 0.3,
                                    lineHeight: 1
                                }}
                            >
                                {formatCurrency(stats.totalOwed)}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.6rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.8px',
                                    color: 'rgba(16, 185, 129, 0.7)'
                                }}
                            >
                                You Are Owed
                            </Typography>
                        </Box>

                        {/* Card 2 - You Owe */}
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.02) 100%)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                p: 1.8,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
                                }
                            }}
                        >
                            <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>📉</Typography>
                            <Typography
                                sx={{
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    color: '#EF4444',
                                    mb: 0.3,
                                    lineHeight: 1
                                }}
                            >
                                {formatCurrency(stats.totalOwe)}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.6rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.8px',
                                    color: 'rgba(239, 68, 68, 0.7)'
                                }}
                            >
                                You Owe
                            </Typography>
                        </Box>

                        {/* Card 3 - Net Balance */}
                        <Box
                            sx={{
                                background: stats.netBalance >= 0
                                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)'
                                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.02) 100%)',
                                border: stats.netBalance >= 0 ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                p: 1.8,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                gridColumn: { xs: 'span 2', sm: 'auto' },
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: stats.netBalance >= 0 ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 4px 12px rgba(239, 68, 68, 0.15)'
                                }
                            }}
                        >
                            <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>⚖️</Typography>
                            <Typography
                                sx={{
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    color: stats.netBalance >= 0 ? '#3B82F6' : '#EF4444',
                                    mb: 0.3,
                                    lineHeight: 1
                                }}
                            >
                                {formatCurrency(stats.netBalance)}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.6rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.8px',
                                    color: stats.netBalance >= 0 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                                }}
                            >
                                Net Balance
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Active Groups Section */}
            <Box sx={{ mt: 2 }}> {/* Reduced mt from 2.5 */}
                <Typography
                    sx={{
                        fontSize: '0.9rem', // Reduced from 1rem
                        fontWeight: 600,
                        mb: 1, // Reduced from 1.5
                        color: '#FFFFFF'
                    }}
                >
                    Active Groups
                </Typography>

                {loading ? (
                    <PageLoader message="Loading Groups..." />
                ) : groups.length === 0 ? (
                    /* Clean Empty State */
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 4, // Reduced from 6
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}
                    >
                        <GroupIcon sx={{ fontSize: 32, color: '#6B7280', mb: 1.5, opacity: 0.6 }} /> {/* Reduced size */}
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', mb: 0.5 }}>
                            No groups yet
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>
                            Create a group to start splitting expenses
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setIsAddDialogOpen(true)}
                            sx={{
                                backgroundColor: '#14B8A6',
                                color: '#FFFFFF',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 2,
                                py: 1,
                                fontSize: '0.85rem',
                                '&:hover': {
                                    backgroundColor: '#0D9488'
                                }
                            }}
                        >
                            Create your first group
                        </Button>
                    </Box>
                ) : (
                    /* Clean List View */

                    <Stack spacing={1}> {/* Reduced spacing */}
                        {groups.map((group) => (
                            <Card
                                key={group._id}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px', // Reduced radius
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderColor: 'rgba(255,255,255,0.15)'
                                    },
                                    '&:active': {
                                        backgroundColor: 'rgba(255,255,255,0.06)'
                                    }
                                }}
                                onClick={() => navigate(`/app/groups/${group._id}`)}
                            >
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}> {/* Reduced padding */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}> {/* Reduced gap */}
                                        {/* Group Icon - 32px circle (Reduced from 40) */}
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem', // Reduced font
                                                flexShrink: 0
                                            }}
                                        >
                                            {getTypeEmoji(group.type)}
                                        </Box>

                                        {/* Group Details */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.8rem', // Reduced from 0.95
                                                    fontWeight: 600,
                                                    color: '#FFFFFF',
                                                    mb: 0,
                                                    lineHeight: 1.3
                                                }}
                                            >
                                                {group.name}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.65rem', // Reduced from 0.75
                                                    color: '#94A3B8',
                                                    fontWeight: 400
                                                }}
                                            >
                                                {group.type} · {group.members.length} members
                                            </Typography>

                                            {/* Overlapping Avatars */}
                                            <AvatarGroup
                                                max={4}
                                                sx={{
                                                    mt: 0.75,
                                                    justifyContent: 'flex-start',
                                                    '& .MuiAvatar-root': {
                                                        width: 20,
                                                        height: 20,
                                                        fontSize: '0.6rem',
                                                        border: '2px solid rgba(15, 23, 42, 1)',
                                                        backgroundColor: '#14B8A6',
                                                        fontWeight: 600
                                                    }
                                                }}
                                            >
                                                {group.members.map((member, idx) => {
                                                    const { url, initials, backgroundColor } = getAvatarConfig(member.name);
                                                    return (
                                                        <Avatar
                                                            key={member._id || member.userId || member.email || idx}
                                                            alt={member.name}
                                                            src={url}
                                                            sx={{
                                                                width: 20,
                                                                height: 20,
                                                                border: '2px solid rgba(15, 23, 42, 1)',
                                                                background: `linear-gradient(135deg, ${backgroundColor}, ${alpha(backgroundColor, 0.7)})`,
                                                                fontSize: '0.6rem',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            {initials}
                                                        </Avatar>
                                                    );
                                                })}
                                            </AvatarGroup>
                                        </Box>

                                        {/* Arrow Icon */}
                                        <ArrowForwardIcon
                                            sx={{
                                                color: '#6B7280',
                                                fontSize: '1rem', // Reduced
                                                flexShrink: 0
                                            }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Box>

            <AddGroupDialog
                open={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onGroupCreated={handleGroupCreated}
            />
        </PageContainer >
    );
}
