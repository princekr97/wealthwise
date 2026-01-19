/**
 * @file AddGroupExpenseDialog.jsx
 * @description Dialog component for adding or editing group expenses with split management.
 * 
 * Features:
 * - Add/Edit expenses with custom or equal splits
 * - Category selection with icons
 * - Payer selection from group members
 * - Custom amount distribution validation
 * - Optimistic UI updates for instant feedback
 * 
 * @module components/groups/AddGroupExpenseDialog
 * @requires react
 * @requires @mui/material
 * @requires react-hook-form
 * @requires sonner
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
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
    Avatar,
    Fade,
    Divider,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    Close as CloseIcon,
    Check as CheckIcon,
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
    PersonAdd as PersonAddIcon  // For Add Member button
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { getAvatarConfig } from '../../utils/avatarHelper';
import { getCategoryStyle } from '../../utils/categoryHelper';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';
import { styled } from '@mui/material/styles';

// ============================================
// CONSTANTS
// ============================================

/**
 * Available expense categories (matches reference design)
 * @constant {string[]}
 */
const CATEGORIES = [
    'Food',
    'Groceries',
    'Travel',
    'Stays',
    'Bills',
    'Subscription',
    'Shopping',
    'Gifts',
    'Drinks',
    'Fuel',
    'Health',
    'Entertainment',
    'Settlement',
    'Misc.'
];

/**
 * Icon mapping for expense categories
 * @constant {Object<string, JSX.Element>}
 */
const CATEGORY_ICONS = {
    'Food': FoodIcon,
    'Groceries': GroceriesIcon,
    'Travel': TravelIcon,
    'Stays': StaysIcon,
    'Bills': BillIcon,
    'Subscription': BillIcon,
    'Shopping': ShoppingIcon,
    'Gifts': GiftsIcon,
    'Drinks': DrinksIcon,
    'Fuel': FuelIcon,
    'Health': HealthcareIcon,
    'Entertainment': EntertainmentIcon,
    'Settlement': MoneyIcon,
    'Misc.': CategoryIcon
};

// Styled Components to match User's HTML/CSS
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '28px',
        background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), var(--active-gradient)',
        backgroundAttachment: 'fixed',
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
        padding: '0.85rem 1.1rem !important',
        fontSize: '0.95rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#f8fafc !important' // Explicitly off-white
    },
    '& .MuiSvgIcon-root': {
        color: 'rgba(255, 255, 255, 0.5) !important'
    }
});

