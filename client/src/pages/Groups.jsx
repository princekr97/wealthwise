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
        fetchGroups();
    }, []);

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

                // Calculate my balance in this group
                // (Reusing logic from GroupDetails - ideally keep this DRY in a utility)
                const myId = user?._id;
                let myGroupBalance = 0;

                groupDetail.expenses.forEach(exp => {
                    // Paid by me?
                    const payerId = exp.paidBy?._id || exp.paidBy;
                    if (payerId === myId) {
                        myGroupBalance += exp.amount;
                    }

                    // Splits
                    if (exp.splits) {
                        exp.splits.forEach(split => {
                            const splitUserId = split.user?._id || split.user;
                            if (splitUserId === myId) {
                                myGroupBalance -= split.amount;
                            }
                        });
                    }
                });

                if (myGroupBalance > 0) totalOwed += myGroupBalance;
                if (myGroupBalance < 0) totalOwe += Math.abs(myGroupBalance);
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

            {!loading && (
                <Accordion defaultExpanded sx={accordionStyle}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>Financial Overview</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={accordionDetailsStyle}>
                        <SummaryCardGrid>
                            <SummaryCard
                                label="You are owed"
                                value={formatCurrency(stats.totalOwed)}
                                icon="📈"
                                valueColor="success"
                                subtitle="Total from all groups"
                            />
                            <SummaryCard
                                label="You owe"
                                value={formatCurrency(stats.totalOwe)}
                                icon="📉"
                                valueColor="error"
                                subtitle="Total to all groups"
                            />
                            <SummaryCard
                                label="Net Balance"
                                value={formatCurrency(stats.netBalance)}
                                icon="⚖️"
                                valueColor={stats.netBalance >= 0 ? "success" : "error"}
                                subtitle="Overall position"
                            />
                        </SummaryCardGrid>
                    </AccordionDetails>
                </Accordion>
            )}

            <Box sx={{ mt: 4, px: { xs: 1, sm: 0 } }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2, pl: 1 }}>
                    Active Groups
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : groups.length === 0 ? (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 8,
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            borderRadius: 2,
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}
                    >
                        <GroupIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No groups yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create a group to start sharing expenses seamlessly.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            Create your first group
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(2, 1fr)',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        },
                        gap: { xs: 1.5, sm: 2 },
                        px: { xs: 1, sm: 0 },
                    }}>
                        {groups.map((group) => (
                            <Card
                                key={group._id}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    aspectRatio: '3/4',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                        borderColor: 'primary.main'
                                    }
                                }}
                                onClick={() => navigate(`/app/groups/${group._id}`)}
                            >
                                <CardContent sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    p: 2,
                                    '&:last-child': { pb: 2 }
                                }}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        mb: 1.5
                                    }}>
                                        {getTypeEmoji(group.type)}
                                    </Box>

                                    <Typography variant="h6" sx={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        mb: 0.5,
                                        lineHeight: 1.2,
                                        width: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {group.name}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary" sx={{
                                        mb: 1.5,
                                        display: 'block',
                                        fontSize: '0.75rem'
                                    }}>
                                        {group.type} • {group.members.length} members
                                    </Typography>

                                    <AvatarGroup max={3} sx={{ justifyContent: 'center', mb: 0 }}>
                                        {group.members.map((member) => (
                                            <Avatar
                                                key={member._id || member.userId || member.email}
                                                alt={member.name}
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {member.name[0]}
                                            </Avatar>
                                        ))}
                                    </AvatarGroup>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
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
