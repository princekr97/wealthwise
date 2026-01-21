import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Avatar,
    Stack,
    Chip,
    styled,
    alpha,
    Dialog,
    DialogContent,
    CircularProgress
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';
import { getAvatarConfig } from '../../utils/avatarHelper';

// SVG Icons as components
const ArrowRightIcon = ({ sx }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={sx}>
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BankIcon = ({ sx }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={sx}>
        <path d="M3 21H21M4 18H20M6 18V10M10 18V10M14 18V10M18 18V10M12 3L20 7V9H4V7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckCircleIcon = ({ sx }) => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={sx}>
        <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.3 2 18.23 3.54 20.07 5.93M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// User Icon for avatars
const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'white' }}>
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Styled components for premium look with mobile optimization
const SettlementCard = styled(Paper)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: '12px',
    marginBottom: '10px',
    transition: 'all 0.2s ease',

    '&:hover': {
        transform: 'translateY(-2px)',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)'
    },

    [theme.breakpoints.down('md')]: {
        padding: '10px',
        borderRadius: '12px',
        marginBottom: '8px'
    }
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
    width: 40,
    height: 40,
    fontSize: '1rem',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',

    [theme.breakpoints.down('md')]: {
        width: 36,
        height: 36,
        fontSize: '0.85rem'
    },

    [theme.breakpoints.down('sm')]: {
        width: 32,
        height: 32,
        fontSize: '0.75rem'
    }
}));

const AmountDisplay = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: '8px 14px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.08)',

    [theme.breakpoints.down('md')]: {
        padding: '6px 10px',
        borderRadius: 6
    },

    [theme.breakpoints.down('sm')]: {
        padding: '5px 8px'
    }
}));

const SettleButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    padding: '7px 18px',
    textTransform: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    whiteSpace: 'nowrap',

    '&:hover': {
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
    },

    [theme.breakpoints.down('md')]: {
        padding: '6px 14px',
        fontSize: '0.8rem',
        borderRadius: 7
    },

    [theme.breakpoints.down('sm')]: {
        padding: '5px 10px',
        fontSize: '0.7rem'
    }
}));

/**
 * Settlement Suggestion Card Component
 * Displays a single settlement suggestion with from/to users and amount
 * Layout: Simple horizontal row
 */
