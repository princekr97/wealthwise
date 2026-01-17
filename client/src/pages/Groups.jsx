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
    AccordionDetails
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
import { useAuthStore } from '../store/authStore';


export default function Groups() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Global Stats
    const [stats, setStats] = useState({
        totalOwed: 0,
        totalOwe: 0,
        netBalance: 0
    });

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
            // We need to fetch details for each group to get expenses and calculate balances
            // This is a bit heavy, but fine for MVP
            let totalOwed = 0;
            let totalOwe = 0;

            const promises = groupsData.map(g => groupService.getGroupDetails(g._id));
            const details = await Promise.all(promises);

            details.forEach(groupDetail => {
                if (!groupDetail.expenses) return;

                // --- ROBUST ID RESOLUTION LOGIC (Same as GroupDetails) ---

                // 1. Helper to get consistent string ID for any member
                const getMemberId = (m) => {
                    if (!m) return 'unknown';
                    if (m.userId && typeof m.userId === 'object' && m.userId._id) return String(m.userId._id);
                    if (m.userId) return String(m.userId);
                    return String(m.email || m.name); // Fallback
                };

                // 2. Build Lookups for this group
                const memberLookup = {};
                const nameLookup = {};

                groupDetail.members.forEach(m => {
                    const realId = getMemberId(m);
                    memberLookup[realId] = realId;
                    if (m.name) nameLookup[m.name.toLowerCase().trim()] = realId;
                });

                // 3. Helper to resolve any participant in an expense to a specific Member ID
                const resolveId = (participant) => {
                    if (!participant) return null;
                    const id = participant._id || participant.id || (typeof participant === 'string' ? participant : null);
                    if (id && memberLookup[String(id)]) return memberLookup[String(id)];

                    if (participant.name) {
                        const name = participant.name.toLowerCase().trim();
                        if (nameLookup[name]) return nameLookup[name];
                    }
                    return id ? String(id) : null;
                };

                // 4. Find "Me" in this group to know MY consistent ID
                const me = groupDetail.members.find(m => {
                    const mUserId = m.userId && (m.userId._id || m.userId);
                    if (mUserId && String(mUserId) === String(user._id)) return true;
                    if (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase()) return true;
                    return false;
                });

                // If I'm not in this group (shouldn't happen for fetched groups), skip
                if (!me) return;

                const myKey = getMemberId(me);
                let myGroupBalance = 0;

                // 5. Calculate Balance
                groupDetail.expenses.forEach(exp => {
                    // Paid by me?
                    const payerId = resolveId(exp.paidBy);
                    if (payerId === myKey) {
                        myGroupBalance += exp.amount;
                    }

                    // Splits
                    if (exp.splits) {
                        exp.splits.forEach(split => {
                            const splitUserId = resolveId(split.user);
                            if (splitUserId === myKey) {
                                myGroupBalance -= split.amount;
                            }
                        });
                    }
                });

                if (myGroupBalance > 0.01) totalOwed += myGroupBalance;
                if (myGroupBalance < -0.01) totalOwe += Math.abs(myGroupBalance);
            });

            setStats({
                totalOwed,
                totalOwe,
                netBalance: totalOwed - totalOwe
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
        minHeight: 48,
        '&.Mui-expanded': {
            minHeight: 48,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottom: 'none'
        },
        '& .MuiAccordionSummary-content': {
            margin: '12px 0'
        }
    };

    const accordionDetailsStyle = {
        p: { xs: 1, sm: 2 },
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

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Financial Overview - Collapsible */}
            {!loading && (
                <Accordion
                    defaultExpanded
                    sx={{
                        backgroundColor: 'transparent',
                        backgroundImage: 'none',
                        boxShadow: 'none',
                        '&:before': { display: 'none' },
                        mb: 2.5 // Reduced mb
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#6B7280', fontSize: '1.2rem' }} />} // Smaller icon
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px', // Slightly smaller radius
                            border: '1px solid rgba(255,255,255,0.08)',
                            minHeight: 45, // Reduced from 56
                            '&.Mui-expanded': {
                                minHeight: 45, // Reduced from 56
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                borderBottom: 'none'
                            },
                            '& .MuiAccordionSummary-content': {
                                margin: '10px 0' // Reduced margin
                            }
                        }}
                    >
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}> {/* Reduced font */}
                            Financial Overview
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                        sx={{
                            p: 2, // Reduced from 2.5
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderTop: 'none',
                            borderBottomLeftRadius: '10px',
                            borderBottomRightRadius: '10px',
                            backgroundColor: 'rgba(255,255,255,0.02)'
                        }}
                    >
                        {/* Clean Balance Cards - 2x2 Grid */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 1.25 // Slightly smaller gap
                            }}
                        >
                            {/* Card 1 - You Are Owed */}
                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px', // Smaller radius
                                    p: 2, // Reduced from 2.5
                                    height: 110, // Reduced from 140
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center'
                                }}
                            >
                                <Typography sx={{ fontSize: '1.6rem', mb: 0.75 }}>📈</Typography> {/* Reduced size/mb */}
                                <Typography
                                    sx={{
                                        fontSize: '1.6rem', // Reduced from 2rem
                                        fontWeight: 700,
                                        color: '#10B981',
                                        mb: 0.25,
                                        lineHeight: 1
                                    }}
                                >
                                    {formatCurrency(stats.totalOwed)}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '0.65rem', // Reduced
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: '#6B7280'
                                    }}
                                >
                                    YOU ARE OWED
                                </Typography>
                            </Box>

                            {/* Card 2 - You Owe */}
                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    p: 2,
                                    height: 110,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center'
                                }}
                            >
                                <Typography sx={{ fontSize: '1.6rem', mb: 0.75 }}>📉</Typography>
                                <Typography
                                    sx={{
                                        fontSize: '1.6rem',
                                        fontWeight: 700,
                                        color: '#FF6B6B',
                                        mb: 0.25,
                                        lineHeight: 1
                                    }}
                                >
                                    {formatCurrency(stats.totalOwe)}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '0.65rem',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: '#6B7280'
                                    }}
                                >
                                    YOU OWE
                                </Typography>
                            </Box>

                            {/* Card 3 - Net Balance (bottom-left, single column) */}
                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    p: 2,
                                    height: 110,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center'
                                }}
                            >
                                <Typography sx={{ fontSize: '1.6rem', mb: 0.75 }}>⚖️</Typography>
                                <Typography
                                    sx={{
                                        fontSize: '1.6rem',
                                        fontWeight: 700,
                                        color: stats.netBalance >= 0 ? '#10B981' : '#FF6B6B',
                                        mb: 0.25,
                                        lineHeight: 1
                                    }}
                                >
                                    {formatCurrency(stats.netBalance)}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '0.65rem',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: '#6B7280'
                                    }}
                                >
                                    NET BALANCE
                                </Typography>
                            </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            )}

            {/* Active Groups Section */}
            <Box sx={{ mt: 2.5 }}> {/* Reduced mt */}
                <Typography
                    sx={{
                        fontSize: '1rem', // Reduced from 1.125rem
                        fontWeight: 600,
                        mb: 1.5,
                        color: '#FFFFFF'
                    }}
                >
                    Active Groups
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: '#14B8A6' }} />
                    </Box>
                ) : groups.length === 0 ? (
                    /* Clean Empty State */
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 6, // Reduced from 8
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}
                    >
                        <GroupIcon sx={{ fontSize: 40, color: '#6B7280', mb: 1.5, opacity: 0.6 }} /> {/* Reduced size */}
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#FFFFFF', mb: 0.5 }}>
                            No groups yet
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8', mb: 2.5 }}>
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
                                borderRadius: '10px',
                                px: 2.5,
                                py: 1.25,
                                fontSize: '0.9rem',
                                '&:hover': {
                                    backgroundColor: '#0D9488'
                                }
                            }}
                        >
                            Create your first group
                        </Button>
                    </Box>
                ) : (
                    /* Clean List View (Splitwise Style) */
                    <Stack spacing={1.25}> {/* Reduced spacing */}
                        {groups.map((group) => (
                            <Card
                                key={group._id}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px', // Reduced radius
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
                                <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}> {/* Reduced padding */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}> {/* Reduced gap */}
                                        {/* Group Icon - 40px circle (Reduced from 48) */}
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.25rem', // Reduced font
                                                flexShrink: 0
                                            }}
                                        >
                                            {getTypeEmoji(group.type)}
                                        </Box>

                                        {/* Group Details */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.95rem', // Reduced from 1.125
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
                                                    fontSize: '0.75rem', // Reduced
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
                                                    mt: 1, // Reduced margin
                                                    justifyContent: 'flex-start',
                                                    '& .MuiAvatar-root': {
                                                        width: 26, // Reduced from 32
                                                        height: 26,
                                                        fontSize: '0.7rem',
                                                        border: '2px solid rgba(15, 23, 42, 1)',
                                                        backgroundColor: '#14B8A6',
                                                        color: '#FFFFFF',
                                                        fontWeight: 600
                                                    }
                                                }}
                                            >
                                                {group.members.map((member, idx) => (
                                                    <Avatar
                                                        key={member._id || member.userId || member.email || idx}
                                                        alt={member.name}
                                                        sx={{
                                                            backgroundColor: [
                                                                '#14B8A6', // Teal
                                                                '#8B5CF6', // Purple
                                                                '#3B82F6', // Blue
                                                                '#F59E0B', // Orange
                                                                '#EC4899', // Pink
                                                                '#10B981'  // Green
                                                            ][idx % 6]
                                                        }}
                                                    >
                                                        {member.name[0].toUpperCase()}
                                                    </Avatar>
                                                ))}
                                            </AvatarGroup>
                                        </Box>

                                        {/* Arrow Icon */}
                                        <ArrowForwardIcon
                                            sx={{
                                                color: '#6B7280',
                                                fontSize: '1.1rem', // Reduced
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
        </PageContainer>
    );
}
