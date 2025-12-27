import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Stack,
    Tabs,
    Tab,
    Divider,
    List,
    ListItem,
    Tooltip,
    ListItemAvatar,
    ListItemText,
    Paper,
    Menu,
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Restaurant as FoodIcon,
    Flight as TravelIcon,
    Home as HomeIcon,
    LocalHospital as HealthIcon,
    Commute as TransportIcon,
    Bolt as UtilitiesIcon,
    SportsEsports as EntertainmentIcon,
    Receipt as BillIcon,
    AttachMoney as MoneyIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { groupService } from '../services/groupService';
import PageContainer from '../components/layout/PageContainer';
import AddGroupExpenseDialog from '../components/groups/AddGroupExpenseDialog';
import SettleDebtDialog from '../components/groups/SettleDebtDialog';
import AddGroupDialog from '../components/groups/AddGroupDialog';
import GroupAnalytics from '../components/groups/GroupAnalytics';
import ConfirmDialog from '../components/common/ConfirmDialog';

import { generateGroupReport, generateGroupCSV } from '../utils/groupReport';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

export default function GroupDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuthStore();
    const [user, setUser] = useState(null);

    // Get user from auth store or localStorage
    useEffect(() => {
        if (authUser) {
            setUser(authUser);
        } else {
            // Fallback: try to get from localStorage
            const savedState = localStorage.getItem('auth-storage');
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    if (parsed.state?.user) {
                        console.log('✅ Retrieved user from localStorage:', parsed.state.user);
                        setUser(parsed.state.user);
                    }
                } catch (e) {
                    console.error('Failed to parse auth from localStorage:', e);
                }
            }
        }
    }, [authUser]);

    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
    const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [exportAnchorEl, setExportAnchorEl] = useState(null);

    useEffect(() => {
        fetchGroupDetails();
    }, [id]);

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            const data = await groupService.getGroupDetails(id);
            setGroup(data);
            setExpenses(data.expenses || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch group details');
        } finally {
            setLoading(false);
        }
    };


    const handleDownloadReport = () => {
        if (group && expenses) {
            generateGroupReport(group, expenses, balances);
            setExportAnchorEl(null);
            toast.success('PDF Report downloaded');
        }
    };


    const handleDownloadCSV = () => {
        if (group && expenses) {
            generateGroupCSV(group, expenses);
            setExportAnchorEl(null);
            toast.success('CSV Export downloaded');
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        try {
            await groupService.deleteExpense(id, expenseId);
            toast.success('Expense deleted');
            fetchGroupDetails();
        } catch (err) {
            toast.error('Failed to delete expense');
        }
    };

    const handleDeleteGroup = async () => {
        try {
            await groupService.deleteGroup(id);
            toast.success('Group deleted');
            navigate('/app/groups');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete group');
        }
    };

    // Calculate Balances Logic (Complex!)
    const balances = useMemo(() => {
        if (!group || !user) return {};

        // Map memberId -> Balance (Positive = Owed, Negative = Owes)
        const balanceMap = {};
        group.members.forEach(m => {
            // For registered users: userId._id (populated) or userId (string)
            // For shadow users: userId is already the hash string
            const key = m.userId?._id || m.userId || m.email;
            balanceMap[key] = 0;
        });

        expenses.forEach(exp => {
            // Add null safety for old data
            if (!exp.paidBy) return;

            const payerId = exp.paidBy._id || exp.paidBy;
            const amount = exp.amount;

            // Payer "paid" effectively.
            // Wait, net balance logic:
            // Payer Paid X. 
            // Splitters "Consumed" Y.
            // Balance = Paid - Consumed.

            if (balanceMap[payerId] === undefined) balanceMap[payerId] = 0;
            balanceMap[payerId] += amount;

            exp.splits.forEach(split => {
                const userId = split.user?._id || split.user;
                if (!userId) return; // Skip if no user linked
                if (balanceMap[userId] === undefined) balanceMap[userId] = 0;
                balanceMap[userId] -= split.amount; // They consumed this much
            });
        });

        return balanceMap;
    }, [group, expenses, user]);

    const myBalance = group && user ? balances[user._id] || 0 : 0;

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Food and Drink': return <FoodIcon />;
            case 'Transportation': return <TransportIcon />;
            case 'Home': return <HomeIcon />;
            case 'Utilities': return <UtilitiesIcon />;
            case 'Entertainment': return <EntertainmentIcon />;
            case 'Life': return <HealthIcon />; // Mapping Life to Health/Heart
            case 'Settlement': return <MoneyIcon />;
            default: return <BillIcon />;
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!group) return <Alert severity="warning">Group not found</Alert>;

    return (
        <PageContainer>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/app/groups')}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    Back to Groups
                </Button>

                {/* Group Info + Balance - Collapsible Section */}
                <Accordion
                    sx={{
                        mb: 3,
                        borderRadius: '12px !important',
                        background: myBalance >= 0
                            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)'
                            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                        '&:before': { display: 'none' },
                        boxShadow: 'none'
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            px: 3,
                            py: 1.5,
                            '& .MuiAccordionSummary-content': { my: 1 }
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%', pr: 2 }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                                    {group.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                                    {group.members.length} members
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="baseline">
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: myBalance >= 0 ? 'success.main' : 'error.main',
                                        opacity: 0.8,
                                        fontWeight: 500
                                    }}
                                >
                                    {myBalance >= 0 ? 'Owed' : 'Owe'}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 800,
                                        color: myBalance >= 0 ? 'success.main' : 'error.main'
                                    }}
                                >
                                    {formatCurrency(Math.abs(myBalance))}
                                </Typography>
                            </Stack>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7, mb: 2 }}>
                            Created {new Date(group.createdAt).toLocaleDateString()}
                        </Typography>

                        <Divider sx={{ my: 2, opacity: 0.3 }} />

                        {/* Full Balance with Button */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1.5} alignItems="baseline">
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: myBalance >= 0 ? 'success.main' : 'error.main',
                                        opacity: 0.8,
                                        fontWeight: 500
                                    }}
                                >
                                    {myBalance >= 0 ? 'You are owed' : 'You owe'}
                                </Typography>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 900,
                                        color: myBalance >= 0 ? 'success.main' : 'error.main',
                                        letterSpacing: '-0.02em'
                                    }}
                                >
                                    {formatCurrency(Math.abs(myBalance))}
                                </Typography>
                            </Stack>
                            {Math.abs(myBalance) > 0.1 && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    color={myBalance > 0 ? 'success' : 'error'}
                                    onClick={() => setIsSettleDialogOpen(true)}
                                    sx={{
                                        minWidth: 130,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        borderRadius: 2,
                                        px: 3
                                    }}
                                >
                                    Settle Up
                                </Button>
                            )}
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                {/* Action Buttons Section */}
                <Stack direction="row" spacing={1.5} sx={{ mb: 3, justifyContent: 'flex-end' }}>
                    <Tooltip title="Add Expense" arrow>
                        <IconButton
                            size="large"
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' }
                            }}
                            onClick={() => setIsExpenseDialogOpen(true)}
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem />

                    <Tooltip title="Export" arrow>
                        <IconButton
                            size="large"
                            onClick={(e) => setExportAnchorEl(e.currentTarget)}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit" arrow>
                        <IconButton
                            size="large"
                            onClick={() => setIsEditDialogOpen(true)}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete" arrow>
                        <IconButton
                            size="large"
                            color="error"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={exportAnchorEl}
                        open={Boolean(exportAnchorEl)}
                        onClose={() => setExportAnchorEl(null)}
                    >
                        <MenuItem onClick={handleDownloadReport}>Download PDF</MenuItem>
                        <MenuItem onClick={handleDownloadCSV}>Export CSV</MenuItem>
                    </Menu>
                </Stack>

            </Box>

            {/* Tabs */}
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tab label="Dashboard" />
                <Tab label="Expenses" />
                <Tab label="Balances" />
            </Tabs>

            {/* Expenses List */}
            <Box role="tabpanel" hidden={tabValue !== 1}>
                {tabValue === 1 && (
                    <List>
                        {expenses.length === 0 ? (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                No expenses yet.
                            </Typography>
                        ) : (
                            expenses.map((expense) => (
                                <Paper key={expense._id} sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.02)' }}>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                                {getCategoryIcon(expense.category)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={expense.description}
                                            secondary={
                                                <Typography variant="caption" color="text.secondary">
                                                    {expense.paidBy?.name === user?.name ? 'You' : expense.paidBy?.name || 'Unknown'} paid {formatCurrency(expense.amount)} • {new Date(expense.date).toLocaleString()}
                                                </Typography>
                                            }
                                        />
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: expense.category === 'Settlement' ? 'info.main' :
                                                        (expense.paidBy?._id === user?._id ? 'success.main' : 'error.main')
                                                }}
                                            >
                                                {expense.category === 'Settlement' ? 'Settlement' :
                                                    (expense.paidBy?._id === user?._id ? `+${formatCurrency(expense.amount)}` : `-${formatCurrency(expense.amount)}`)
                                                }
                                            </Typography>
                                            {(expense.paidBy?._id === user?._id || group.createdBy === user?._id) && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteExpense(expense._id)}
                                                    sx={{ ml: 1, opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </ListItem>
                                </Paper>
                            ))
                        )}
                    </List>
                )}
            </Box>

            {/* Balances Tab */}
            <Box role="tabpanel" hidden={tabValue !== 2}>
                {tabValue === 2 && (
                    <Grid container spacing={2}>
                        {Object.entries(balances)
                            .filter(([_, bal]) => Math.abs(bal) > 0.1) // Hide zero balances
                            .map(([memberId, bal]) => {
                                // Find member name
                                const member = group.members.find(m => (m.userId?._id === memberId || m.userId === memberId));
                                const name = member ? member.name : 'Unknown';
                                const isMe = memberId === user?._id;

                                return (
                                    <Grid item xs={12} sm={6} key={memberId}>
                                        <Card variant="outlined">
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar>{name?.[0] || '?'}</Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {isMe ? 'You' : name}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ color: bal >= 0 ? 'success.main' : 'error.main', fontWeight: 500 }}
                                                    >
                                                        {bal >= 0 ? 'Gets back' : 'Owes'} {formatCurrency(Math.abs(bal))}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        {Object.keys(balances).length === 0 && (
                            <Typography sx={{ p: 2 }}>Everyone is settled up!</Typography>
                        )}
                    </Grid>
                )}
            </Box>

            {/* Dashboard Tab (Now First) */}
            <Box role="tabpanel" hidden={tabValue !== 0}>
                {tabValue === 0 && (
                    <GroupAnalytics
                        expenses={expenses}
                        members={group.members}
                        currency={group.currency}
                        currentUser={user}
                    />
                )}
            </Box>



            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Delete Group"
                content="Are you sure you want to delete this group? All expenses will be permanently removed."
                onConfirm={handleDeleteGroup}
            />

            <AddGroupExpenseDialog
                open={isExpenseDialogOpen}
                onClose={() => {
                    setIsExpenseDialogOpen(false);
                    fetchGroupDetails();
                }}
                group={group}
                currentUser={user}
            />

            <SettleDebtDialog
                open={isSettleDialogOpen}
                onClose={() => {
                    setIsSettleDialogOpen(false);
                    fetchGroupDetails();
                }}
                group={group}
                currentUser={user}
                balances={balances}
                onSettled={() => {
                    fetchGroupDetails();
                }}
            />

            <AddGroupDialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onGroupCreated={() => {
                    setIsEditDialogOpen(false);
                    fetchGroupDetails();
                }}
                group={group}
            />

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteGroup}
                title="Delete Group"
                message="Are you sure you want to delete this group? All expenses and data will be permanently removed."
            />
        </PageContainer>
    );
}
