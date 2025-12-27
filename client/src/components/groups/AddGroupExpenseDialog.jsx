import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    InputAdornment,
    Switch,
    FormControlLabel,
    Avatar
} from '@mui/material';
import {
    Close as CloseIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';

const CATEGORIES = [
    'General', 'Entertainment', 'Food and Drink', 'Home', 'Life', 'Transportation', 'Utilities', 'Uncategorized'
];

export default function AddGroupExpenseDialog({ open, onClose, group, currentUser }) {
    const [splitType, setSplitType] = useState('equal'); // 'equal' | 'custom'

    const { control, handleSubmit, watch, setValue, reset } = useForm({
        defaultValues: {
            description: '',
            amount: '',
            category: 'Uncategorized',
            paidBy: currentUser?._id || '',
            splits: []
        }
    });

    // Watch for amount changes to auto-update equal splits
    const amount = watch('amount');

    useEffect(() => {
        if (open && group) {
            // Initialize splits
            // Default: Everyone splits equally
            // We need to map group members to split objects
            const memberSplits = group.members.map(m => ({
                userId: m.userId?._id || m.userId, // handle populated or raw
                name: m.name,
                amount: 0
            }));
            setValue('splits', memberSplits);
            setValue('paidBy', currentUser?._id);
            setSplitType('equal'); // Reset to equal split
        } else if (!open) {
            // Reset form when dialog closes
            reset();
            setSplitType('equal');
        }
    }, [open, group, currentUser, setValue, reset]);

    // Auto-calculate equal splits when amount changes
    useEffect(() => {
        if (splitType === 'equal' && amount && group && group.members.length > 0) {
            const numMembers = group.members.length;
            const totalAmount = parseFloat(amount);

            if (isNaN(totalAmount) || totalAmount <= 0) return;

            const amountPerPerson = totalAmount / numMembers;
            const roundedAmount = parseFloat(amountPerPerson.toFixed(2));

            // Calculate splits for all members
            const newSplits = group.members.map((member, index) => {
                // Handle rounding - last person gets the remainder
                const isLast = index === group.members.length - 1;
                const splitAmount = isLast
                    ? parseFloat((totalAmount - (roundedAmount * (numMembers - 1))).toFixed(2))
                    : roundedAmount;

                return {
                    userId: member.userId?._id || member.userId,
                    name: member.name,
                    amount: splitAmount
                };
            });

            setValue('splits', newSplits, { shouldValidate: true });
        }
    }, [amount, splitType, group, setValue]);

    const onSubmit = async (data) => {
        try {
            // Format splits for backend
            // Backend expects: splits: [{ user: userId, amount: number, owed: number }]
            // Our form has: splits: [{ userId, name, amount }]

            const formattedSplits = data.splits.map(s => ({
                user: s.userId,
                amount: parseFloat(s.amount),
                owed: parseFloat(s.amount) // Simply set owed = amount for now (consumed amount)
            }));

            const payload = {
                description: data.description,
                amount: parseFloat(data.amount),
                category: data.category,
                paidBy: data.paidBy,
                splits: formattedSplits
            };

            await groupService.addExpense(group._id, payload);
            toast.success('Expense added');
            reset();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add expense');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Add Expense
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Controller
                        name="description"
                        control={control}
                        rules={{ required: 'Description is required' }}
                        render={({ field, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                label="Description"
                                fullWidth
                                error={!!error}
                                helperText={error?.message}
                                placeholder="What is this for?"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><ReceiptIcon fontSize="small" /></InputAdornment>
                                }}
                            />
                        )}
                    />

                    <Stack direction="row" spacing={2}>
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
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select {...field} label="Category">
                                        {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Stack>

                    <Controller
                        name="paidBy"
                        control={control}
                        rules={{ required: 'Payer is required' }}
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <InputLabel>Paid By</InputLabel>
                                <Select
                                    {...field}
                                    label="Paid By"
                                    value={field.value || ''}
                                    onChange={(e) => {
                                        console.log('Paid By changed:', e.target.value);
                                        field.onChange(e.target.value);
                                    }}
                                >
                                    {group?.members.map(member => {
                                        // For registered users: use userId._id or userId
                                        // For shadow members: use member._id
                                        const memberId = member.userId?._id || member.userId || member._id;
                                        console.log('Full member object:', member);
                                        console.log('Member option:', {
                                            name: member.name,
                                            memberId,
                                            shadowMember: !member.userId,
                                            hasUserId: !!member.userId,
                                            userId: member.userId,
                                            _id: member._id
                                        });
                                        return (
                                            <MenuItem
                                                key={member._id}
                                                value={memberId}
                                            >
                                                {member.name} {!member.userId && '(Guest)'}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        )}
                    />

                    <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle2">Split Options</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={splitType === 'custom'}
                                        onChange={(e) => setSplitType(e.target.checked ? 'custom' : 'equal')}
                                        size="small"
                                    />
                                }
                                label="Custom Split"
                            />
                        </Box>

                        <Stack spacing={1.5}>
                            {group?.members.map((member, index) => (
                                <Box key={member._id || index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>{member.name[0]}</Avatar>
                                    <Typography variant="body2" sx={{ flex: 1 }}>{member.name}</Typography>

                                    <Controller
                                        name={`splits.${index}.amount`}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                value={field.value || ''}
                                                size="small"
                                                type="number"
                                                disabled={splitType === 'equal'}
                                                sx={{ width: 100 }}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Box>

                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit(onSubmit)} variant="contained">Add Expense</Button>
            </DialogActions>
        </Dialog>
    );
}
