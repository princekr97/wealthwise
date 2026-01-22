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
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '12px',
    marginTop: '12px',
    border: '1px solid rgba(139, 92, 246, 0.12)',
    width: '100%',
    transition: 'all 0.2s ease'
}));

const SettleButton = styled(Button)(({ theme }) => ({
    borderRadius: '14px',
    padding: '10px 24px',
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    color: '#FFFFFF',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '&:hover': {
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 24px rgba(139, 92, 246, 0.45)'
    },
    '&:active': {
        transform: 'translateY(0)'
    }
}));

const AmountInput = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root': {
        backgroundColor: 'transparent',
    },
    '& .MuiInputBase-input': {
        fontSize: '2.8rem', // Slightly smaller for better dialog fit
        fontWeight: 800,
        textAlign: 'center',
        padding: '0',
        color: '#F1F5F9',
        width: '100%',
        maxWidth: '200px',
        letterSpacing: '-1.5px',
        background: 'linear-gradient(to bottom, #FFFFFF 0%, #CBD5E1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
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
            disableScrollLock={false}
            scroll="body"
            PaperProps={{
                sx: {
                    borderRadius: '28px',
                    p: 1,
                    backgroundImage: 'none',
                    bgcolor: '#0F172A', // Deeper slate for better contrast
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    overflow: 'hidden'
                }
            }}
            sx={{
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)'
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1, pr: 1 }}>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: '#94A3B8',
                        '&:hover': { color: '#F1F5F9', bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ mt: 0, px: 3, pb: 2, pt: 0 }}>
                <Stack spacing={2} alignItems="center">
                    {/* User Selection Header */}
                    <Box sx={{ textAlign: 'center', position: 'relative', width: '100%' }}>
                        {/* Glow behind avatar */}
                        <Box sx={{
                            position: 'absolute',
                            top: '20%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                            zIndex: 0
                        }} />

                        <Avatar
                            src={getAvatarConfig(oppositeUser?.name || '?').url}
                            sx={{
                                width: 64,
                                height: 64,
                                mx: 'auto',
                                mb: 1.5,
                                position: 'relative',
                                zIndex: 1,
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                            }}
                        />
                        <Typography sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 0.25 }}>
                            Received from
                        </Typography>
                        <Typography sx={{ color: '#F1F5F9', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
                            {oppositeUser?.name || '...'}
                        </Typography>
                    </Box>

                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#4F46E5', opacity: 0.8 }}>₹</Typography>
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
                        {/* Interactive underline */}
                        <Box sx={{
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)',
                            width: '160px',
                            mt: 1
                        }} />
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94A3B8', mb: 1.5, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            ⓘ Disclaimer
                        </Typography>
                        <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#8b5cf6', boxShadow: '0 0 8px #8b5cf6' }} />
                                <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.8rem', fontWeight: 500 }}>
                                    Recording a payment doesn't move money
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#8b5cf6', boxShadow: '0 0 8px #8b5cf6' }} />
                                <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.8rem', fontWeight: 500 }}>
                                    This records payments made outside eKhataBahi.
                                </Typography>
                            </Box>
                        </Stack>
                    </DisclaimerBox>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

