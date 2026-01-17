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
    AccordionDetails,
    alpha
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
    Category as CategoryIcon,
    Hotel as HotelIcon
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
import { calculateSettlements } from '../utils/settlementCalculator';
import { SettlementSuggestionsList } from '../components/groups/SettlementSuggestionCard';
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

    // Refresh handler for expense updates
    const handleExpenseDialogClose = async () => {
        setIsExpenseDialogOpen(false);
        setEditingExpense(null);
        await fetchGroupDetails(); // Force refresh to show new data immediately
    };
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


    const [exporting, setExporting] = useState(false);

    const handleDownloadReport = async () => {
        if (group && expenses) {
            setExportAnchorEl(null);
            setExporting(true);
            try {
                // Tiny delay to let UI render the loader
                await new Promise(resolve => setTimeout(resolve, 100));
                generateGroupReport(group, expenses, balances);
                toast.success('PDF Report downloaded');
            } catch (error) {
                console.error('Export failed:', error);
                toast.error('Failed to generate report');
            } finally {
                setExporting(false);
            }
        }
    };


    const handleDownloadCSV = async () => {
        if (group && expenses) {
            setExportAnchorEl(null);
            setExporting(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 100));
                generateGroupCSV(group, expenses);
                toast.success('CSV Export downloaded');
            } catch (error) {
                console.error('Export failed:', error);
                toast.error('Failed to generate CSV');
            } finally {
                setExporting(false);
            }
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
            // 1. Payer Logic
            let payerParticipant = exp.paidBy;
            if (!payerParticipant && exp.paidByName) {
                payerParticipant = { name: exp.paidByName };
            }

            const payerId = resolveId(payerParticipant);
            const amount = exp.amount;

            // Calculate Balance Impact
            // Rule: Payer gets credit (+), Split users get debit (-)

            // If I PAID, I am Owed money (or reduce my debt).
            // Example: Paid 500. Balance += 500.
            if (payerId) {
                if (balanceMap[payerId] === undefined) balanceMap[payerId] = 0;
                balanceMap[payerId] += amount;
            }

            // 2. Split/Receiver Logic
            exp.splits.forEach(split => {
                let splitParticipant = split.user;
                if (!splitParticipant && split.userName) {
                    splitParticipant = { name: split.userName };
                }

                const userId = resolveId(splitParticipant);

                // DEBUG: Log failures
                if (!userId) {
                    // console.warn(`Failed to resolve split user:`, split.user || split.userName, 'in expense:', exp.description);
                    return;
                }

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

    const getAvatarColor = (name) => {
        if (!name) return '#666';
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 50%)`;
    };

    const getCategoryIcon = (category) => {
        if (!category) return <CategoryIcon />;
        const normalized = category.toLowerCase().trim();

        // Exact matches (lowercase)
        switch (normalized) {
            case 'food':
            case 'food & dining':
            case 'food and drink':
            case 'drinks':
            case 'dining':
                return <FoodIcon />;

            case 'groceries':
                return <GroceriesIcon />;

            case 'travel':
            case 'flight':
                return <TravelIcon />;

            case 'stays':
            case 'hotel':
                return <HotelIcon />;

            case 'bills':
            case 'utilities':
            case 'subscription':
            case 'bill':
                return <BillIcon />;

            case 'shopping':
                return <ShoppingIcon />;

            case 'gifts':
                return <GiftsIcon />;

            case 'fuel':
            case 'transportation':
            case 'transport':
            case 'commute':
                return <TransportIcon />;

            case 'health':
            case 'healthcare':
            case 'life':
            case 'medical':
                return <HealthIcon />;

            case 'entertainment':
            case 'movies':
                return <EntertainmentIcon />;

            case 'education':
                return <EducationIcon />;

            case 'personal care':
                return <PersonalCareIcon />;

            case 'rent':
            case 'home':
            case 'housing':
                return <HomeIcon />;

            case 'insurance':
                return <InsuranceIcon />;

            case 'savings':
            case 'investment':
            case 'investments':
                return <InvestmentsIcon />;

            case 'settlement':
            case 'general':
            case 'money':
                return <MoneyIcon />;

            default:
                return <CategoryIcon />;
        }
    };

    // State for expanded balance card
    const [expandedBalance, setExpandedBalance] = useState(false);

    if (loading) return <PageLoader message="Loading Group Details..." />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!group) return <Alert severity="warning">Group not found</Alert>;

    return (
        <PageContainer>
            {/* 1. Custom Header & Navigation - Reduced Sizes */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}> {/* mb: 3 -> 2.5 */}
                <Box
                    onClick={() => navigate('/app/groups')}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75, // Reduced gap
                        cursor: 'pointer',
                        color: 'text.secondary',
                        transition: 'color 0.2s',
                        '&:hover': { color: 'text.primary' }
                    }}
                >
                    <ArrowBackIcon sx={{ fontSize: 18 }} /> {/* 20 -> 18 */}
                </Box>

                {/* Top Action Icons */}
                {/* Top Action Icons */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        title="Add Expense"
                        onClick={() => setIsExpenseDialogOpen(true)}
                        className="glass-card-clean"
                        sx={{
                            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', borderRadius: '12px',
                            background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#14B8A6', transition: 'all 0.2s',
                            '&:hover': { background: 'rgba(20, 184, 166, 0.2)' }
                        }}
                    >
                        <AddIcon />
                    </Box>

                    <Box
                        title="Export Report"
                        onClick={(e) => !exporting && setExportAnchorEl(e.currentTarget)}
                        className="glass-card-clean"
                        sx={{
                            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: exporting ? 'wait' : 'pointer', borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'text.primary', transition: 'all 0.2s',
                            '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                        }}
                    >
                        {exporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                    </Box>

                    <Box
                        title="Edit Group"
                        onClick={() => setIsEditDialogOpen(true)}
                        className="glass-card-clean"
                        sx={{
                            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'text.primary', transition: 'all 0.2s',
                            '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                        }}
                    >
                        <EditIcon />
                    </Box>

                    <Box
                        title="Delete Group"
                        onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Delete Group',
                            message: 'Are you sure you want to delete this group? This action cannot be undone.',
                            onConfirm: handleDeleteGroup
                        })}
                        className="glass-card-clean"
                        sx={{
                            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', borderRadius: '12px',
                            background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#FF6B6B', transition: 'all 0.2s',
                            '&:hover': { background: 'rgba(255, 50, 50, 0.2)' }
                        }}
                    >
                        <DeleteIcon />
                    </Box>
                </Stack>
            </Box>

            {/* 2. Group Summary Card - Ultra Clean Glass - Reduced Sizes */}
            <Box sx={{ px: { xs: 0, sm: 2 }, mb: 3 }}> {/* mb: 4 -> 3 */}
                <Box
                    className="glass-card-clean"
                    onClick={() => setExpandedBalance(!expandedBalance)}
                    sx={{
                        p: 2.5, // Reduced from 3
                        borderRadius: '20px', // Reduced from 24px
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 0.75, color: 'white' }}> {/* Reduced font */}
                                {group.name}
                            </Typography>
                            <Box sx={{
                                display: 'inline-flex',
                                px: 1.25, // Reduced
                                py: 0.4,  // Reduced
                                borderRadius: '99px',
                                background: 'rgba(45, 212, 191, 0.15)',
                                border: '1px solid rgba(45, 212, 191, 0.3)',
                                color: '#5EEAD4', // Teal 300
                                fontSize: '0.65rem', // Reduced
                                fontWeight: 600
                            }}>
                                {group.members.length} members
                            </Box>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 0.4 }}> {/* Reduced */}
                                {myBalance >= 0 ? 'You are owed' : 'You owe'}
                            </Typography>
                            <Typography sx={{
                                fontSize: { xs: '1.35rem', sm: '1.75rem' }, // Reduced
                                fontWeight: 700,
                                color: myBalance >= 0 ? '#34D399' : '#F87171',
                                lineHeight: 1
                            }}>
                                {formatCurrency(Math.abs(myBalance))}
                            </Typography>

                            {expandedBalance ? (
                                <ExpandMoreIcon sx={{ color: 'white', ml: 'auto', mt: 0.5, fontSize: '1.25rem', transform: 'rotate(180deg)', transition: 'transform 0.3s' }} />
                            ) : (
                                <ExpandMoreIcon sx={{ color: 'white', ml: 'auto', mt: 0.5, fontSize: '1.25rem', transition: 'transform 0.3s' }} />
                            )}
                        </Box>
                    </Box>

                    {/* Expanded Balance Details */}
                    {expandedBalance && (
                        <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.1)' }}> {/* Reduced spacing */}
                            <Stack spacing={1.25}> {/* Reduced spacing */}
                                {Object.entries(balances)
                                    .filter(([id, val]) => Math.abs(val) > 0.1) // Hide zero balances
                                    .map(([memberId, bal]) => {
                                        // Find member name logic
                                        const member = group.members.find(m => {
                                            const mId = (m.userId && typeof m.userId === 'object' && m.userId._id)
                                                ? String(m.userId._id) : String(m.userId || m.email || m.name);
                                            return mId === memberId;
                                        });
                                        const name = member?.name || 'Unknown';

                                        // Don't show my own entry in "expanded" - logic check
                                        const isMe = member && (
                                            (member.userId && String(member.userId._id || member.userId) === String(user?._id)) ||
                                            (member.email && user?.email && member.email.toLowerCase() === user.email.toLowerCase())
                                        );
                                        if (isMe) return null;

                                        return (
                                            <Box key={memberId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#CBD5E1' }}> {/* Reduced font */}
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            width: 24, // Slightly larger to show background
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            marginRight: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: `linear-gradient(135deg, ${getAvatarColor(name)}, ${alpha(getAvatarColor(name), 0.7)})`,
                                                            overflow: 'hidden',
                                                            boxShadow: `0 2px 8px ${alpha(getAvatarColor(name), 0.25)}`
                                                        }}
                                                    >
                                                        <img
                                                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}`}
                                                            alt={name}
                                                            style={{ width: '100%', height: '100%' }}
                                                        />
                                                    </Box>
                                                    <Typography sx={{ fontSize: '0.85rem' }}>{name} {bal >= 0 ? 'you owe' : 'owes you'}</Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: bal >= 0 ? '#F87171' : '#34D399' }}>
                                                    {formatCurrency(Math.abs(bal))}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Box>



            {/* 4. Tabs Navigation - Reduced Sizes */}
            <Box sx={{ borderBottom: '2px solid rgba(255,255,255,0.1)', mb: 3, px: 2 }}> {/* mb: 4 -> 3 */}
                <Stack direction="row" spacing={3}> {/* spacing: 4 -> 3 */}
                    {['Dashboard', 'Expenses', 'Balances'].map((tab, index) => (
                        <Box
                            key={tab}
                            onClick={() => setTabValue(index)}
                            sx={{
                                pb: 1.25, // Reduced
                                cursor: 'pointer',
                                color: tabValue === index ? 'white' : 'rgba(255,255,255,0.5)',
                                fontWeight: 600,
                                fontSize: '0.9rem', // 1rem -> 0.9rem
                                position: 'relative',
                                transition: 'color 0.2s',
                                '&:hover': { color: 'white' }
                            }}
                        >
                            {tab}
                            {tabValue === index && (
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: -2,
                                    left: 0,
                                    right: 0,
                                    height: '2px', // 3px -> 2px
                                    borderRadius: '3px',
                                    background: '#14B8A6'
                                }} />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Box>

            {/* 5. Content Sections */}

            {/* TAB 0: DASHBOARD */}
            {tabValue === 0 && (
                <Box sx={{ px: { xs: 0, sm: 2 }, pb: 3 }}>
                    {/* Reuse GroupAnalytics but wrap it or customize it if needed. 
                        For now, we will render it directly as it has good charts.
                        Ideally, we would refactor GroupAnalytics to match the exact card style requested,
                        but let's wrap it in a clean container.
                    */}
                    <GroupAnalytics
                        expenses={expenses}
                        members={group.members}
                        currency={group.currency}
                        currentUser={user}
                    />
                </Box>
            )}

            {/* TAB 1: EXPENSES */}
            {tabValue === 1 && (
                <Box sx={{ px: { xs: 0, sm: 2 }, pb: 3 }}>
                    <Stack spacing={1.5}> {/* spacing: 2 -> 1.5 */}
                        {expenses.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6, opacity: 0.6 }}> {/* Reduced py */}
                                <Typography variant="h2" sx={{ mb: 1.5, fontSize: '2.5rem' }}>📝</Typography>
                                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>No expenses yet</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Add your first expense to get started!</Typography>
                            </Box>
                        ) : (
                            expenses.map((expense) => (
                                <Box
                                    key={expense._id}
                                    className="glass-card-clean"
                                    onClick={() => setSelectedExpense(expense)}
                                    sx={{
                                        p: 2, // 2.5 -> 2
                                        borderRadius: '16px', // 20px -> 16px
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        '&:hover': { background: 'rgba(255,255,255,0.12)' },
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5 // 2 -> 1.5
                                    }}
                                >
                                    {/* Icon Container */}
                                    <Box sx={{
                                        minWidth: 42, // 48 -> 42
                                        height: 42,
                                        borderRadius: '50%',
                                        background: 'rgba(59, 130, 246, 0.15)', // Blue tint
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem', // 1.25 -> 1.1
                                        color: '#60A5FA' // Blue 400
                                    }}>
                                        {getCategoryIcon(expense.category)}
                                    </Box>

                                    {/* Main Content */}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontWeight: 600, color: 'white', fontSize: '0.9rem', mb: 0.2 }}> {/* Reduced fonts */}
                                            {expense.description}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                            {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • Paid by {getPayerName(expense)}
                                        </Typography>
                                    </Box>

                                    {/* Amount */}
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}> {/* 1.1 -> 1.0 */}
                                            {formatCurrency(expense.amount)}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                                            total
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Stack>
                </Box>
            )}

            {/* TAB 2: BALANCES */}
            {tabValue === 2 && (
                <Box sx={{ px: { xs: 0, sm: 2 }, pb: 3 }}>
                    {/* Settlement Suggestions Section */}
                    {(() => {
                        console.log('Balances being passed to calculateSettlements:', balances);
                        const settlements = calculateSettlements(balances, group.members);
                        console.log('Calculated settlements:', settlements);

                        if (settlements.length > 0) {
                            // Show only settlement suggestions (cleaner, more actionable)
                            return (
                                <SettlementSuggestionsList
                                    settlements={settlements}
                                    onSettle={async (settlement) => {
                                        try {
                                            console.log('Before settlement:', { balances, settlement });
                                            await groupService.settleDebt(id, {
                                                payerId: settlement.from.userId,
                                                receiverId: settlement.to.userId,
                                                amount: settlement.amount,
                                                payerName: settlement.from.name,
                                                receiverName: settlement.to.name
                                            });
                                            toast.success(`Settlement recorded: ${settlement.from.name} → ${settlement.to.name}`);
                                            await fetchGroupDetails();
                                            console.log('After settlement - new group:', group);
                                            console.log('After settlement - new balances:', balances);
                                        } catch (error) {
                                            console.error('Settlement error:', error);
                                            toast.error('Failed to record settlement');
                                        }
                                    }}
                                    onSettleAll={async () => {
                                        try {
                                            for (const settlement of settlements) {
                                                await groupService.settleDebt(id, {
                                                    payerId: settlement.from.userId,
                                                    receiverId: settlement.to.userId,
                                                    amount: settlement.amount,
                                                    payerName: settlement.from.name,
                                                    receiverName: settlement.to.name
                                                });
                                            }
                                            toast.success(`${settlements.length} settlements recorded!`);
                                            await fetchGroupDetails();
                                        } catch (error) {
                                            toast.error('Failed to record all settlements');
                                        }
                                    }}
                                />
                            );
                        } else {
                            // Show "All Settled" message when no settlements needed
                            return (
                                <Box
                                    sx={{
                                        p: { xs: 3, sm: 4 },
                                        textAlign: 'center',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: 3,
                                        border: '1px dashed rgba(255, 255, 255, 0.1)'
                                    }}
                                >
                                    <Typography variant="h2" sx={{ fontSize: '3rem', mb: 2 }}>🎉</Typography>
                                    <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                                        All Settled Up!
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                                        No outstanding balances in this group.
                                    </Typography>
                                </Box>
                            );
                        }
                    })()}
                </Box>
            )}

            {/* --- Dialogs (Hidden) --- */}
            <AddGroupExpenseDialog
                open={isExpenseDialogOpen}
                onClose={handleExpenseDialogClose}
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

            <ExpenseDetailsDialog
                open={Boolean(selectedExpense)}
                onClose={() => setSelectedExpense(null)}
                expense={selectedExpense}
                currentUser={user}
                groupMembers={group?.members}
                onDelete={handleDeleteExpense}
                onEdit={handleEditExpense}
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
                onSettled={fetchGroupDetails}
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

            {/* Popover Menu for Downloads */}
            <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={() => setExportAnchorEl(null)}
                PaperProps={{
                    sx: {
                        bgcolor: '#1e293b',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                }}
            >
                <MenuItem onClick={handleDownloadReport}>Download PDF</MenuItem>
                <MenuItem onClick={handleDownloadCSV}>Export CSV</MenuItem>
            </Menu>

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
        </PageContainer>
    );
}
