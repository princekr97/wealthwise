import React, { memo } from 'react';
import {
    Dialog,
    DialogContent,
    Typography,
    Box,
    IconButton,
    Avatar,
    Stack,
    Divider,
    Paper,
    Slide,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    Restaurant as FoodIcon,
    Flight as TravelIcon,
    Home as HomeIcon,
    Commute as TransportIcon,
    Bolt as UtilitiesIcon,
    SportsEsports as EntertainmentIcon,
    Receipt as BillIcon,
    AttachMoney as MoneyIcon,
    Category as CategoryIcon,
    ShoppingBag as ShoppingIcon,
    LocalHospital as HealthcareIcon,
    School as EducationIcon,
    Spa as PersonalCareIcon,
    ShoppingCart as GroceriesIcon,
    Shield as InsuranceIcon,
    TrendingUp as InvestmentsIcon,
    CardGiftcard as GiftsIcon,
    Savings as SavingsIcon,
    Hotel as StaysIcon,
    LocalCafe as DrinksIcon,
    LocalGasStation as FuelIcon,
    Hotel as HotelIcon
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';

// Transition for the dialog
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

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
            return <HealthcareIcon />;

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

// ====================================
// PERFORMANCE: React.memo
// ====================================
// Prevents re-renders when props haven't changed
// Safe because this component is pure (same props = same output)
const ExpenseDetailsDialog = memo(({ open, onClose, expense, currentUser, onDelete, onEdit, groupMembers }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!expense) return null;

    const formatName = (name) => {
        if (!name) return 'Unknown';
        if (name === 'You') return 'You';
        return name.length > 6 ? name.substring(0, 6) + '...' : name;
    };

    // Helper to robustly identify if an ID belongs to the current user
    const isMe = (targetId) => {
        if (!currentUser || !targetId) return false;

        // 1. Direct ID Match
        const currentUserId = currentUser._id || currentUser.id;
        if (String(targetId) === String(currentUserId)) return true;

        // 2. Lookup in group members (to check phone/email links)
        if (groupMembers) {
            const member = groupMembers.find(m => {
                const mId = m._id || m.id;
                const mUserId = m.userId && typeof m.userId === 'object' ? (m.userId._id || m.userId.id) : m.userId;
                return (mId && String(mId) === String(targetId)) || (mUserId && String(mUserId) === String(targetId));
            });

            if (member) {
                // Check Phone
                const userPhone = currentUser.phone || currentUser.phoneNumber;
                if (userPhone && member.phone && member.phone === userPhone) return true;
                if (userPhone && member.userId?.phone && member.userId.phone === userPhone) return true;

                // Check Email
                if (currentUser.email) {
                    const mEmail = member.email || member.userId?.email;
                    if (mEmail && mEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
                }

                // Check ID again via member.userId
                const finalMUserId = member.userId?._id || member.userId;
                if (finalMUserId && String(finalMUserId) === String(currentUserId)) return true;
            }
        }
        return false;
    };

    // Date/Time Formatting with Timezone awareness
    const dateObj = new Date(expense.date);
    // Use high-precision createdAt for the time, fallback to dateObj
    const timeObj = expense.createdAt ? new Date(expense.createdAt) : dateObj;

    const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const formattedTime = timeObj.toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit'
    });

    // Payer Resolution with null safety
    let rawPayerName = expense.paidByName ||
        (expense.paidBy && typeof expense.paidBy === 'object' ? expense.paidBy?.name : null) ||
        'Unknown';
    let payerAvatar = '';

    const payerId = expense.paidBy && typeof expense.paidBy === 'object' ? expense.paidBy._id : expense.paidBy;
    const currentUserId = currentUser?._id || currentUser?.id;

    // Use robust isMe check
    if (payerId && isMe(payerId)) {
        rawPayerName = 'You';
    }

    if (groupMembers && payerId) {
        const foundPayer = groupMembers.find(m => {
            const mId = m._id || m.id;
            const mUserId = m.userId && typeof m.userId === 'object' ? (m.userId._id || m.userId.id) : m.userId;

            return (mId && String(mId) === String(payerId)) ||
                (mUserId && String(mUserId) === String(payerId));
        });

        if (foundPayer) {
            // Check if foundPayer is me using robust check on its ID
            const foundPayerId = foundPayer._id || foundPayer.id;
            rawPayerName = isMe(foundPayerId) ? 'You' : foundPayer.name;
            payerAvatar = foundPayer.avatarUrl || (foundPayer.userId && foundPayer.userId.avatarUrl);
        }
    }

    const payerName = formatName(rawPayerName);

    if (!payerAvatar) {
        payerAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${rawPayerName === 'You' ? (currentUser?.name || 'You') : rawPayerName}`;
    }

    const splits = expense.splits || [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            fullWidth
            fullScreen={isMobile}
            maxWidth="xs"
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: isMobile ? 0 : '24px', // Slightly smaller radius
                    background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), var(--active-gradient)',
                    backgroundAttachment: 'fixed',
                    m: isMobile ? 0 : 2,
                    p: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : 0
                }
            }}
        >
            <DialogContent sx={{ p: '14px !important', color: 'white' }}> {/* Reduced padding to 14px */}
                {/* Close Icon */}
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: isMobile ? 'calc(16px + env(safe-area-inset-top))' : 16,
                        right: 16,
                        zIndex: 10,
                        color: 'rgba(255,255,255,0.4)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'white' }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                {/* Top Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2.5, mt: 1 }}> {/* Reduced mb from 3.5 */}
                    <Avatar
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: '#10B981',
                            width: 64, // Reduced from 72
                            height: 64, // Reduced from 72
                            borderRadius: '20px',
                            mb: 2, // Reduced from 2.5
                            fontSize: '2rem', // Reduced from 2.5rem
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {getCategoryIcon(expense.category)}
                    </Avatar>

                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 0.25, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1.2px', fontSize: '1.0rem' }}>
                        {expense.description}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500 }}>
                            {formattedDate} • {formattedTime}
                        </Typography>
                        <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500 }}>
                            By <span style={{ fontWeight: 700, color: 'white' }}>{payerName}</span>
                        </Typography>
                    </Stack>

                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', fontSize: '2.5rem', mb: 2.5 }}> {/* Reduced font size from 3.2rem and mb from 3.5 */}
                        {formatCurrency(expense.amount)}
                    </Typography>

                    <Stack direction="row" spacing={1.5}> {/* Reduced spacing from 2 */}
                        <IconButton
                            onClick={() => {
                                onEdit && onEdit(expense);
                                onClose();
                            }}
                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#3b82f6', width: 42, height: 42, borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <EditIcon sx={{ fontSize: '1.2rem' }} /> {/* Reduced icon size */}
                        </IconButton>
                        <IconButton
                            onClick={() => onDelete && onDelete(expense._id)}
                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#ef4444', width: 42, height: 42, borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <DeleteIcon sx={{ fontSize: '1.2rem' }} />
                        </IconButton>
                        <IconButton
                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#10B981', width: 42, height: 42, borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <ShareIcon sx={{ fontSize: '1.2rem' }} />
                        </IconButton>
                    </Stack>
                </Box>

                <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)', mb: 2.5 }} />

                {/* Full Description Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', mb: 1 }}>
                        Notes / Description
                    </Typography>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: '12px',
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                            {expense.description}
                        </Typography>
                    </Paper>
                </Box>

                {/* Paid By */}
                <Box sx={{ mb: 3 }}> {/* Reduced mb from 4 */}
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', mb: 1.5 }}>
                        Paid By
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{
                        p: 1.5, // Reduced padding from 2
                        borderRadius: '16px', // Reduced radius
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                                src={payerAvatar}
                                sx={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.1)' }} // Reduced size from 44
                            />
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}> {/* Reduced font size */}
                                {payerName}
                            </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}> {/* Reduced font size */}
                            {formatCurrency(expense.amount)}
                        </Typography>
                    </Stack>
                </Box>

                {/* Split Among */}
                <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', mb: 1.5 }}>
                        Split Among
                    </Typography>
                    <Stack spacing={1}> {/* Reduced spacing from 1.5 */}
                        {splits.map((split, index) => {
                            let rawSplitName = split.name ||
                                split.userName ||
                                (split.user && typeof split.user === 'object' ? split.user?.name : null) ||
                                'Unknown';
                            let splitAvatar = '';

                            const splitId = split.user && typeof split.user === 'object' ? split.user._id : split.user;

                            if (splitId && isMe(splitId)) {
                                rawSplitName = 'You';
                            }

                            if (groupMembers && splitId) {
                                const foundMember = groupMembers.find(m => {
                                    const mId = m._id || m.id;
                                    const mUserId = m.userId && typeof m.userId === 'object' ? (m.userId._id || m.userId.id) : m.userId;

                                    return (mId && String(mId) === String(splitId)) ||
                                        (mUserId && String(mUserId) === String(splitId));
                                });

                                if (foundMember) {
                                    // Check if foundMember is me using robust check
                                    const foundMemberId = foundMember._id || foundMember.id;
                                    rawSplitName = isMe(foundMemberId) ? 'You' : foundMember.name;
                                    splitAvatar = foundMember.avatarUrl || (foundMember.userId && foundMember.userId.avatarUrl);
                                }
                            }

                            const splitName = formatName(rawSplitName);

                            if (!splitAvatar) {
                                splitAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${rawSplitName === 'You' ? (currentUser?.name || 'You') : rawSplitName}`;
                            }

                            return (
                                <Stack key={index} direction="row" alignItems="center" justifyContent="space-between" sx={{
                                    p: 1.25, // Reduced padding from 1.5
                                    borderRadius: '14px', // Reduced radius
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
                                }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <Avatar
                                            src={splitAvatar}
                                            sx={{ width: 32, height: 32, opacity: 0.9 }} // Reduced size from 40
                                        />
                                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}> {/* Reduced font size */}
                                            {splitName}
                                        </Typography>
                                    </Stack>
                                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}> {/* Reduced font size */}
                                        {formatCurrency(split.amount)}
                                    </Typography>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog >
    );
});

export default ExpenseDetailsDialog;
