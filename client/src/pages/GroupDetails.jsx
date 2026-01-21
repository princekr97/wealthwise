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
    alpha,
    Dialog,
    DialogContent,
    DialogActions,
    ListItemIcon,
    Collapse
} from '@mui/material';
import {
    Add as AddIcon,
    PostAdd as AddExpenseIcon,
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
    Hotel as HotelIcon,
    Assessment as ReportIcon,
    Close as CloseIcon,
    Share as ShareIcon,
    PersonAdd as AddMemberIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
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
import { getCategoryStyle } from '../utils/categoryHelper';
import { SettlementSuggestionsList } from '../components/groups/SettlementSuggestionCard';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';



export default function GroupDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuthStore();
    const [user, setUser] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };


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
    const [selectedSettlement, setSelectedSettlement] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

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
        if (!group) return;
        setExporting(true);
        try {
            toast.info('Generating PDF Report...');
            await generateGroupReport(group, expenses, balances);
            toast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to generate report');
        } finally {
            setExporting(false);
        }
    };

    const handlePreviewReport = async () => {
        if (!group) return;
        setPreviewLoading(true);
        try {
            const url = await generateGroupReport(group, expenses, balances, true);
            setPdfUrl(url);
            setPreviewOpen(true);
        } catch (error) {
            console.error('Preview error:', error);
            toast.error('Failed to preview report');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    const handleShareReport = async () => {
        if (!group) return;
        setShareLoading(true);
        try {
            toast.info('Preparing to share...');
            // Generate PDF Blob URL
            const url = await generateGroupReport(group, expenses, balances, true);

            // Fetch blob from URL
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], `${group.name.replace(/\s+/g, '_')}_Report.pdf`, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `${group.name} Expense Report`,
                    text: `Here is the expense report for ${group.name}.`,
                });
                toast.success('Shared successfully!');
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (error) {
            console.error('Share error:', error);
            // Fallback to simple download if share fails
            if (error.message !== 'Web Share API not supported' && error.name !== 'AbortError') {
                toast.error('Sharing failed, downloading instead...');
                handleDownloadReport();
            } else if (error.message === 'Web Share API not supported') {
                toast.info('Sharing not supported on this device. Downloading file...');
                handleDownloadReport();
            }
        } finally {
            setShareLoading(false);
        }
    };
    const handleDownloadCSV = async () => {
        if (group && expenses) {
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
            console.log('Removing member:', memberToDelete, 'from group:', id);
            await groupService.removeMember(id, memberToDelete);
            toast.success('Member removed');
            setMemberToDelete(null);
            fetchGroupDetails();
        } catch (err) {
            console.error('Remove member error:', err);
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
            {/* 1. Custom Header & Navigation - Compact Design */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box
                    onClick={() => navigate('/app/groups')}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        color: 'text.secondary',
                        transition: 'all 0.2s',
                        '&:hover': {
                            color: 'text.primary',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderColor: 'rgba(255, 255, 255, 0.15)'
                        }
                    }}
                >
                    <ArrowBackIcon sx={{ fontSize: 20 }} />
                </Box>

                {/* Top Action Icons - Compact */}
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                        title="Add Expense"
                        onClick={() => setIsExpenseDialogOpen(true)}
                        className="glass-card-clean"
                        sx={{
                            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', borderRadius: '10px',
                            background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.25)',
                            color: '#2DD4BF', transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.05)', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.25)' }
                        }}
                    >
                        <AddExpenseIcon sx={{ fontSize: 20 }} />
                    </Box>

                    <Box
                        title="Add Member"
                        onClick={() => setIsAddMemberDialogOpen(true)}
                        className="glass-card-clean"
                        sx={{
                            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', borderRadius: '10px',
                            background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)',
                            color: '#FBBF24', transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.05)', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)' }
                        }}
                    >
                        <AddMemberIcon sx={{ fontSize: 20 }} />
                    </Box>

                    <Box
                        title="Trip Report & Export"
                        onClick={() => !previewLoading && handlePreviewReport()}
                        className="glass-card-clean"
                        sx={{
                            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: previewLoading ? 'wait' : 'pointer', borderRadius: '10px',
                            background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.25)',
                            color: '#EC4899', transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.05)', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)' }
                        }}
                    >
                        {previewLoading ? <CircularProgress size={18} color="inherit" /> : <ReportIcon sx={{ fontSize: 20 }} />}
                    </Box>

                    <Box
                        title="More Options"
                        onClick={handleMenuClick}
                        className="glass-card-clean"
                        sx={{
                            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'text.secondary', transition: 'all 0.2s',
                            '&:hover': { background: 'rgba(255, 255, 255, 0.08)', color: 'white', transform: 'scale(1.05)' }
                        }}
                    >
                        <MoreVertIcon sx={{ fontSize: 20 }} />
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                background: 'rgba(15, 23, 42, 0.85)', // Deep slate with opacity
                                backdropFilter: 'blur(20px)', // Strong blur for glass effect
                                border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle light border
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)', // Deep shadow + slight inner glow
                                borderRadius: '16px',
                                minWidth: '220px',
                                padding: '8px',
                                overflow: 'visible', // For any potential pop-outs (if needed later)
                                '&:before': { // Small arrow pointer
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'rgba(15, 23, 42, 0.85)',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                }
                            }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Typography variant="overline" sx={{ px: 2, py: 1, color: '#64748b', fontWeight: 700, letterSpacing: '1px', fontSize: '0.7rem' }}>
                            ACTIONS
                        </Typography>

                        <MenuItem
                            onClick={() => { handleMenuClose(); setIsEditDialogOpen(true); }}
                            sx={{
                                py: 1.5,
                                px: 2,
                                borderRadius: '10px',
                                mb: 0.5,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                    borderLeft: '3px solid #3b82f6',
                                    paddingLeft: '13px' // Compensate for border
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: '#60a5fa', minWidth: '36px !important' }}>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <Box>
                                <Typography variant="body2" fontWeight={600} sx={{ color: '#e2e8f0' }}>Edit Group</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>Rename or change icon</Typography>
                            </Box>
                        </MenuItem>

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1 }} />

                        <MenuItem
                            onClick={() => {
                                handleMenuClose(); setConfirmDialog({
                                    open: true,
                                    title: 'Delete Group',
                                    message: 'Are you sure you want to delete this group? This action cannot be undone.',
                                    onConfirm: handleDeleteGroup
                                });
                            }}
                            sx={{
                                py: 1.5,
                                px: 2,
                                borderRadius: '10px',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                                    borderLeft: '3px solid #ef4444',
                                    paddingLeft: '13px'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: '#f87171', minWidth: '36px !important' }}>
                                <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            <Box>
                                <Typography variant="body2" fontWeight={600} sx={{ color: '#f87171' }}>Delete Group</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(248, 113, 113, 0.6)' }}>Irreversible action</Typography>
                            </Box>
                        </MenuItem>
                    </Menu>
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
                                                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
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
                                                    <Typography sx={{ fontSize: '0.85rem' }}>{name} <span style={{ opacity: 0.6 }}>{bal >= 0 ? 'you owe' : 'owes you'}</span></Typography>
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



            {/* 4. Tabs Navigation - Modern Pill Design */}
            <Box sx={{ mb: 3 }}>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        p: 0.4,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'inline-flex',
                        width: 'fit-content',
                        position: 'relative'
                    }}
                >
                    {['Dashboard', 'Expenses', 'Balances'].map((tab, index) => (
                        <Box
                            key={tab}
                            onClick={() => setTabValue(index)}
                            sx={{
                                px: 2.5,
                                py: 1,
                                cursor: 'pointer',
                                color: tabValue === index ? 'white' : 'rgba(255,255,255,0.6)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                borderRadius: '10px',
                                background: tabValue === index ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' : 'transparent',
                                boxShadow: tabValue === index ? '0 4px 12px rgba(20, 184, 166, 0.3)' : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap',
                                '&:hover': {
                                    color: 'white',
                                    background: tabValue === index ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' : 'rgba(255, 255, 255, 0.05)'
                                }
                            }}
                        >
                            {tab}
                        </Box>
                    ))}
                </Stack>
            </Box>

            {/* 5. Content Sections */}

            {/* TAB 0: DASHBOARD */}
            {tabValue === 0 && (
                <Box 
                    sx={{ 
                        px: { xs: 0, sm: 2 }, 
                        pb: 3,
                        animation: 'fadeIn 0.3s ease-in-out',
                        '@keyframes fadeIn': {
                            from: { opacity: 0, transform: 'translateY(10px)' },
                            to: { opacity: 1, transform: 'translateY(0)' }
                        }
                    }}
                >
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
                <Box 
                    sx={{ 
                        px: { xs: 0, sm: 2 }, 
                        pb: 3,
                        animation: 'fadeIn 0.3s ease-in-out',
                        '@keyframes fadeIn': {
                            from: { opacity: 0, transform: 'translateY(10px)' },
                            to: { opacity: 1, transform: 'translateY(0)' }
                        }
                    }}
                >
                    <Stack spacing={1.5}> {/* spacing: 2 -> 1.5 */}
                        {expenses.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6, opacity: 0.6 }}>
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
                                        p: 1.5,
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { background: 'rgba(255,255,255,0.12)', transform: 'translateY(-2px)' },
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        borderLeft: `3px solid ${getCategoryStyle(expense.category).color}`
                                    }}
                                >
                                    {/* Icon Container */}
                                    <Box sx={{
                                        minWidth: 42,
                                        height: 42,
                                        borderRadius: '10px',
                                        background: `linear-gradient(135deg, ${getCategoryStyle(expense.category).color}CC 0%, ${getCategoryStyle(expense.category).color}80 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        color: '#FFFFFF',
                                        boxShadow: `0 4px 12px ${getCategoryStyle(expense.category).color}30`
                                    }}>
                                        {getCategoryIcon(expense.category)}
                                    </Box>

                                    {/* Main Content */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.9rem', mb: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {expense.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <Typography sx={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                                                {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </Typography>
                                            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#64748B' }} />
                                            <Typography sx={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                                                {getPayerName(expense)}
                                            </Typography>
                                            <Box sx={{ 
                                                px: 0.75, 
                                                py: 0.2, 
                                                borderRadius: '5px', 
                                                bgcolor: `${getCategoryStyle(expense.category).color}25`,
                                                border: `1px solid ${getCategoryStyle(expense.category).color}50`
                                            }}>
                                                <Typography sx={{ fontSize: '0.65rem', color: '#F1F5F9', fontWeight: 600 }}>
                                                    {expense.category}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Amount */}
                                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                        <Typography sx={{ fontWeight: 700, color: '#F1F5F9', fontSize: '1rem', lineHeight: 1.2 }}>
                                            {formatCurrency(expense.amount)}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {expense.splits?.length || 0} split{expense.splits?.length !== 1 ? 's' : ''}
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
                <Box 
                    sx={{ 
                        px: { xs: 0, sm: 2 }, 
                        pb: 3,
                        animation: 'fadeIn 0.3s ease-in-out',
                        '@keyframes fadeIn': {
                            from: { opacity: 0, transform: 'translateY(10px)' },
                            to: { opacity: 1, transform: 'translateY(0)' }
                        }
                    }}
                >
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
                                    onSettle={(settlement) => {
                                        setSelectedSettlement(settlement);
                                        setIsSettleDialogOpen(true);
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
                group={group}
                currentUser={user}
                onRemoveMember={(memberId) => setMemberToDelete(memberId)}
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
                    setSelectedSettlement(null);
                    fetchGroupDetails();
                }}
                group={group}
                currentUser={user}
                balances={balances}
                onSettled={fetchGroupDetails}
                initialSettlement={selectedSettlement}
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

            {/* PDF download is now triggered directly from the download icon button */}

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteGroup}
                title="Delete Group"
                message="Are you sure you want to delete this group? All expenses and data will be permanently removed."
            />

            <Dialog
                open={!!memberToDelete}
                onClose={() => setMemberToDelete(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        background: '#1E293B',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                        overflow: 'hidden'
                    }
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                                <DeleteIcon sx={{ color: 'white', fontSize: 20 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#F1F5F9' }}>Remove Member</Typography>
                        </Box>
                        <IconButton onClick={() => setMemberToDelete(null)} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#F1F5F9', background: 'rgba(255,255,255,0.08)' } }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Typography sx={{ color: '#CBD5E1', mb: 3, fontSize: '0.9rem', lineHeight: 1.6 }}>
                        Are you sure you want to remove this member? ALL expenses paid by them or involving them will be PERMANENTLY DELETED.
                    </Typography>
                    <Button onClick={handleRemoveMember} fullWidth sx={{ py: 1.2, borderRadius: '12px', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)', '&:hover': { background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(239, 68, 68, 0.45)' } }}>
                        Remove Member
                    </Button>
                </Box>
            </Dialog>

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />
            {/* PDF Preview Dialog - Ultra Clean */}
            <Dialog
                open={previewOpen}
                onClose={handleClosePreview}
                maxWidth="lg"
                fullWidth
                disableScrollLock={false}
                PaperProps={{
                    sx: {
                        height: '85vh',
                        background: '#0f172a',
                        color: 'white',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }
                }}
                sx={{
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)'
                    }
                }}
            >
                {/* Minimal Header - Icons Only */}
                <div style={{
                    padding: '12px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#0f172a',
                    borderBottom: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* Share Icon */}
                        <IconButton
                            onClick={handleShareReport}
                            title="Share PDF"
                            disabled={shareLoading}
                            sx={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#34d399', // Green
                                border: '1px solid rgba(52, 211, 153, 0.2)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    background: 'rgba(52, 211, 153, 0.15)',
                                    borderColor: '#34d399',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                        >
                            {shareLoading ? <CircularProgress size={16} color="inherit" /> : <ShareIcon fontSize="small" />}
                        </IconButton>

                        {/* Download Icon */}
                        <IconButton
                            onClick={handleDownloadReport}
                            title="Download PDF"
                            sx={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#38bdf8', // Light Blue
                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    borderColor: '#38bdf8',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                        >
                            <DownloadIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Right: Close Icon */}
                    <IconButton
                        onClick={handleClosePreview}
                        size="small"
                        sx={{
                            color: '#64748b',
                            '&:hover': { color: 'white', background: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>

                {/* PDF Viewer (Toolbar Hidden) */}
                <div style={{ flex: 1, height: '100%', background: '#1e293b', overflow: 'auto' }}>
                    {pdfUrl && (
                        <iframe
                            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                            width="100%"
                            height="100%"
                            style={{ border: 'none', minHeight: '100%' }}
                            title="Trip Report Preview"
                        />
                    )}
                </div>
            </Dialog>
        </PageContainer>
    );
}