export default function SettlementSuggestionCard({ settlement, onSettle, loading }) {
    const { from, to, amount } = settlement;

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return parts[0][0] + parts[parts.length - 1][0];
        }
        return name.substring(0, 2);
    };

    // Generate consistent color for user


    return (
        <SettlementCard elevation={0}>
            <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 0.5, sm: 1.5 }}
                sx={{ justifyContent: 'space-between' }}
            >
                {/* From User - Avatar + Name + Phone */}
                <Stack alignItems="center" spacing={0.4} sx={{ flex: '0 0 auto', minWidth: { xs: 50, sm: 63 } }}>
                    {(() => {
                        const { url, initials, backgroundColor } = getAvatarConfig(from.name);
                        return (
                            <UserAvatar
                                src={url}
                                alt={from.name}
                                sx={{
                                    bgcolor: backgroundColor,
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}
                            >
                                {initials}
                            </UserAvatar>
                        );
                    })()}
                    <Typography
                        sx={{
                            fontWeight: 600,
                            color: '#E2E8F0',
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            maxWidth: { xs: 50, sm: 63 },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {from.name}
                    </Typography>
                    <Typography
                        sx={{
                            color: '#94A3B8',
                            fontSize: '0.65rem',
                            textAlign: 'center'
                        }}
                    >
                        {from.phone}
                    </Typography>
                </Stack>

                {/* Amount - Large & Prominent */}
                <Box sx={{ flex: '0 0 auto', textAlign: 'center' }}>
                    <Typography
                        sx={{
                            fontWeight: 700,
                            color: '#34D399',
                            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.4rem' },
                            lineHeight: 1,
                            mb: 0.3
                        }}
                    >
                        {formatCurrency(amount)}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#94A3B8',
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            fontWeight: 500
                        }}
                    >
                        will pay
                    </Typography>
                </Box>

                {/* Arrow Icon */}
                <ArrowRightIcon
                    sx={{
                        color: 'rgba(255, 255, 255, 0.3)',
                        width: { xs: 16, sm: 24 },
                        height: { xs: 16, sm: 24 },
                        flex: '0 0 auto'
                    }}
                />

                {/* To User - Avatar + Name + Phone */}
                <Stack alignItems="center" spacing={0.4} sx={{ flex: '0 0 auto', minWidth: { xs: 50, sm: 63 } }}>
                    {(() => {
                        const { url, initials, backgroundColor } = getAvatarConfig(to.name);
                        return (
                            <UserAvatar
                                src={url}
                                alt={to.name}
                                sx={{
                                    bgcolor: backgroundColor,
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}
                            >
                                {initials}
                            </UserAvatar>
                        );
                    })()}
                    <Typography
                        sx={{
                            fontWeight: 600,
                            color: '#E2E8F0',
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            maxWidth: { xs: 50, sm: 63 },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {to.name}
                    </Typography>
                    <Typography
                        sx={{
                            color: '#94A3B8',
                            fontSize: '0.65rem',
                            textAlign: 'center'
                        }}
                    >
                        {to.phone}
                    </Typography>
                </Stack>

                {/* Settle Button - Fixed Width for Consistency */}
                <SettleButton
                    variant="contained"
                    onClick={() => onSettle(settlement)}
                    disabled={loading}
                    title="Click to record this settlement"
                    startIcon={
                        !loading && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )
                    }
                    sx={{
                        flex: '0 0 auto',
                        width: { xs: 'auto', sm: 120 },
                        minWidth: { xs: 80, sm: 100 },
                        ml: { xs: 0, sm: 1.5 }
                    }}
                >
                    {loading ? '...' : 'Settle'}
                </SettleButton>
            </Stack>
        </SettlementCard>
    );
}



/**
 * Settlement Suggestions List Component
 * Shows all suggested settlements with a "Settle All" option
 */
export function SettlementSuggestionsList({ settlements, onSettle, onSettleAll, loading }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [settling, setSettling] = useState(false);

    const handleSettleAll = async () => {
        setSettling(true);
        try {
            await onSettleAll();
            setConfirmOpen(false);
        } catch (error) {
            // Error handled by parent
        } finally {
            setSettling(false);
        }
    };
    if (!settlements || settlements.length === 0) {
        return (
            <Box
                sx={{
                    p: { xs: 3, sm: 4 },
                    textAlign: 'center',
                    background: alpha('#fff', 0.02),
                    borderRadius: 3,
                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                }}
            >
                <CheckCircleIcon sx={{ color: '#10b981', marginBottom: 2 }} />
                <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                    All Settled Up! 🎉
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                    No outstanding balances in this group.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header - Trendy Fintech Style */}
            <Box
                sx={{
                    mb: 2.5,
                    p: 2,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 }
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)'
                        }}>
                            {/* Sparkles Icon - Represents Success/Celebration */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M19 3L19.5 5.5L22 6L19.5 6.5L19 9L18.5 6.5L16 6L18.5 5.5L19 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#F1F5F9', lineHeight: 1.2 }}>
                                Suggested Settlements
                            </Typography>
                            <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500 }}>
                                Simplified to {settlements.length} payment{settlements.length > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {settlements.length > 1 && (
                    <Button
                        onClick={() => setConfirmOpen(true)}
                        disabled={loading || settling}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: '#FFFFFF',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            padding: '8px 20px',
                            width: { xs: '100%', sm: 'auto' },
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)',
                            border: 'none',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 16px rgba(139, 92, 246, 0.45)'
                            },
                            '&:disabled': {
                                background: 'rgba(139, 92, 246, 0.3)',
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        }}
                    >
                        Mark All as Settled
                    </Button>
                )}
            </Box>

            {/* Settlement Cards */}
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
                {settlements.map((settlement, index) => (
                    <SettlementSuggestionCard
                        key={index}
                        settlement={settlement}
                        onSettle={onSettle}
                        loading={loading}
                    />
                ))}
            </Stack>

            {/* Info Chip */}

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmOpen}
                onClose={() => !settling && setConfirmOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        background: '#1E293B',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                        maxWidth: '400px',
                        width: '100%',
                        color: 'white'
                    }
                }}
            >
                <DialogContent sx={{ p: 3, textAlign: 'center' }}>
                    {settling ? (
                        <Box>
                            <CircularProgress size={60} sx={{ color: '#8b5cf6', mb: 2 }} />
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#F1F5F9', mb: 1 }}>
                                Settling Payments...
                            </Typography>
                            <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                                Please wait while we process {settlements.length} settlement{settlements.length > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Box>
                            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#F1F5F9', mb: 1 }}>
                                Mark All as Settled?
                            </Typography>
                            <Typography sx={{ fontSize: '0.9rem', color: '#94A3B8', mb: 3 }}>
                                This will record {settlements.length} settlement{settlements.length > 1 ? 's' : ''} and update all balances
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    onClick={() => setConfirmOpen(false)}
                                    fullWidth
                                    sx={{
                                        py: 1.2,
                                        borderRadius: '12px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: '#94A3B8',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        textTransform: 'none',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            color: '#F1F5F9'
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSettleAll}
                                    fullWidth
                                    sx={{
                                        py: 1.2,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                        color: '#FFFFFF',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 6px 16px rgba(139, 92, 246, 0.45)'
                                        }
                                    }}
                                >
                                    Confirm
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