// Helper for "Form Label" look
const FormLabel = styled(Typography)({
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'rgba(255,255,255,0.6)', // Improved visibility (was 0.4)
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

export default function AddGroupExpenseDialog({ open, onClose, group, currentUser, onAddMemberClick, initialExpense, onExpenseAdded }) {
    const [splitType, setSplitType] = useState('equal'); // 'equal' | 'custom'
    const [members, setMembers] = useState([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState([]); // Track selected members for split
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, watch, setValue, reset, getValues } = useForm({
        defaultValues: {
            description: '',
            amount: '',
            category: '',
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
                    category: initialExpense.category || '',
                    paidBy: (initialExpense.paidBy?._id || initialExpense.paidBy) || '',
                    splits: initialExpense.splits || []
                });
                // Set selected members from existing splits
                if (initialExpense.splits) {
                    setSelectedMemberIds(initialExpense.splits.filter(s => s.amount > 0).map(s => String(s.user?._id || s.user)));
                }
            } else {
                setSplitType('equal');

                // Find matching member ID for current user to ensure dropdown value match
                let defaultPayer = '';
                if (currentUser && group?.members) {
                    const matchingMember = group.members.find(m => String(getMemberId(m)) === String(currentUser._id));
                    if (matchingMember) {
                        defaultPayer = getMemberId(matchingMember);
                    }
                }

                reset({
                    description: '',
                    amount: '',
                    category: '',
                    paidBy: defaultPayer,
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

    // Track previous selection to detect additions/removals
    const prevSelectedRef = React.useRef(selectedMemberIds);

    // Recalculate Equal Splits when amount or selection changes
    // This logic now applies to BOTH 'equal' and 'custom' modes to provide "Auto-Equalize" behavior.
    // In 'custom' mode, users can then manually edit the values (unlike 'equal' mode where inputs are disabled).
    useEffect(() => {
        if (!amount) return;

        const totalAmount = parseFloat(amount);
        if (isNaN(totalAmount) || totalAmount <= 0) return;

        const activeMembers = selectedMemberIds.length;

        // If no one is selected, just zero out everyone
        if (activeMembers === 0) {
            const zeroSplits = members.map(m => ({
                userId: getMemberId(m),
                name: m.name,
                amount: 0
            }));
            setValue('splits', zeroSplits);
            return;
        }

        // Calculate Equal Share
        const amountPerPerson = totalAmount / activeMembers;
        const roundedAmount = Math.floor(amountPerPerson * 100) / 100;

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
            // Distribute remainder to first selected person
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

        // We update the form values. 
        // Note: In 'custom' mode, this OVERWRITES manual edits if the 'amount' or 'selection' changes.
        // This is the desired behavior per user request.
        // Manual edits are only preserved if NO dependency changes (i.e. just typing).
        setValue('splits', newSplits, { shouldValidate: true });

    }, [amount, members, selectedMemberIds, setValue]);



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

            setLoading(true);

            // Robustly construct splits by iterating members to ensure IDs match
            const validSplits = members.map((member, index) => {
                const splitEntry = data.splits && data.splits[index];
                const amount = splitEntry ? parseFloat(splitEntry.amount || 0) : 0;

                return {
                    user: getMemberId(member),
                    userName: member.name,
                    amount: amount,
                    owed: amount
                };
            }).filter(s => s.amount > 0);

            // Client-side validation: validSplits sum must equal total amount
            const totalSplit = validSplits.reduce((sum, s) => sum + s.amount, 0);
            const expenseAmount = Number(data.amount);

            if (Math.abs(totalSplit - expenseAmount) > 0.1) {
                if (validSplits.length === 0) {
                    toast.error("Please select at least one person to split with.");
                } else {
                    toast.error(`Total split (₹${totalSplit}) does not match expense amount (₹${expenseAmount})`);
                }
                setLoading(false);
                return;
            }

            const expenseData = {
                description: data.description,
                amount: expenseAmount,
                category: data.category || 'Misc.',
                paidBy: data.paidBy,
                paidByName: members.find(m => String(getMemberId(m)) === String(data.paidBy))?.name || '',
                splits: validSplits,
                splitType
            };

            const isUpdate = Boolean(initialExpense);

            try {
                if (isUpdate) {
                    await groupService.updateExpense(group?._id, initialExpense._id, expenseData);
                    toast.success('Expense updated!');
                } else {
                    await groupService.addExpense(group?._id, expenseData);
                    toast.success('Expense added!');
                }

                // Trigger refresh AFTER success
                if (onExpenseAdded) onExpenseAdded();
                onClose();
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || `Failed to ${isUpdate ? 'update' : 'add'} expense`);
            } finally {
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
            toast.error(err.message || 'Invalid input');
        }
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            TransitionComponent={Fade}
            transitionDuration={300}
        >
            <HeaderBox sx={{ position: 'relative', justifyContent: 'center', textAlign: 'center', py: 2.5 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.02em' }}>
                        Add New Expense
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem', mt: 0.5, color: '#94a3b8' }}>
                        Enter details to split costs
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        color: '#64748b',
                        background: 'rgba(255, 255, 255, 0.05)',
                        '&:hover': { color: 'white', background: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <CloseIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
            </HeaderBox>

            <DialogContent sx={{ p: '1.25rem !important' }}>
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
                                        sx={{ '& .MuiSvgIcon-root': { color: '#94a3b8' } }}
                                        value={field.value || ''}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: '#0f172a',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
                                                    mt: 1,
                                                    '& .MuiMenuItem-root': {
                                                        color: '#cbd5e1',
                                                        fontSize: '0.9rem',
                                                        p: '10px 16px',
                                                        gap: '12px',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(255, 255, 255, 0.04)',
                                                            color: '#fff'
                                                        },
                                                        '&.Mui-selected': {
                                                            bgcolor: 'rgba(59, 130, 246, 0.12) !important',
                                                            color: '#60a5fa',
                                                            fontWeight: 600
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '0.85rem', color: '#64748b !important' }}>Select Category</MenuItem>
                                        {CATEGORIES.map(c => {
                                            const Icon = CATEGORY_ICONS[c] || CategoryIcon;
                                            return (
                                                <MenuItem key={c} value={c}>
                                                    <Box
                                                        sx={{
                                                            width: 28, height: 28,
                                                            borderRadius: '8px',
                                                            bgcolor: `${getCategoryStyle(c).color}15`, // Faded background (15% opacity)
                                                            color: getCategoryStyle(c).color,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mr: 1.5
                                                        }}
                                                    >
                                                        <Icon sx={{ fontSize: '1.1rem', color: 'inherit' }} />
                                                    </Box>
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
                                    sx={{ '& .MuiSvgIcon-root': { color: '#94a3b8' } }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: '#0f172a',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
                                                mt: 1,
                                                '& .MuiMenuItem-root': {
                                                    color: '#cbd5e1',
                                                    fontSize: '0.9rem',
                                                    p: '10px 16px',
                                                    gap: '12px',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                                                        color: '#fff'
                                                    },
                                                    '&.Mui-selected': {
                                                        bgcolor: 'rgba(59, 130, 246, 0.12) !important',
                                                        color: '#60a5fa',
                                                        fontWeight: 600
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="" disabled sx={{ fontSize: '0.85rem', color: '#64748b !important' }}>Select Member</MenuItem>
                                    {members.map(member => {
                                        const isMe = currentUser && String(getMemberId(member)) === String(currentUser._id);
                                        return (
                                            <MenuItem
                                                key={member._id}
                                                value={getMemberId(member)}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                                    <Avatar
                                                        sx={{
                                                            width: 24, height: 24,
                                                            bgcolor: getAvatarConfig(member.name, member.avatarUrl).bgcolor,
                                                            color: '#0f172a',
                                                            border: '1px solid #e2e8f0'
                                                        }}
                                                        src={getAvatarConfig(member.name, member.avatarUrl).src}
                                                    />
                                                    <span style={{ color: 'inherit' }}>{isMe ? 'You' : member.name}</span>
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
                                        onClick={() => {
                                            setSplitType(type);
                                            // Always reset to "All Selected" for both modes providing a clean "Select All" start
                                            const allIds = members.map(m => String(getMemberId(m)));
                                            setSelectedMemberIds(allIds);
                                            prevSelectedRef.current = allIds;

                                            // Trigger re-calc is handled by useEffect on splitType/selection change
                                        }}
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

                        {/* Modern Compact Split List */}
                        <Stack spacing={1} sx={{ mb: 2 }}>
                            {members.map((member, index) => {
                                const mId = getMemberId(member);
                                const isMe = currentUser && String(mId) === String(currentUser._id);
                                const isSelected = selectedMemberIds.includes(String(mId));

                                return (
                                    <Box
                                        key={mId}
                                        onClick={() => {
                                            if (splitType === 'equal') return; // Disabled in equal mode per request
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
                                            p: '8px 12px',
                                            borderRadius: '12px',
                                            background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                            border: '1px solid',
                                            borderColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                            cursor: splitType === 'equal' ? 'default' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: (splitType !== 'equal' && isSelected) ? 'rgba(59, 130, 246, 0.12)' : (splitType !== 'equal' ? 'rgba(255, 255, 255, 0.03)' : 'transparent')
                                            }
                                        }}
                                    >
                                        {/* Left: Avatar & Name */}
                                        {/* Left: Checkbox + Avatar & Name */}
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            {/* Custom Checkbox - Restored for 'Unequally' mode */}
                                            {splitType === 'custom' && (
                                                <Box
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '6px',
                                                        background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                                        border: isSelected ? 'none' : '2px solid #cbd5e0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        transition: 'all 0.2s',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {isSelected && <CheckIcon sx={{ fontSize: '14px', strokeWidth: 2 }} />}
                                                </Box>
                                            )}

                                            <Box sx={{ position: 'relative' }}>
                                                <Avatar
                                                    sx={{
                                                        width: 36, height: 36,
                                                        bgcolor: getAvatarConfig(member.name, member.avatarUrl).bgcolor,
                                                        color: '#1e293b',
                                                        border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    src={getAvatarConfig(member.name, member.avatarUrl).src}
                                                    alt={member.name}
                                                />
                                            </Box>

                                            <Typography sx={{
                                                fontWeight: isSelected ? 600 : 500,
                                                color: isSelected ? 'white' : '#94a3b8',
                                                fontSize: '0.9rem',
                                                transition: 'color 0.2s'
                                            }}>
                                                {isMe ? 'You' : member.name}
                                            </Typography>
                                        </Stack>


                                        {/* Right: Amount Input */}
                                        <Box onClick={(e) => e.stopPropagation()}>
                                            {isSelected ? (
                                                <Controller
                                                    name={`splits.${index}.amount`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            placeholder="0"
                                                            type="number"
                                                            variant="standard" // Cleaner standard variant
                                                            size="small"
                                                            disabled={splitType === 'equal'}
                                                            InputProps={{
                                                                disableUnderline: true,
                                                                startAdornment: <Typography sx={{ mr: 0.5, color: splitType === 'equal' ? '#94a3b8' : 'white', fontSize: '0.9rem', fontWeight: 600 }}>₹</Typography>
                                                            }}
                                                            sx={{
                                                                width: '80px',
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '0.95rem',
                                                                    fontWeight: 700,
                                                                    textAlign: 'right',
                                                                    color: splitType === 'equal' ? '#94a3b8' : 'white', // Grey out auto-calc
                                                                    p: 0.5
                                                                },
                                                                '& .MuiInputBase-input.Mui-disabled': {
                                                                    color: '#94a3b8 !important',
                                                                    WebkitTextFillColor: '#94a3b8 !important',
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            ) : (
                                                <Typography sx={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                                                    -
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Stack>

                        {/* Summary / Remaining */}
                        <Box sx={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            px: 1.5, py: 1,
                            mb: 2,
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}>
                            <Typography sx={{ fontWeight: 500, fontSize: '0.8rem', color: '#94a3b8' }}>
                                Selected: <span style={{ color: 'white' }}>{selectedMemberIds.length}</span> of {members.length}
                            </Typography>
                            {splitType === 'custom' && (
                                <Typography sx={{ fontWeight: 500, fontSize: '0.8rem', color: '#94a3b8' }}>
                                    Remaining: <span style={{
                                        color: (() => {
                                            const assigned = (watch('splits') || []).reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
                                            const total = parseFloat(amount || 0);
                                            const rem = Math.max(0, (total - assigned));
                                            return rem > 0.1 ? '#ef4444' : '#10b981'; // Red if not zero, Green if matches
                                        })(), fontWeight: 700
                                    }}>₹{
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

                        {/* Add Member Button - Triggers Popup */}
                        <Button
                            startIcon={<PersonAddIcon />}
                            onClick={onAddMemberClick}
                            sx={{
                                textTransform: 'none',
                                color: '#3b82f6', // Brighter blue for visibility
                                fontWeight: 600,
                                fontSize: '0.8rem', // Reduced size
                                justifyContent: 'flex-start',
                                pl: 1,
                                py: 0.5,
                                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.05)' }
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
                                py: 0.8,
                                borderRadius: '10px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#cbd5e1',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                '&:hover': { background: 'rgba(255, 255, 255, 0.1)' },
                                textTransform: 'none'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            disabled={loading}
                            onClick={handleSubmit(onSubmit)}
                            sx={{
                                py: 0.8,
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
                                    transform: 'translateY(-1px)'
                                },
                                '&:disabled': {
                                    background: '#1e293b',
                                    color: '#475569',
                                    boxShadow: 'none',
                                    cursor: 'not-allowed'
                                },
                                textTransform: 'none',
                                transition: 'all 0.2s ease',
                                fontSize: '0.85rem'
                            }}
                        >
                            {loading ? (initialExpense ? 'Updating...' : 'Adding...') : (initialExpense ? 'Update Expense' : 'Add Expense')}
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent >
        </StyledDialog >
    );
}
