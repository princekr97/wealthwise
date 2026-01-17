import React from 'react';
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
    Slide
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    Restaurant as FoodIcon,
    Flight as TravelIcon,
    Home as HomeIcon,
    LocalGroceryStore as UtilitiesIcon,
    TheaterComedy as EntertainmentIcon,
    Favorite as HealthIcon,
    AttachMoney as MoneyIcon,
    Receipt as BillIcon,
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowUp as ArrowUpIcon
} from '@mui/icons-material';

// Transition for the dialog
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const getCategoryIcon = (category) => {
    switch (category) {
        case 'Food and Drink': return <FoodIcon />;
        case 'Transportation': return <TravelIcon />;
        case 'Home': return <HomeIcon />;
        case 'Utilities': return <UtilitiesIcon />;
        case 'Entertainment': return <EntertainmentIcon />;
        case 'Life': return <HealthIcon />;
        case 'Settlement': return <MoneyIcon />;
        default: return <BillIcon />;
    }
};

const ExpenseDetailsDialog = ({ open, onClose, expense, currentUser, onDelete, onEdit, groupMembers }) => {
    if (!expense) return null;

    const formatName = (name) => {
        if (!name) return 'Unknown';
        if (name === 'You') return 'You';
        return name.length > 6 ? name.substring(0, 6) + '...' : name;
    };

    const formattedDate = new Date(expense.date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    // Payer Resolution
    let rawPayerName = expense.paidByName || (typeof expense.paidBy === 'object' ? expense.paidBy.name : null) || 'Unknown';
    let payerAvatar = '';

    const payerId = expense.paidBy && typeof expense.paidBy === 'object' ? expense.paidBy._id : expense.paidBy;
    const currentUserId = currentUser?._id || currentUser?.id;

    if (payerId && currentUserId && String(payerId) === String(currentUserId)) {
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
            rawPayerName = String(foundPayer.userId?._id || foundPayer.userId) === String(currentUserId) ? 'You' : foundPayer.name;
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
            maxWidth="xs"
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: '28px',
                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', // Match Theme Dialog
                    m: 2,
                    p: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }
            }}
        >
            <DialogContent sx={{ p: '24px !important', color: 'white' }}>
                {/* Close Icon */}
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        zIndex: 10,
                        color: 'rgba(255,255,255,0.4)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'white' }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                {/* Top Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5, mt: 1 }}>
                    <Avatar
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: '#10B981',
                            width: 72,
                            height: 72,
                            borderRadius: '24px',
                            mb: 2.5,
                            fontSize: '2.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {getCategoryIcon(expense.category)}
                    </Avatar>

                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 0.5, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                        {expense.description}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500 }}>
                            {formattedDate}
                        </Typography>
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500 }}>
                            Added by <span style={{ fontWeight: 700, color: 'white' }}>{payerName}</span>
                        </Typography>
                    </Stack>

                    <Typography variant="h2" sx={{ fontWeight: 900, color: 'white', fontSize: '3.2rem', mb: 3.5 }}>
                        ₹{expense.amount}
                    </Typography>

                    <Stack direction="row" spacing={2}>
                        <IconButton
                            onClick={() => {
                                onEdit && onEdit(expense);
                                onClose();
                            }}
                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#3b82f6', width: 48, height: 48, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <EditIcon sx={{ fontSize: '1.4rem' }} />
                        </IconButton>
                        <IconButton
                            onClick={() => onDelete && onDelete(expense._id)}
                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#ef4444', width: 48, height: 48, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <DeleteIcon sx={{ fontSize: '1.4rem' }} />
                        </IconButton>
                        <IconButton
                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#10B981', width: 48, height: 48, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <ShareIcon sx={{ fontSize: '1.4rem' }} />
                        </IconButton>
                    </Stack>
                </Box>

                <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)', mb: 3.5 }} />

                {/* Paid By */}
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', mb: 2 }}>
                        Paid By
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{
                        p: 2,
                        borderRadius: '20px',
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                                src={payerAvatar}
                                sx={{ width: 44, height: 44, border: '2px solid rgba(255,255,255,0.1)' }}
                            />
                            <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>
                                {payerName}
                            </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>
                            ₹{expense.amount}
                        </Typography>
                    </Stack>
                </Box>

                {/* Split Among */}
                <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', mb: 2 }}>
                        Split Among
                    </Typography>
                    <Stack spacing={1.5}>
                        {splits.map((split, index) => {
                            let rawSplitName = split.name || split.userName || (typeof split.user === 'object' ? split.user.name : null) || 'Unknown';
                            let splitAvatar = '';

                            const splitId = split.user && typeof split.user === 'object' ? split.user._id : split.user;

                            if (splitId && currentUserId && String(splitId) === String(currentUserId)) {
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
                                    rawSplitName = String(foundMember.userId?._id || foundMember.userId) === String(currentUserId) ? 'You' : foundMember.name;
                                    splitAvatar = foundMember.avatarUrl || (foundMember.userId && foundMember.userId.avatarUrl);
                                }
                            }

                            const splitName = formatName(rawSplitName);

                            if (!splitAvatar) {
                                splitAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${rawSplitName === 'You' ? (currentUser?.name || 'You') : rawSplitName}`;
                            }

                            return (
                                <Stack key={index} direction="row" alignItems="center" justifyContent="space-between" sx={{
                                    p: 1.5,
                                    borderRadius: '18px',
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
                                }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar
                                            src={splitAvatar}
                                            sx={{ width: 40, height: 40, opacity: 0.9 }}
                                        />
                                        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                                            {splitName}
                                        </Typography>
                                    </Stack>
                                    <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>
                                        ₹{split.amount}
                                    </Typography>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog >
    );
};

export default ExpenseDetailsDialog;
