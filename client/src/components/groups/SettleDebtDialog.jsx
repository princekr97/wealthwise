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
    Box
} from '@mui/material';
import {
    Handshake as HandshakeIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';

export default function SettleDebtDialog({ open, onClose, group, currentUser, balances, onSettled }) {
    const { control, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            payerId: currentUser?._id || '',
            receiverId: '',
            amount: ''
        }
    });

    const payerId = watch('payerId');
    const receiverId = watch('receiverId');

    // Intelligent defaults
    useEffect(() => {
        if (open && group && balances) {
            if (currentUser) {
                // If I owe money (negative balance), I am payer.
                const myBal = balances[currentUser._id] || 0;
                if (myBal < 0) {
                    setValue('payerId', currentUser._id);
                    // Suggest receiver: The person with highest positive balance?
                    const topCreditor = Object.entries(balances)
                        .sort(([, a], [, b]) => b - a)[0]; // Max balance
                    if (topCreditor && topCreditor[0] !== currentUser._id) {
                        setValue('receiverId', topCreditor[0]);
                        // Suggest amount: Min(abs(myBal), creditorBal)
                        const suggested = Math.min(Math.abs(myBal), topCreditor[1]);
                        setValue('amount', suggested);
                    }
                } else if (myBal > 0) {
                    // If I am owed money, I am receiver.
                    setValue('receiverId', currentUser._id);
                    // Suggest payer: Top debtor
                    const topDebtor = Object.entries(balances)
                        .sort(([, a], [, b]) => a - b)[0]; // Min balance (most negative)
                    if (topDebtor && topDebtor[0] !== currentUser._id) {
                        setValue('payerId', topDebtor[0]);
                        const suggested = Math.min(myBal, Math.abs(topDebtor[1]));
                        setValue('amount', suggested);
                    }
                }
            }
        }
    }, [open, group, balances, currentUser, setValue]);

    const onSubmit = async (data) => {
        try {
            if (data.payerId === data.receiverId) {
                toast.error('Payer and Receiver cannot be the same person');
                return;
            }

            await groupService.settleDebt(group._id, {
                payerId: data.payerId,
                receiverId: data.receiverId,
                amount: parseFloat(data.amount)
            });

            toast.success('Debt settled successfully');
            onSettled();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to settle debt');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HandshakeIcon color="primary" />
                Settle Up
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Controller
                            name="payerId"
                            control={control}
                            rules={{ required: 'Payer is required' }}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel>Payer</InputLabel>
                                    <Select {...field} label="Payer">
                                        {group?.members.map(member => (
                                            <MenuItem key={member.userId?._id || member.userId || member.email} value={member.userId?._id || member.userId}>
                                                {member.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        />

                        <ArrowForwardIcon color="action" />

                        <Controller
                            name="receiverId"
                            control={control}
                            rules={{ required: 'Receiver is required' }}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel>Receiver</InputLabel>
                                    <Select {...field} label="Receiver">
                                        {group?.members.map(member => (
                                            <MenuItem key={member.userId?._id || member.userId || member.email} value={member.userId?._id || member.userId}>
                                                {member.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Box>

                    <Controller
                        name="amount"
                        control={control}
                        rules={{ required: 'Amount is required' }}
                        render={({ field, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                label="Amount"
                                type="number"
                                fullWidth
                                error={!!error}
                                helperText={error?.message}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    style: { fontSize: '1.5rem', fontWeight: 600, textAlign: 'center' }
                                }}
                                sx={{ maxWidth: 200 }}
                            />
                        )}
                    />

                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        {payerId && receiverId && group ? (
                            `Recording that ${group.members.find(m => (m.userId?._id || m.userId) === payerId)?.name} paid ${group.members.find(m => (m.userId?._id || m.userId) === receiverId)?.name}`
                        ) : 'Select a payer and receiver'}
                    </Typography>

                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit(onSubmit)} variant="contained" color="success">
                    Record Payment
                </Button>
            </DialogActions>
        </Dialog>
    );
}
