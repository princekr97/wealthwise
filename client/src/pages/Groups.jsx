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
    ExpandMore as ExpandMoreIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Event as CalendarIcon,
    LocationOn as MapPinIcon,
    People as UsersIcon,
    MonetizationOn as MoneyIcon,
    AccountBalance as BalanceIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../services/groupService';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import PremiumButton from '../components/common/PremiumButton';
import AddGroupDialog from '../components/groups/AddGroupDialog';
import { formatCurrency, formatDate } from '../utils/formatters';
import SummaryCardGrid from '../components/layout/SummaryCardGrid';
import SummaryCard from '../components/layout/SummaryCard';
import PageLoader from '../components/common/PageLoader';
import { useAuthStore } from '../store/authStore';
import { useGroupStore } from '../store/groupStore';
import { getAvatarConfig } from '../utils/avatarHelper';


export default function Groups() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        groups,
        loading,
        groupStats: stats,
        groupBalances,
        fetchGroups: fetchGroupsFromStore,
        setStats,
        setBalances,
        isStale
    } = useGroupStore();

    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

    // Initial fetch
    useEffect(() => {
        if (user) {
            // Only show full loader if data is stale or empty
            const shouldForce = groups.length === 0;
            fetchGroups(shouldForce);
        }
    }, [user?._id]);

    // Refresh data silently when user returns to this page
    useEffect(() => {
        const handleFocus = () => {
            if (user && isStale()) {
                fetchGroups(false, true); // Silent background refresh if stale
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user?._id]);

    const fetchGroups = async (force = false, silent = false) => {
        // Prevent multiple simultaneous fetches if not forced
        if (!force && !isStale() && groups.length > 0) return;

        try {
            if (!silent) setLocalLoading(true);

            // Get base group list
            const groupsData = await fetchGroupsFromStore(force, silent);

            // Note: Recalculating stats locally for now until backend supports pre-calculated stats
            let totalOwed = 0;
            let totalOwe = 0;
            let todaySpending = 0;
            let monthSpending = 0;
            const today = new Date();

            const promises = groupsData.map(g => groupService.getGroupDetails(g._id));
            const details = await Promise.all(promises);
            const balances = {};

            const extendedIdentifiers = new Set(myIdentifiers);

            details.forEach(groupDetail => {
                if (!groupDetail || !groupDetail.expenses) return;

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

                    if (isPayer) myGroupBalance += amount;

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
                                if (exp.date && exp.category !== 'Settlement') {
                                    const expDate = new Date(exp.date);
                                    if (!isNaN(expDate.getTime())) {
                                        if (expDate.toDateString() === today.toDateString()) todaySpending += split.amount;
                                        if (expDate.getMonth() === today.getMonth() && expDate.getFullYear() === today.getFullYear()) monthSpending += split.amount;
                                    }
                                }
                            }
                        });
                    }
                });

                myGroupBalance = Math.round(myGroupBalance * 100) / 100;
                if (myGroupBalance > 0.01) totalOwed += myGroupBalance;
                else if (myGroupBalance < -0.01) totalOwe += Math.abs(myGroupBalance);
                balances[groupDetail._id] = myGroupBalance;
            });

            setBalances(balances);
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
            setLocalLoading(false);
        }
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

    const handleGroupCreated = () => {
        fetchGroups(true);
    };

    if (localLoading && groups.length === 0) return <PageLoader message="Loading Groups..." />;

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
                        background: 'linear-gradient(135deg, rgba(65, 118, 202, 0.1) 0%, rgba(2, 30, 21, 0.1) 100%)',
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
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                            <TrendingUpIcon sx={{ fontSize: '1.6rem', mb: 0.5, color: '#10B981', filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.2))' }} />
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
                            <TrendingDownIcon sx={{ fontSize: '1.6rem', mb: 0.5, color: '#EF4444', filter: 'drop-shadow(0 4px 6px rgba(239, 68, 68, 0.2))' }} />
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
                            <BalanceIcon sx={{
                                fontSize: '1.6rem',
                                mb: 0.5,
                                color: stats.netBalance >= 0 ? '#3B82F6' : '#EF4444',
                                filter: stats.netBalance >= 0
                                    ? 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.2))'
                                    : 'drop-shadow(0 4px 6px rgba(239, 68, 68, 0.2))'
                            }} />
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
            <Box sx={{ mt: 2 }}>
                <Typography
                    sx={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        mb: 1,
                        color: '#FFFFFF'
                    }}
                >
                    Active Groups
                </Typography>

                {loading && groups.length === 0 ? (
                    <PageLoader message="Loading Groups..." />
                ) : groups.length === 0 ? (
                    /* Clean Empty State */
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 4,
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}
                    >
                        <GroupIcon sx={{ fontSize: 32, color: '#6B7280', mb: 1.5, opacity: 0.6 }} />
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', mb: 0.5 }}>
                            No groups yet
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2 }}>
                            Create a group to start splitting expenses
                        </Typography>
                        <PremiumButton
                            variant="primary"
                            startIcon={<AddIcon />}
                            onClick={() => setIsAddDialogOpen(true)}
                            sx={{ mt: 1 }}
                        >
                            Create your first group
                        </PremiumButton>
                    </Box>
                ) : (
                    /* Clean List View with improved clusters */
                    <Stack spacing={1}>
                        {groups.map((group) => {
                            const balance = groupBalances[group._id] || 0;
                            const isOwed = balance > 0.01;
                            const isOwe = balance < -0.01;

                            return (
                                <Box
                                    key={group._id}
                                    onClick={() => navigate(`/app/groups/${group._id}`)}
                                    sx={{
                                        position: 'relative',
                                        background: 'rgba(30, 41, 59, 0.25)',
                                        backdropFilter: 'blur(24px)',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            background: 'rgba(30, 41, 59, 0.45)',
                                            borderColor: 'rgba(255, 255, 255, 0.12)',
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                                            '& .action-arrow-box': {
                                                background: 'rgba(255,255,255,0.1)',
                                                color: '#F8FAFC',
                                                transform: 'scale(1.1)'
                                            },
                                            '& .accent-bar': { opacity: 1 }
                                        }
                                    }}
                                >
                                    <Box sx={{ p: 2 }}>
                                        {/* Row 1: Identity & Action */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 0 }}>
                                                {/* Icon Box */}
                                                <Box sx={{
                                                    width: 44, height: 44,
                                                    borderRadius: '14px',
                                                    background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.15) 0%, rgba(138, 43, 226, 0.15) 100%)',
                                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.4rem',
                                                    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.4)',
                                                    flexShrink: 0
                                                }}>
                                                    {getTypeEmoji(group.type)}
                                                </Box>

                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography sx={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: 900,
                                                        color: '#F8FAFC',
                                                        mb: 0.4,
                                                        letterSpacing: '-0.02em',
                                                        lineHeight: 1.2,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {group.name}
                                                    </Typography>
                                                    <Box sx={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 0.75,
                                                        py: 0.5, px: 1.25, bg: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        <MapPinIcon sx={{ fontSize: 13, color: '#64748B' }} />
                                                        <Typography sx={{
                                                            fontSize: '0.65rem',
                                                            fontWeight: 800,
                                                            color: '#94A3B8',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.1em'
                                                        }}>
                                                            {group.type}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box className="action-arrow-box" sx={{
                                                width: 34, height: 34,
                                                borderRadius: '10px', bg: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#475569', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                                flexShrink: 0
                                            }}>
                                                <ArrowForwardIcon sx={{ fontSize: 16 }} />
                                            </Box>
                                        </Box>

                                        {/* Row 2: Members & Financial Status */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flexShrink: 1 }}>
                                                <AvatarGroup
                                                    max={3}
                                                    sx={{
                                                        '& .MuiAvatar-root': {
                                                            width: 28, height: 28,
                                                            border: '2px solid #0F172A !important',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 900,
                                                            background: 'rgba(30, 41, 59, 0.8)'
                                                        },
                                                        '& .MuiAvatarGroup-avatar': {
                                                            background: '#d5aa1bff !important',
                                                            color: '#0F172A !important',
                                                            border: 'none !important',
                                                            fontWeight: 900
                                                        }
                                                    }}
                                                >
                                                    {group.members.map((member, idx) => {
                                                        const { url, initials, backgroundColor } = getAvatarConfig(member.name);
                                                        return (
                                                            <Avatar key={member._id || idx} src={url} sx={{ background: backgroundColor }}>
                                                                {initials}
                                                            </Avatar>
                                                        );
                                                    })}
                                                </AvatarGroup>

                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.8,
                                                    px: 0.8,
                                                    py: 0.2,
                                                    borderRadius: '8px',
                                                    background: 'rgba(148, 163, 184, 0.08)',
                                                    border: '1px solid rgba(148, 163, 184, 0.12)',
                                                    ml: 0.5
                                                }}>
                                                    <UsersIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                                                    <Typography sx={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: 800,
                                                        color: '#CBD5E1',
                                                        lineHeight: 1
                                                    }}>
                                                        {group.members.length}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Right side: Redesigned Ultra-Compact Status Badge */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                                                <Box sx={{
                                                    px: 1.2, py: 0.6, borderRadius: '8px',
                                                    background: isOwed ? 'rgba(52, 211, 153, 0.06)' : isOwe ? 'rgba(248, 113, 113, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                                                    border: '1px solid',
                                                    borderColor: isOwed ? 'rgba(52, 211, 153, 0.15)' : isOwe ? 'rgba(248, 113, 113, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                                                    display: 'flex', alignItems: 'center', gap: 0.5
                                                }}>
                                                    {isOwed ? (
                                                        <TrendingUpIcon sx={{ fontSize: 13, color: '#34D399' }} />
                                                    ) : isOwe ? (
                                                        <TrendingDownIcon sx={{ fontSize: 13, color: '#F87171' }} />
                                                    ) : null}
                                                    <Typography sx={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: 900,
                                                        color: isOwed ? '#34D399' : isOwe ? '#F87171' : '#475569',
                                                        letterSpacing: '-0.01em',
                                                        fontFamily: "'Outfit', sans-serif"
                                                    }}>
                                                        {isOwed ? '+' : isOwe ? '-' : ''}₹{Math.abs(balance).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{
                                                    fontSize: '0.5rem',
                                                    fontWeight: 800,
                                                    color: isOwed ? '#34D399' : isOwe ? '#F87171' : '#475569',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    mt: 0.25,
                                                    opacity: 0.7
                                                }}>
                                                    {isOwed ? 'RECEIVE' : isOwe ? 'YOU OWE' : 'SETTLED'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Row 3: Meta Alignment */}
                                        <Box sx={{
                                            mt: 1.5, pt: 1.5,
                                            borderTop: '1px solid rgba(255,255,255,0.06)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#64748B' }}>
                                                <CalendarIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{formatDate(group.createdAt)}</Typography>
                                            </Box>
                                            <Typography sx={{
                                                fontSize: '0.7rem', fontWeight: 800,
                                                color: '#3B82F6', textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                display: 'flex', alignItems: 'center', gap: 0.5,
                                                transition: 'all 0.2s ease',
                                                '&:hover': { color: '#60A5FA', transform: 'translateX(2px)' }
                                            }}>
                                                View Details <ArrowForwardIcon sx={{ fontSize: 12, ml: 0.5 }} />
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Hover Accent Line */}
                                    <Box className="accent-bar" sx={{
                                        position: 'absolute', bottom: 0, left: '10%', right: '10%',
                                        height: 3, opacity: 0,
                                        background: 'linear-gradient(90deg, #34D399 0%, #3B82F6 50%, #8B5CF6 100%)',
                                        borderRadius: '100px 100px 0 0',
                                        transition: 'all 0.4s ease'
                                    }} />
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>

            <AddGroupDialog
                open={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onGroupCreated={handleGroupCreated}
            />
        </PageContainer>
    );
}
