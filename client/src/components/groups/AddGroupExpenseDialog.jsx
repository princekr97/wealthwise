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
    Avatar,
    Fade,
    Paper,
    Divider,
    FormControlLabel
} from '@mui/material';
import {
    Close as CloseIcon,
    PersonAdd as PersonAddIcon,
    Add as AddIcon,
    Check as CheckIcon,
    Restaurant as FoodIcon,
    Flight as TravelIcon,
    Home as HomeIcon,
    LocalHospital as HealthIcon,
    Commute as TransportIcon,
    Bolt as UtilitiesIcon,
    SportsEsports as EntertainmentIcon,
    Receipt as BillIcon,
    AttachMoney as MoneyIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';
import { styled } from '@mui/material/styles';

const CATEGORIES = [
    'Food and Drink', 'Transportation', 'Home', 'Utilities', 'Entertainment', 'Life', 'Uncategorized'
];

const CATEGORY_ICONS = {
    'Entertainment': EntertainmentIcon,
    'Food and Drink': FoodIcon,
    'Home': HomeIcon,
    'Life': HealthIcon,
    'Transportation': TransportIcon,
    'Utilities': UtilitiesIcon,
    'Uncategorized': BillIcon
};

// Styled Components to match User's HTML/CSS
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '28px',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', // Premium Dark Gradient
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
        maxWidth: '460px',
        width: '100%',
        margin: 16,
        border: '1px solid rgba(255, 255, 255, 0.08)'
    }
}));

const HeaderBox = styled(Box)({
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // Matching dark theme
    padding: '1.5rem 1.75rem',
    position: 'relative',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
});

const CloseButton = styled(IconButton)({
    width: '32px', // Smaller
    height: '32px',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '50%',
    color: 'white',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.25)',
        transform: 'rotate(90deg)'
    },
    '& svg': {
        fontSize: '1.2rem'
    }
});

const CustomTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        transition: 'all 0.2s ease',
        '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: '1px'
        },
        '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.15)'
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            '& fieldset': {
                borderColor: '#3b82f6', // Accent Blue
                borderWidth: '1.5px'
            }
        },
    },
    '& .MuiInputBase-input': {
        padding: '0.85rem 1.1rem',
        fontSize: '0.95rem',
        color: 'white',
        fontWeight: 500,
        '&.Mui-disabled': {
            color: 'white',
            WebkitTextFillColor: 'white',
            opacity: 1
        }
    },
});

const CustomSelect = styled(Select)({
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: 'white',
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: '1px'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255, 255, 255, 0.15)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#3b82f6',
        borderWidth: '1.5px'
    },
    '& .MuiSelect-select': {
        padding: '0.85rem 1.1rem',
        fontSize: '0.95rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'white'
    },
    '& .MuiSvgIcon-root': {
        color: 'rgba(255, 255, 255, 0.5)'
    }
});

// Helper for "Form Label" look
const FormLabel = styled(Typography)({
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '1.5px'
});

const ParticipantCard = styled(Box)(({ theme, selected }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem',
    background: selected ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
    borderRadius: '14px',
    border: '1px solid',
    borderColor: selected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    '&:hover': {
        borderColor: selected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
        background: selected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.04)',
        transform: 'translateY(-2px)'
    }
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
    width: 48,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(24px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                opacity: 1,
                border: 0,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        width: 20,
        height: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    },
    '& .MuiSwitch-track': {
        borderRadius: 24 / 2,
        backgroundColor: '#cbd5e0',
        opacity: 1,
    },
}));

// Helper to safely get the effective User ID (Registered ID or Shadow Hash)
// Priority: 1. Populated userId._id 2. userId (if string hash) 3. _id (fallback, though less ideal)
const getMemberId = (member) => {
    if (member.userId && typeof member.userId === 'object' && member.userId._id) {
        return member.userId._id;
    }
    if (member.userId) return member.userId;
    return member._id;
};

