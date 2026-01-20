import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    InputAdornment,
    Avatar,
    Box,
    alpha,
    styled,
    IconButton
} from '@mui/material';
import {
    Handshake as HandshakeIcon,
    ArrowForward as ArrowForwardIcon,
    Close as CloseIcon,
    Circle as BulletIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';
import { getAvatarConfig } from '../../utils/avatarHelper';

const DisclaimerBox = styled(Box)(({ theme }) => ({
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: '12px',
    padding: '12px 14px',
    marginTop: '16px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    transition: 'all 0.2s ease'
}));

const SettleButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    padding: '12px 24px',
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    transition: 'all 0.2s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
    },
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
}));

const AmountInput = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root': {
        backgroundColor: 'transparent',
    },
    '& .MuiInputBase-input': {
        fontSize: '2.5rem',
        fontWeight: 700,
        textAlign: 'center',
        padding: '10px 0',
        color: '#F1F5F9',
        width: '150px',
        height: 'auto',
        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
        },
        '&[type=number]': {
            '-moz-appearance': 'textfield',
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none'
    },
    '& .MuiInputAdornment-root': {
        marginRight: '0px',
        marginLeft: '0px'
    },
    '& .MuiInputAdornment-root p': {
        fontSize: '1.6rem',
        fontWeight: 600,
        color: '#94A3B8',
        marginTop: '4px',
        marginRight: '0px'
    }
}));

export default function SettleDebtDialog({ open, onClose, group, currentUser, balances, onSettled, initialSettlement }) {
    const { control, handleSubmit, watch, setValue } = useForm({
        defaultValues: { payerId: '', receiverId: '', amount: '' }
    });

    const payerId = watch('payerId');
    const receiverId = watch('receiverId');

    useEffect(() => {
        if (!open || !group || !currentUser || !initialSettlement) return;
        
        setValue('payerId', initialSettlement.from.userId);
        setValue('receiverId', initialSettlement.to.userId);
        setValue('amount', initialSettlement.amount.toFixed(2));
    }, [open, initialSettlement, setValue]);

    const onSubmit = async (data) => {
        try {
            const payer = group.members.find(m => String(m.userId?._id || m.userId || m._id) === String(data.payerId));
            const receiver = group.members.find(m => String(m.userId?._id || m.userId || m._id) === String(data.receiverId));

            await groupService.settleDebt(group._id, {
                payerId: data.payerId,
                receiverId: data.receiverId,
                amount: parseFloat(data.amount),
                payerName: payer?.name || 'Unknown',
                receiverName: receiver?.name || 'Unknown'
            });

            toast.success('Debt settled successfully');
            onSettled();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to settle debt');
        }
    };

    const oppositeUser = React.useMemo(() => {
        if (!group || !payerId || !receiverId || !currentUser) return null;
        const targetId = String(payerId) === String(currentUser._id) ? receiverId : payerId;
        return group.members.find(m => String(m.userId?._id || m.userId || m._id) === targetId);
    }, [group, payerId, receiverId, currentUser]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    p: 1,
                    backgroundImage: 'none',
                    bgcolor: '#1E293B', // Deep slate background
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, px: 2 }}>
                <Box sx={{ width: 40, height: 4, bgcolor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2 }} />
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{ color: '#94A3B8', '&:hover': { color: '#F1F5F9', bgcolor: 'rgba(255,255,255,0.08)' } }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ mt: 1, px: 2.5, pb: 2.5 }}>
                <Stack spacing={3} alignItems="center">
                    {/* User Selection Header */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Avatar
                            src={getAvatarConfig(oppositeUser?.name || '?').url}
                            sx={{
                                width: 64,
                                height: 64,
                                mx: 'auto',
                                mb: 1.5,
                                border: '3px solid rgba(139, 92, 246, 0.3)',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
                            }}
                        />
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.8rem', mb: 0.5 }}>
                            Received from
                        </Typography>
                        <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '1.15rem' }}>
                            {oppositeUser?.name || '...'}
                        </Typography>
                    </Box>

                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '1.8rem', fontWeight: 600, color: '#94A3B8', mt: 0.5 }}>₹</Typography>
                            <Controller
                                name="amount"
                                control={control}
                                rules={{ required: 'Amount is required' }}
                                render={({ field }) => (
                                    <AmountInput
                                        {...field}
                                        variant="outlined"
                                        type="number"
                                    />
                                )}
                            />
                        </Box>
                        <Box sx={{ height: '2px', bgcolor: 'rgba(139, 92, 246, 0.3)', width: '180px', mt: 0.5, borderRadius: 1 }} />
                    </Box>

                    {/* Action Button */}
                    <SettleButton
                        fullWidth
                        onClick={handleSubmit(onSubmit)}
                        variant="contained"
                    >
                        Settle Up
                    </SettleButton>

                    {/* Disclaimer Section */}
                    <DisclaimerBox>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E2E8F0', mb: 1, fontSize: '0.8rem' }}>
                            ⓘ Disclaimer
                        </Typography>
                        <Stack spacing={0.8}>
                            <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#A78BFA', mt: 0.8, flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.75rem', lineHeight: 1.5 }}>
                                    Recording a payment doesn't move money
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#A78BFA', mt: 0.8, flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.75rem', lineHeight: 1.5 }}>
                                    This records payments made outside KhataBahi.
                                </Typography>
                            </Box>
                        </Stack>
                    </DisclaimerBox>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

