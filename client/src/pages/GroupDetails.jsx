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
    ExpandMore as ExpandMoreIcon,
    ShoppingBag as ShoppingIcon,
    School as EducationIcon,
    Spa as PersonalCareIcon,
    ShoppingCart as GroceriesIcon,
    Shield as InsuranceIcon,
    TrendingUp as InvestmentsIcon,
    CardGiftcard as GiftsIcon,
    Savings as SavingsIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { groupService } from '../services/groupService';
import PageContainer from '../components/layout/PageContainer';
import PageLoader from '../components/common/PageLoader';
import AddGroupExpenseDialog from '../components/groups/AddGroupExpenseDialog';
import SettleDebtDialog from '../components/groups/SettleDebtDialog';
import ExpenseDetailsDialog from '../components/groups/ExpenseDetailsDialog';
import AddGroupDialog from '../components/groups/AddGroupDialog';
import AddMemberDialog from '../components/groups/AddMemberDialog'; // Step 595
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
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
    const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
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

    const handleDeleteExpense = (expenseId) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Expense',
            message: 'Are you sure you want to delete this expense? This will permanently remove it from the group records.',
            onConfirm: async () => {
                try {
                    await groupService.deleteExpense(id, expenseId);
                    toast.success('Expense deleted');
                    fetchGroupDetails();
                    setSelectedExpense(null);
                    setConfirmDialog(prev => ({ ...prev, open: false }));
                } catch (err) {
                    toast.error('Failed to delete expense');
                }
            }
        });
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setSelectedExpense(null);
        setIsExpenseDialogOpen(true);
    };

    const [memberToDelete, setMemberToDelete] = useState(null);

    const handleDeleteGroup = async () => {
        try {
            await groupService.deleteGroup(id);
            toast.success('Group deleted');
            navigate('/app/groups');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete group');
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToDelete) return;
        try {
            await groupService.removeMember(id, memberToDelete);
            toast.success('Member removed');
            setMemberToDelete(null);
            fetchGroupDetails();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove member');
        }
    };

    // Helper to get consistent string ID
    const getMemberId = React.useCallback((m) => {
        if (!m) return 'unknown';
        if (m.userId && typeof m.userId === 'object' && m.userId._id) return String(m.userId._id);
        if (m.userId) return String(m.userId);
        return String(m.email || m.name); // Fallback
    }, []);

    /**
     * Get payer name for an expense with multiple fallbacks
     * @param {Object} expense - The expense object
     * @returns {string} Payer name or 'You' if current user
     */
    const getPayerName = React.useCallback((expense) => {
        if (!expense) return 'Unknown';

        const payerId = expense.paidBy?._id || expense.paidBy;

        // Check if it's the current user
        if (payerId && user && String(payerId) === String(user._id)) {
            return 'You';
        }

        // Check paidBy.name (if populated)
        if (expense.paidBy?.name) {
            return expense.paidBy.name;
        }

        // Check stored paidByName
        if (expense.paidByName) {
            return expense.paidByName;
        }

        // Fallback to group members
        if (payerId && group?.members) {
            const payer = group.members.find(m => {
                const mId = m.userId?._id || m.userId || m._id;
                return String(mId) === String(payerId);
            });
            if (payer) return payer.name;
        }

        return 'Unknown';
    }, [user, group]);

    // Calculate Balances Logic
    const balances = useMemo(() => {
        if (!group || !user) return {};

        // Map memberId -> Balance
        const balanceMap = {};



        // Create Lookups for faster & robust matching
        const memberLookup = {}; // Map ID -> RealMemberID
        const nameLookup = {};   // Map Name -> RealMemberID

        group.members.forEach(m => {
            const realId = getMemberId(m);
            balanceMap[realId] = 0;

            memberLookup[realId] = realId;
            if (m.name) nameLookup[m.name.toLowerCase().trim()] = realId;
        });

        const resolveId = (participant) => {
            if (!participant) return null;

            // 1. Try ID
            const id = participant._id || participant.id || (typeof participant === 'string' ? participant : null);
            if (id && memberLookup[String(id)]) return memberLookup[String(id)];

            // 2. Try Name (if ID failed or is null)
            if (participant.name) {
                const name = participant.name.toLowerCase().trim();
                if (nameLookup[name]) return nameLookup[name];
            }

            // 3. Fallback: Return the ID anyway if it exists (for ex-members)
            return id ? String(id) : null;
        };

        // ====================================
        // BALANCE CALCULATION WITH SETTLEMENT SUPPORT
        // ====================================
        expenses.forEach(exp => {
            if (!exp.paidBy) return;

            const payerId = resolveId(exp.paidBy);
            const amount = exp.amount;

            // Calculate Balance Impact
            // Rule: Payer gets credit (+), Split users get debit (-)

            // 1. Payer Logic
            // If I PAID, I am Owed money (or reduce my debt).
            // Example: Paid 500. Balance += 500.
            if (payerId) {
                if (balanceMap[payerId] === undefined) balanceMap[payerId] = 0;
                balanceMap[payerId] += amount;
            }

            // 2. Split/Receiver Logic
            // If I AM IN SPLIT, I Owe money (or reduce my credit).
            // Example: Split 500. Balance -= 500.
            exp.splits.forEach(split => {
                const userId = resolveId(split.user);
                if (!userId) return;
                if (balanceMap[userId] === undefined) balanceMap[userId] = 0;
                balanceMap[userId] -= split.amount;
            });
        });

        return balanceMap;
    }, [group, expenses, user, getMemberId]);

    const myBalance = useMemo(() => {
        if (!group || !user || !balances) return 0;

        // Find me in the group members to ensure we use the same key logic
        const me = group.members.find(m => {
            const mUserId = m.userId && (m.userId._id || m.userId);
            if (mUserId && String(mUserId) === String(user._id)) return true;
            if (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase()) return true;
            return false;
        });

        const myKey = me ? getMemberId(me) : user._id;
        return balances[myKey] || 0;
    }, [group, user, balances, getMemberId]);

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'General': return <MoneyIcon />;
            case 'Food and Drink': return <FoodIcon />;
            case 'Transportation': return <TransportIcon />;
            case 'Home': return <HomeIcon />;
            case 'Utilities': return <UtilitiesIcon />;
            case 'Entertainment': return <EntertainmentIcon />;
            case 'Life': return <HealthIcon />;
            case 'Settlement': return <MoneyIcon />;
            default: return <BillIcon />;
        }
    };

    if (loading) return <PageLoader message="Loading Group Details..." />;
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

                {/* Group Info + Balance - Premium Frosted Glass */}
                <Accordion
                    sx={{
                        mb: 3,
                        borderRadius: '20px !important',
                        background: myBalance >= 0
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(251, 113, 133, 0.08) 100%)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: myBalance >= 0
                            ? '1px solid rgba(16, 185, 129, 0.2)'
                            : '1px solid rgba(255, 107, 107, 0.2)',
                        '&:before': { display: 'none' },
                        boxShadow: myBalance >= 0
                            ? '0 8px 24px rgba(16, 185, 129, 0.12)'
                            : '0 8px 24px rgba(255, 107, 107, 0.12)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{
                            color: myBalance >= 0 ? 'success.main' : 'error.main',
                            transition: 'transform 0.3s ease'
                        }} />}
                        sx={{
                            px: { xs: 2.5, sm: 3 },
                            py: 1.5,
                            '& .MuiAccordionSummary-content': { my: 1.5 },
                            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                                transform: 'rotate(180deg)' // Smooth rotate animation
                            }
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%', pr: 2 }}>
                            <Box>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: { xs: '1.5rem', sm: '1.75rem' }, // 24-28pt
                                        letterSpacing: '-0.01em',
                                        mb: 0.5
                                    }}
                                >
                                    {group.name}
                                </Typography>
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'inline-block',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)',
                                        border: '1px solid rgba(6, 182, 212, 0.3)',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        color: '#06B6D4'
                                    }}
                                >
                                    {group.members.length} members
                                </Box>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="baseline">
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: myBalance >= 0 ? 'success.main' : 'error.main',
                                        opacity: 0.85,
                                        fontWeight: 600,
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {myBalance >= 0 ? 'Owed' : 'Owe'}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                        color: myBalance >= 0 ? '#10B981' : '#FF6B6B',
                                        letterSpacing: '-0.01em'
                                    }}
                                >
                                    {formatCurrency(Math.abs(myBalance))}
                                </Typography>
                            </Stack>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: { xs: 2.5, sm: 3 }, pb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7, mb: 2, fontSize: '0.8rem' }}>
                            Created {new Date(group.createdAt).toLocaleDateString()}
                        </Typography>

                        <Divider sx={{ my: 2, opacity: 0.2 }} />

                        {/* Full Balance with Settle Button */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                            <Stack direction="row" spacing={1.5} alignItems="baseline">
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: myBalance >= 0 ? 'success.main' : 'error.main',
                                        opacity: 0.85,
                                        fontWeight: 600
                                    }}
                                >
                                    {myBalance >= 0 ? 'You are owed' : 'You owe'}
                                </Typography>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 900,
                                        fontSize: { xs: '2rem', sm: '2.5rem' },
                                        color: myBalance >= 0 ? '#10B981' : '#FF6B6B',
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
                                    sx={{
                                        minWidth: 140,
                                        background: myBalance > 0
                                            ? 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)'
                                            : 'linear-gradient(135deg, #FF6B6B 0%, #FB7185 100%)',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        borderRadius: '12px',
                                        px: 3,
                                        py: 1.5,
                                        boxShadow: myBalance > 0
                                            ? '0 4px 16px rgba(16, 185, 129, 0.3)'
                                            : '0 4px 16px rgba(255, 107, 107, 0.3)',
                                        '&:hover': {
                                            background: myBalance > 0
                                                ? 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)'
                                                : 'linear-gradient(135deg, #FF6B6B 0%, #FB7185 100%)',
                                            boxShadow: myBalance > 0
                                                ? '0 6px 24px rgba(16, 185, 129, 0.4)'
                                                : '0 6px 24px rgba(255, 107, 107, 0.4)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    onClick={() => setIsSettleDialogOpen(true)}
                                >
                                    Settle Up
                                </Button>
                            )}
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                {/* Premium Action Buttons - Floating with Clear Hierarchy */}
                <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* Primary CTA - Add Expense (Larger, Gradient) */}
                    <Tooltip title="Add Expense" arrow>
                        <IconButton
                            size="large"
                            sx={{
                                width: { xs: 56, sm: 64 },
                                height: { xs: 56, sm: 64 },
                                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                                    boxShadow: '0 6px 24px rgba(16, 185, 129, 0.5)',
                                    transform: 'translateY(-2px) scale(1.05)'
                                },
                                '&:active': {
                                    transform: 'translateY(0) scale(0.95)'
                                }
                            }}
                            onClick={() => setIsExpenseDialogOpen(true)}
                        >
                            <AddIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                        </IconButton>
                    </Tooltip>

                    {/* Secondary Actions - Ghost Style */}
                    <Tooltip title="Download Report" arrow>
                        <IconButton
                            size="large"
                            sx={{
                                width: 48,
                                height: 48,
                                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                color: 'text.primary',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'rgba(255, 255, 255, 0.4)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                            onClick={(e) => setExportAnchorEl(e.currentTarget)}
                        >
                            <DownloadIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit Group" arrow>
                        <IconButton
                            size="large"
                            sx={{
                                width: 48,
                                height: 48,
                                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                color: 'text.primary',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'rgba(255, 255, 255, 0.4)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                            onClick={() => setIsEditDialogOpen(true)}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Group" arrow>
                        <IconButton
                            size="large"
                            sx={{
                                width: 48,
                                height: 48,
                                border: '1.5px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '12px',
                                color: 'error.main',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    borderColor: 'rgba(239, 68, 68, 0.6)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <DeleteIcon fontSize="small" />
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

            {/* Premium Tabs - Bold Gradient Underline */}
            <Tabs
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    mb: 3,
                    '& .MuiTabs-indicator': {
                        height: 3,
                        background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                        borderRadius: '2px 2px 0 0'
                    },
                    '& .MuiTab-root': {
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        color: 'text.secondary',
                        transition: 'all 0.2s ease',
                        minHeight: 48,
                        '&.Mui-selected': {
                            color: 'primary.main',
                            fontWeight: 700
                        },
                        '&:hover': {
                            color: 'text.primary'
                        }
                    }
                }}
            >
                <Tab label="Dashboard" />
                <Tab label="Expenses" />
                <Tab label="Balances" />
            </Tabs>

            {/* Expenses List (Index 1) */}
            <Box role="tabpanel" hidden={tabValue !== 1}>
                {tabValue === 1 && (
                    <List>
                        {expenses.length === 0 ? (
                            <Stack alignItems="center" spacing={2.5} sx={{ py: 4.5, px: 2 }}>
                                <Box sx={{
                                    width: 160, // Reduced from 200
                                    height: 128, // Reduced from 160
                                    mb: 1.5,
                                    borderRadius: 3,
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px dashed rgba(255,255,255,0.1)'
                                }}>
                                    <Typography variant="h1" sx={{ fontSize: '3.2rem', opacity: 0.5 }}> {/* Reduced from 4rem */}
                                        {group.type === 'Trip' ? '✈️' : group.type === 'Home' ? '🏠' : '📝'}
                                    </Typography>
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '1.1rem' }}>
                                    No expenses yet
                                </Typography>

                                <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 280 }}> {/* Reduced maxWidth */}
                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        onClick={() => setIsExpenseDialogOpen(true)}
                                        sx={{
                                            py: 1.2, // Reduced from 1.5
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                            textTransform: 'none',
                                            fontSize: '0.9rem', // Reduced
                                            fontWeight: 600
                                        }}
                                    >
                                        Add Your First Expense
                                        <Typography component="span" sx={{ display: 'block', fontSize: '0.65rem', opacity: 0.8, mt: 0.4, width: '100%' }}>
                                            (Friends will be added automatically)
                                        </Typography>
                                    </Button>

                                    <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 500 }}>
                                        OR
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        size="large"
                                        fullWidth
                                        onClick={() => setIsAddMemberDialogOpen(true)}
                                        sx={{
                                            py: 1.2, // Reduced
                                            borderRadius: '24px', // Reduced pill
                                            borderColor: 'rgba(255,255,255,0.2)',
                                            color: 'text.primary',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            '&:hover': {
                                                borderColor: 'rgba(255,255,255,0.4)',
                                                bgcolor: 'rgba(255,255,255,0.02)'
                                            }
                                        }}
                                        endIcon={<AddIcon sx={{ bgcolor: '#4f46e5', color: 'white', borderRadius: '50%', p: 0.4, width: 20, height: 20 }} />}
                                    >
                                        Add Your Friends First
                                    </Button>
                                </Stack>
                            </Stack>
                        ) : (
                            expenses.map((expense) => (
                                <Paper
                                    key={expense._id}
                                    onClick={() => setSelectedExpense(expense)}
                                    sx={{
                                        mb: 1.2,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                                    }}
                                > {/* Reduced mb */}
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', width: 36, height: 36, fontSize: '1rem' }}> {/* Smaller avatar */}
                                                {getCategoryIcon(expense.category)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{expense.description}</Typography>}
                                            secondary={
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                    {getPayerName(expense)} paid {formatCurrency(expense.amount)} • {new Date(expense.date).toLocaleString()}
                                                </Typography>
                                            }
                                        />
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem', // Reduced
                                                    color: expense.category === 'Settlement' ? 'info.main' : 'success.main'
                                                }}
                                            >
                                                {expense.category === 'Settlement' ? 'Settlement' :
                                                    formatCurrency(expense.amount)
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



            {/* Dashboard Tab (Index 0) */}
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

            {/* Balances Tab */}
            <Box role="tabpanel" hidden={tabValue !== 2}>
                {tabValue === 2 && (
                    <Stack spacing={1.5}> {/* Use Stack instead of Grid for consistent width */}
                        {Object.entries(balances)
                            .filter(([_, bal]) => Math.abs(bal) > 0.1) // Hide zero balances
                            .map(([memberId, bal]) => {
                                // Find member name using consistent ID logic
                                const member = group.members.find(m => {
                                    const mId = (m.userId && typeof m.userId === 'object' && m.userId._id)
                                        ? String(m.userId._id)
                                        : String(m.userId || m.email || m.name);
                                    return mId === memberId;
                                });

                                const name = member ? member.name : 'Unknown';
                                const isMe = member && (
                                    (member.userId && String(member.userId._id || member.userId) === String(user?._id)) ||
                                    (member.email && user?.email && member.email.toLowerCase() === user.email.toLowerCase())
                                );

                                return (
                                    <Box
                                        key={memberId}
                                        sx={{
                                            position: 'relative',
                                            p: 1.75,
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: 'rgba(255,255,255,0.05)',
                                                borderColor: 'rgba(255,255,255,0.15)',
                                                '& .delete-btn': { opacity: 1, transform: 'scale(1)' }
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                                            <Avatar
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    bgcolor: '#f1f5f9',
                                                    boxShadow: `0 4px 12px ${isMe ? 'rgba(59, 130, 246, 0.3)' : (bal >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)')}`
                                                }}
                                                src={member?.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`}
                                                alt={name}
                                            />

                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>
                                                    {isMe ? 'You' : name}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.8rem',
                                                        color: '#94A3B8',
                                                        mt: 0.2,
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {bal >= 0 ? 'Gets back' : 'Owes'} <span style={{ color: bal >= 0 ? '#10B981' : '#F43F5E', fontWeight: 700 }}>{formatCurrency(Math.abs(bal))}</span>
                                                </Typography>
                                            </Box>

                                            {!isMe && group?.createdBy === user?._id && (
                                                <Tooltip title="Remove member" arrow>
                                                    <IconButton
                                                        className="delete-btn"
                                                        size="small"
                                                        sx={{
                                                            opacity: 0,
                                                            transform: 'scale(0.8)',
                                                            transition: 'all 0.2s ease',
                                                            color: '#94a3b8',
                                                            '&:hover': { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }
                                                        }}
                                                        onClick={() => setMemberToDelete(memberId)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        {Object.keys(balances).length === 0 && (
                            <Typography sx={{ p: 2 }}>Everyone is settled up!</Typography>
                        )}
                    </Stack>
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
                    setEditingExpense(null);
                    fetchGroupDetails();
                }}
                group={group}
                currentUser={user}
                onAddMemberClick={() => setIsAddMemberDialogOpen(true)}
                initialExpense={editingExpense}
            />

            <AddMemberDialog
                open={isAddMemberDialogOpen}
                onClose={() => setIsAddMemberDialogOpen(false)}
                groupId={group?._id}
                onMemberAdded={fetchGroupDetails}
            />
            {/* Expense Details Dialog */}
            <ExpenseDetailsDialog
                open={Boolean(selectedExpense)}
                onClose={() => setSelectedExpense(null)}
                expense={selectedExpense}
                currentUser={user}
                groupMembers={group?.members}
                onDelete={(id) => {
                    handleDeleteExpense(id);
                }}
                onEdit={(exp) => {
                    handleEditExpense(exp);
                }}
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

            <ConfirmDialog
                open={!!memberToDelete}
                onClose={() => setMemberToDelete(null)}
                onConfirm={handleRemoveMember}
                title="Remove Member"
                message="Are you sure you want to remove this member? ALL expenses paid by them or involving them will be PERMANENTLY DELETED."
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />
        </PageContainer >
    );
}