export default function AddGroupExpenseDialog({ open, onClose, group, currentUser, onAddMemberClick, initialExpense }) {
    const [splitType, setSplitType] = useState('equal'); // 'equal' | 'custom'
    const [members, setMembers] = useState([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState([]); // Track selected members for split

    const { control, handleSubmit, watch, setValue, reset, getValues } = useForm({
        defaultValues: {
            description: '',
            amount: '',
            category: 'Uncategorized',
            paidBy: currentUser?._id || '',
            splits: []
        }
    });

    const amount = watch('amount');

    // Initialize members from group
    useEffect(() => {
        if (group?.members) {
            setMembers(group.members);
        }
    }, [group]);

    // Initialize form for Add or Edit
    useEffect(() => {
        if (open) {
            if (initialExpense) {
                setSplitType(initialExpense.splitType || 'equal');
                reset({
                    description: initialExpense.description,
                    amount: initialExpense.amount,
                    category: initialExpense.category || 'Uncategorized',
                    paidBy: (initialExpense.paidBy?._id || initialExpense.paidBy) || '',
                    splits: initialExpense.splits || []
                });
                // Set selected members from existing splits
                if (initialExpense.splits) {
                    setSelectedMemberIds(initialExpense.splits.filter(s => s.amount > 0).map(s => String(s.user?._id || s.user)));
                }
            } else {
                setSplitType('equal');
                reset({
                    description: '',
                    amount: '',
                    category: 'Uncategorized',
                    paidBy: currentUser?._id || '',
                    splits: []
                });
                setSelectedMemberIds(group?.members?.map(m => String(getMemberId(m))) || []);
            }
        } else {
            reset();
            setSplitType('equal');
            setSelectedMemberIds([]); // Reset selection on close
        }
    }, [open, initialExpense, reset, group, currentUser]);

    // Recalculate Equal Splits when amount or selection changes (Smart default for both modes)
    useEffect(() => {
        if (amount) {
            const totalAmount = parseFloat(amount);
            if (isNaN(totalAmount) || totalAmount <= 0) return;

            const activeMembers = selectedMemberIds.length;
            if (activeMembers === 0) return; // Divide by zero protection

            const amountPerPerson = totalAmount / activeMembers;
            // Floor to 2 decimals to avoid overshooting total
            const roundedAmount = Math.floor(amountPerPerson * 100) / 100;

            // Calculate remainder due to rounding
            const currentTotal = roundedAmount * activeMembers;
            const remainder = parseFloat((totalAmount - currentTotal).toFixed(2));

            let remainderAdded = false;

            const newSplits = members.map((member) => {
                const mId = String(getMemberId(member));
                const isSelected = selectedMemberIds.includes(mId);

                if (!isSelected) {
                    return {
                        userId: getMemberId(member),
                        name: member.name,
                        amount: 0
                    };
                }

                let splitAmount = roundedAmount;
                // Add remainder to the first selected person found to balance exactly
                if (!remainderAdded) {
                    splitAmount = parseFloat((roundedAmount + remainder).toFixed(2));
                    remainderAdded = true;
                }

                return {
                    userId: getMemberId(member),
                    name: member.name,
                    amount: splitAmount
                };
            });

            // Only update if the calculated splits are effectively different to avoid loops?
            // Actually, react-hook-form setValue shouldn't loop if values are same, but checking is safe.
            // For now, straightforward update.
            setValue('splits', newSplits, { shouldValidate: true });
        }
    }, [amount, members, selectedMemberIds, setValue, splitType]); // Added splitType back so switching tabs triggers recalc



    const onSubmit = async (data) => {
        try {
            // Validate custom splits total
            if (splitType === 'custom') {
                const totalSplit = data.splits.reduce((sum, split) => sum + Number(split.amount || 0), 0);
                if (Math.abs(totalSplit - Number(data.amount)) > 0.1) {
                    toast.error(`Total split (₹${totalSplit}) must equal expense amount (₹${data.amount})`);
                    return;
                }
            }

            const expenseData = {
                description: data.description,
                amount: Number(data.amount),
                category: data.category || 'Uncategorized',
                paidBy: data.paidBy,
                paidByName: members.find(m => String(getMemberId(m)) === String(data.paidBy))?.name || '',
                splits: data.splits.map(s => ({
                    user: s.userId,
                    userName: s.name,
                    amount: parseFloat(s.amount),
                    owed: parseFloat(s.amount) // For new expenses, owed is initially amount
                })),
                splitType
            };

            if (initialExpense) {
                await groupService.updateExpense(group._id, initialExpense._id, expenseData);
                toast.success('Expense updated');
            } else {
                await groupService.addExpense(group._id, expenseData);
                toast.success('Expense added');
            }

            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${initialExpense ? 'update' : 'add'} expense`);
        }
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            TransitionComponent={Fade}
            transitionDuration={300}
        >
            <HeaderBox>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.02em' }}>
                        Add New Expense
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem', mt: 0.5 }}>
                        Enter details to split costs
                    </Typography>
                </Box>
                <CloseButton onClick={onClose}>
                    <CloseIcon />
                </CloseButton>
            </HeaderBox>

            <DialogContent sx={{ p: '1.5rem !important' }}>
                <Stack spacing={2.5}>
                    {/* Description */}
                    <Box>
                        <FormLabel>Description</FormLabel>
                        <Controller
                            name="description"
                            control={control}
                            rules={{ required: 'Required' }}
                            render={({ field }) => (
                                <CustomTextField
                                    {...field}
                                    placeholder="e.g. Dinner at Taj Mahal Hotel"
                                    fullWidth
                                    variant="outlined"
                                />
                            )}
                        />
                    </Box>

                    {/* Amount & Category Row */}
                    <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                            <FormLabel>Amount</FormLabel>
                            <Controller
                                name="amount"
                                control={control}
                                rules={{ required: 'Required' }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        placeholder="0.00"
                                        type="number"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: <Typography sx={{ mr: 1, color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>₹</Typography>
                                        }}
                                    />
                                )}
                            />
                        </Box>

                        <Box sx={{ flex: 1.2 }}>
                            <FormLabel>Category</FormLabel>
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        fullWidth
                                        displayEmpty
                                        value={field.value || ''}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '0.85rem' }}>Select Type</MenuItem>
                                        {CATEGORIES.map(c => {
                                            const Icon = CATEGORY_ICONS[c] || CategoryIcon;
                                            return (
                                                <MenuItem key={c} value={c} sx={{ fontSize: '0.85rem', gap: 1.5, display: 'flex', alignItems: 'center' }}>
                                                    <Icon sx={{ fontSize: '1.2rem', color: '#64748b' }} />
                                                    {c}
                                                </MenuItem>
                                            );
                                        })}
                                    </CustomSelect>
                                )}
                            />
                        </Box>
                    </Stack>

                    {/* Paid By */}
                    <Box>
                        <FormLabel>Who Paid?</FormLabel>
                        <Controller
                            name="paidBy"
                            control={control}
                            rules={{ required: 'Required' }}
                            render={({ field }) => (
                                <CustomSelect
                                    {...field}
                                    fullWidth
                                    displayEmpty
                                    value={field.value || ''}
                                >
                                    <MenuItem value="" disabled sx={{ fontSize: '0.85rem' }}>Select Member</MenuItem>
                                    {members.map(member => {
                                        const isMe = currentUser && String(getMemberId(member)) === String(currentUser._id);
                                        return (
                                            <MenuItem
                                                key={member._id}
                                                value={getMemberId(member)}
                                                sx={{ fontSize: '0.85rem' }}
                                            >
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem' }}>{member.name[0]}</Avatar>
                                                    {isMe ? 'You' : member.name}
                                                </Stack>
                                            </MenuItem>
                                        );
                                    })}
                                </CustomSelect>
                            )}
                        />
                    </Box>

                    {/* Divider */}
                    <Box sx={{ height: '1px', background: '#f1f5f9', my: 1 }} />

                    {/* Split Section */}
                    <Box>
                        {/* Split Type Tabs - Compact Slider */}
                        <Box sx={{ mb: 2 }}>
                            <FormLabel sx={{ fontSize: '0.75rem', mb: 0.5 }}>Split Method</FormLabel>
                            <Box sx={{
                                background: '#f1f5f9',
                                borderRadius: '12px',
                                p: 0.3,
                                display: 'flex',
                                width: '100%'
                            }}>
                                {['equal', 'custom'].map((type) => (
                                    <Button
                                        key={type}
                                        onClick={() => setSplitType(type)}
                                        disableRipple
                                        sx={{
                                            flex: 1,
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            py: 0.5,
                                            minHeight: 0,
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            color: splitType === type ? 'white' : '#64748b',
                                            background: splitType === type ? '#4f46e5' : 'transparent',
                                            boxShadow: splitType === type ? '0 1px 3px rgba(79, 70, 229, 0.2)' : 'none',
                                            '&:hover': {
                                                background: splitType === type ? '#4338ca' : 'rgba(0,0,0,0.02)'
                                            }
                                        }}
                                    >
                                        {type === 'equal' ? 'Equally' : 'Unequally'}
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 1.5, display: 'block' }}>
                            {splitType === 'equal' ? 'Select people involved' : <span>Split among <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>(Tap to unselect)</span></span>}
                        </Typography>

                        {/* Unified Split List View */}
                        <Stack spacing={1.5} sx={{ mb: 2 }}>
                            {members.map((member, index) => {
                                const mId = getMemberId(member);
                                const isMe = currentUser && String(mId) === String(currentUser._id);
                                const isSelected = selectedMemberIds.includes(String(mId));

                                return (
                                    <Box
                                        key={mId}
                                        onClick={() => {
                                            setSelectedMemberIds(prev => {
                                                const sId = String(mId);
                                                if (prev.includes(sId)) {
                                                    return prev.filter(id => id !== sId);
                                                }
                                                return [...prev, sId];
                                            });
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 1.5,
                                            borderRadius: '16px',
                                            background: isSelected ? '#fff7ed' : '#f8fafc',
                                            border: '1px solid',
                                            borderColor: isSelected ? '#fed7aa' : 'transparent',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            {/* Custom Checkbox - Only visible in Custom/Unequal mode */}
                                            {splitType !== 'equal' && (
                                                <Box
                                                    sx={{
                                                        width: 18,
                                                        height: 18,
                                                        borderRadius: '6px',
                                                        background: isSelected ? '#4f46e5' : 'white', // Indigo-600
                                                        border: isSelected ? 'none' : '2px solid #cbd5e0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        transition: 'all 0.2s',
                                                        boxShadow: isSelected ? '0 2px 4px rgba(79, 70, 229, 0.2)' : 'none'
                                                    }}
                                                >
                                                    {isSelected && <CheckIcon sx={{ fontSize: '0.9rem' }} />}
                                                </Box>
                                            )}

                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Avatar
                                                    sx={{ width: 35, height: 35, bgcolor: '#f1f5f9' }}
                                                    src={member.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`}
                                                    alt={member.name}
                                                />
                                                <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>
                                                    {isMe ? 'You' : (member.name.length > 6 ? member.name.substring(0, 6) + '...' : member.name)}
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        <Box sx={{ width: 110 }}>
                                            {isSelected ? (
                                                <Controller
                                                    name={`splits.${index}.amount`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            placeholder="0"
                                                            type="number"
                                                            variant="outlined"
                                                            size="small"
                                                            disabled={splitType === 'equal'} // Auto-calc in equal mode
                                                            InputProps={{
                                                                startAdornment: <Typography sx={{ mr: 0.5, color: splitType === 'equal' ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>₹</Typography>
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '10px',
                                                                    bgcolor: splitType === 'equal' ? '#f1f5f9' : 'white',
                                                                    '& fieldset': { borderColor: splitType === 'equal' ? 'transparent' : '#e2e8f0' },
                                                                    '&:hover fieldset': { borderColor: splitType === 'equal' ? 'transparent' : '#cbd5e0' },
                                                                    '&.Mui-focused fieldset': { borderColor: splitType === 'equal' ? 'transparent' : '#4f46e5' }
                                                                },
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 700,
                                                                    textAlign: 'right',
                                                                    color: '#1e293b',
                                                                },
                                                                '& .MuiInputBase-input.Mui-disabled': {
                                                                    opacity: 1,
                                                                    color: '#1e293b !important',
                                                                    WebkitTextFillColor: '#1e293b !important',
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            ) : (
                                                <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'right', fontWeight: 500, py: 1, pr: 1.5 }}>
                                                    ₹0
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}

                            {/* Remaining Amount Indicator (Visible in Both for clarity, or just Unequal?)
                                In Equal mode, remainder adds up to 0 automatically essentially.
                                Ideally show always for validation.
                            */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, py: 1 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#64748b' }}>
                                    Selected: {selectedMemberIds.length} / {members.length}
                                </Typography>
                                {splitType === 'custom' && (
                                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#16a34a' }}>
                                        Remaining: <span style={{ color: '#16a34a' }}>₹{
                                            (() => {
                                                const assigned = (watch('splits') || []).reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
                                                const total = parseFloat(amount || 0);
                                                const rem = Math.max(0, (total - assigned)).toFixed(2);
                                                return rem;
                                            })()
                                        }</span>
                                    </Typography>
                                )}
                            </Box>
                        </Stack>

                        {/* Add Member Button - Triggers Popup */}
                        <Button
                            startIcon={<PersonAddIcon />}
                            onClick={onAddMemberClick}
                            sx={{
                                textTransform: 'none',
                                color: '#2a5298',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                justifyContent: 'flex-start',
                                pl: 1,
                                '&:hover': { bgcolor: '#eef2ff' }
                            }}
                        >
                            Add new member
                        </Button>
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                        <Button
                            fullWidth
                            onClick={onClose}
                            sx={{
                                py: 1.25,
                                borderRadius: '10px',
                                background: '#f1f5f9',
                                color: '#64748b',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                '&:hover': { background: '#e2e8f0' },
                                textTransform: 'none'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            onClick={handleSubmit(onSubmit)}
                            sx={{
                                py: 1.25,
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                boxShadow: '0 4px 12px rgba(42, 82, 152, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(42, 82, 152, 0.4)',
                                    transform: 'translateY(-1px)'
                                },
                                textTransform: 'none',
                                transition: 'all 0.2s ease',
                                fontSize: '12px'
                            }}
                        >
                            Add Expense
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent >
        </StyledDialog >
    );
}
