import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Avatar,
    Stack,
    Chip,
    styled,
    alpha
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
    background: `linear-gradient(135deg, 
        ${alpha(theme.palette.primary.main, 0.05)} 0%, 
        ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    borderRadius: 16,
    padding: '14px',   // 16 -> 14 (reduced by 2)
    marginBottom: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
    },

    // Mobile breakpoint (max-width: 899.95px = md breakpoint)
    [theme.breakpoints.down('md')]: {
        padding: '10px',
        borderRadius: '14px',
        marginBottom: '10px'
    }
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
    width: 43,  // 48 -> 43 (10% reduction)
    height: 43,
    fontSize: '1.1rem',  // 1.2 -> 1.1
    fontWeight: 700,
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`,

    // Mobile breakpoint
    [theme.breakpoints.down('md')]: {
        width: 38,
        height: 38,
        fontSize: '0.9rem'
    },

    [theme.breakpoints.down('sm')]: {
        width: 34,
        height: 34,
        fontSize: '0.8rem'
    }
}));

const AmountDisplay = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: '10px 16px',  // 12/20 -> 10/16
    background: alpha(theme.palette.background.paper, 0.5),
    borderRadius: 10,  // 12 -> 10
    border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,

    // Mobile  breakpoint
    [theme.breakpoints.down('md')]: {
        padding: '8px 12px',
        borderRadius: 8
    },

    [theme.breakpoints.down('sm')]: {
        padding: '6px 10px'
    }
}));

const SettleButton = styled(Button)(({ theme }) => ({
    borderRadius: 10,  // 12 -> 10
    padding: '8px 20px',  // 10/24 -> 8/20
    textTransform: 'none',
    fontSize: '0.9rem',  // 0.95 -> 0.9
    fontWeight: 600,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: theme.palette.common.white,
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
    whiteSpace: 'nowrap',

    '&:hover': {
        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.45)}`
    },

    // Mobile breakpoint
    [theme.breakpoints.down('md')]: {
        padding: '6px 16px',
        fontSize: '0.85rem',
        borderRadius: 8
    },

    [theme.breakpoints.down('sm')]: {
        width: '100%',
        padding: '8px 14px',
        fontSize: '0.8rem'
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
                spacing={1.5}
                sx={{ justifyContent: 'space-between' }}
            >
                {/* From User - Avatar + Name + Phone */}
                <Stack alignItems="center" spacing={0.4} sx={{ flex: '0 0 auto', minWidth: 63 }}>
                    <UserAvatar
                        src={getAvatarConfig(from.name).src}
                        alt={from.name}
                        sx={{
                            bgcolor: getAvatarConfig(from.name).bgcolor,
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    />
                    <Typography
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '0.68rem',
                            textAlign: 'center',
                            maxWidth: 63,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {from.name}
                    </Typography>
                    <Typography
                        sx={{
                            color: 'text.secondary',
                            fontSize: '0.58rem',
                            textAlign: 'center'
                        }}
                    >
                        {from.phone}
                    </Typography>
                </Stack>

                {/* Amount - Large & Prominent */}
                <Box sx={{ flex: '0 0 auto', textAlign: 'center', mx: 1 }}>
                    <Typography
                        sx={{
                            fontWeight: 700,
                            color: '#00d4ff',
                            fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.55rem' },
                            lineHeight: 1,
                            mb: 0.4
                        }}
                    >
                        ₹{amount.toFixed(0)}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: { xs: '0.58rem', sm: '0.63rem' },
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
                        width: { xs: 20, sm: 24 },
                        height: { xs: 20, sm: 24 },
                        flex: '0 0 auto'
                    }}
                />

                {/* To User - Avatar + Name + Phone */}
                <Stack alignItems="center" spacing={0.4} sx={{ flex: '0 0 auto', minWidth: 63 }}>
                    <UserAvatar
                        src={getAvatarConfig(to.name).src}
                        alt={to.name}
                        sx={{
                            bgcolor: getAvatarConfig(to.name).bgcolor,
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    />
                    <Typography
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '0.68rem',
                            textAlign: 'center',
                            maxWidth: 63,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {to.name}
                    </Typography>
                    <Typography
                        sx={{
                            color: 'text.secondary',
                            fontSize: '0.58rem',
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
                    startIcon={!loading}
                    sx={{
                        flex: '0 0 auto',
                        width: { xs: 100, sm: 120 },
                        ml: { xs: 1, sm: 1.5 }
                    }}
                >
                    {loading ? 'Settling...' : 'Settle Up'}
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
            {/* Header */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 2, sm: 0 }}
                sx={{ mb: 3 }}
            >
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Suggested Settlements
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Simplified to {settlements.length} payment{settlements.length > 1 ? 's' : ''}
                    </Typography>
                </Box>

                {settlements.length > 1 && (
                    <Button
                        variant="outlined"
                        onClick={onSettleAll}
                        disabled={loading}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            borderColor: alpha('#fff', 0.2),
                            color: 'primary.main',
                            fontSize: { xs: '0.85rem', sm: '0.875rem' },
                            padding: { xs: '6px 16px', sm: '8px 20px' },
                            width: { xs: '100%', sm: 'auto' },
                            '&:hover': {
                                borderColor: 'primary.main',
                                background: alpha('#fff', 0.05)
                            }
                        }}
                    >
                        Mark All as Settled
                    </Button>
                )}
            </Stack>

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

        </Box>
    );
}
