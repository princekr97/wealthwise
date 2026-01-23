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
    Switch,
    CircularProgress,
    useTheme,
    useMediaQuery
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
        borderRadius: '16px',
        background: theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
        backgroundColor: theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'dark' ? '0 20px 60px rgba(0, 0, 0, 0.5)' : '0 20px 60px rgba(0, 0, 0, 0.1)',
        maxWidth: '690px',
        width: '100%',
        margin: 16
    }
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    background: theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
    padding: '1.25rem 1.5rem',
    paddingTop: 'calc(1.25rem + env(safe-area-inset-top))', // Handle Safe Area (Notch)
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0 // Prevent header from shrinking
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    width: '32px',
    height: '32px',
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    borderRadius: '50%',
    color: theme.palette.text.secondary,
    '&:hover': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        color: theme.palette.text.primary
    },
    '& svg': {
        fontSize: '1.1rem'
    }
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '14px',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)',
        '& fieldset': {
            border: 'none',
        },
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 1)',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)',
        },
        '&.Mui-focused': {
            backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
        },
    },
    '& .MuiInputBase-input': {
        padding: '12px 16px',
        fontSize: '0.95rem',
        color: theme.palette.text.primary,
        fontWeight: 600,
        height: '24px', // Force consistent height
        '&.Mui-disabled': {
            color: theme.palette.text.secondary,
            WebkitTextFillColor: theme.palette.text.secondary,
            opacity: 0.7
        }
    },
}));

const CustomSelect = styled(Select)(({ theme }) => ({
    borderRadius: '14px',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)',
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 1)',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)',
    },
    '&.Mui-focused': {
        backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
    },
    '& .MuiSelect-select': {
        padding: '12px 16px !important',
        fontSize: '0.95rem',
        fontWeight: 600,
        height: '24px !important', // Force consistent height
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: `${theme.palette.text.primary} !important`,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    '& .MuiSvgIcon-root': {
        color: `${theme.palette.text.secondary} !important`,
        fontSize: '1.2rem'
    }
}));

// Helper to get local date string YYYY-MM-DD
const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper for "Form Label" look
const FormLabel = styled(Typography)(({ theme }) => ({
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    paddingLeft: '4px'
}));

const ParticipantCard = styled(Box)(({ theme, selected }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem',
    background: selected
        ? (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.15)')
        : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)'),
    borderRadius: '14px',
    border: '1px solid',
    borderColor: selected
        ? (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.5)')
        : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)'),
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    '&:hover': {
        borderColor: selected
            ? (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.7)')
            : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)'),
        background: selected
            ? (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.2)')
            : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)'),
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

// Check if a member corresponds to the current logged-in user (by ID, phone, or email)
const isCurrentMember = (member, currentUser) => {
    if (!currentUser) return false;
    const memberId = String(getMemberId(member));
    const currentId = String(currentUser._id);

    // Check ID
    if (memberId === currentId) return true;

    // Check Phone
    const currentUserPhone = currentUser.phone || currentUser.phoneNumber;
    if (currentUserPhone) {
        const memberPhone = member.phone || member.userId?.phone;
        if (memberPhone && memberPhone === currentUserPhone) return true;
    }

    // Check Email
    if (currentUser.email) {
        const memberEmail = member.email || member.userId?.email;
        if (memberEmail && memberEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    }

    return false;
};

export default function AddGroupExpenseDialog({ open, onClose, group, currentUser, onAddMemberClick, initialExpense, onExpenseAdded }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [splitType, setSplitType] = useState('equal'); // 'equal' | 'custom'
    const [members, setMembers] = useState([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState([]); // Track selected members for split
    const [loading, setLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const isFirstLoad = React.useRef(true);

    const { control, handleSubmit, watch, setValue, reset, getValues } = useForm({
        defaultValues: {
            description: '',
            amount: '',
            category: '',
            paidBy: currentUser?._id || '',
            date: getTodayDateString(),
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
            setIsInitializing(true);
            if (initialExpense) {
                // Intelligently detect split type based on actual splits
                let detectedSplitType = 'equal';
                if (initialExpense.splits && initialExpense.splits.length > 0) {
                    const nonZeroSplits = initialExpense.splits.filter(s => s.amount > 0);
                    if (nonZeroSplits.length > 0) {
                        // Check if all non-zero splits have the same amount (within 0.02 tolerance for rounding)
                        const firstAmount = nonZeroSplits[0].amount;
                        const allEqual = nonZeroSplits.every(s => Math.abs(s.amount - firstAmount) <= 0.02);
                        detectedSplitType = allEqual ? 'equal' : 'custom';
                    }
                }
                setSplitType(detectedSplitType);

                const fullSplits = members.map(m => {
                    const mId = String(getMemberId(m));
                    const mName = m.name?.toLowerCase().trim();

                    // Match by ID or Name (for shadow members where user might be null in DB)
                    const existingSplit = initialExpense.splits?.find(s => {
                        // Try to extract user ID from split
                        let sId = null;
                        if (s.user) {
                            if (typeof s.user === 'object') {
                                // Check if _id exists and is not null
                                if (s.user._id && s.user._id !== null) {
                                    sId = String(s.user._id);
                                }
                                // If _id is null, we'll use name matching below
                            } else {
                                sId = String(s.user);
                            }
                        }

                        // Try ID match first
                        if (sId && sId !== "null" && sId !== "undefined" && sId !== "") {
                            if (sId === mId) return true;
                        }

                        // Fallback to name matching for shadow members
                        return s.userName?.toLowerCase().trim() === mName;
                    });

                    return {
                        user: mId,
                        userName: m.name,
                        amount: existingSplit ? existingSplit.amount : 0
                    };
                });

                // Extract paidBy ID properly

                let paidById = '';
                if (initialExpense.paidBy) {
                    if (typeof initialExpense.paidBy === 'object') {
                        // Check if _id exists and is not null
                        if (initialExpense.paidBy._id && initialExpense.paidBy._id !== null) {
                            paidById = String(initialExpense.paidBy._id);
                        } else if (initialExpense.paidBy.name) {
                            // Shadow member - find by name in members array
                            const matchingMember = members.find(m =>
                                m.name?.toLowerCase().trim() === initialExpense.paidBy.name?.toLowerCase().trim()
                            );
                            if (matchingMember) {
                                paidById = String(getMemberId(matchingMember));
                            }
                        }
                    } else {
                        paidById = String(initialExpense.paidBy);
                    }
                }


                reset({
                    description: initialExpense.description,
                    amount: initialExpense.amount,
                    category: initialExpense.category || '',
                    paidBy: paidById,
                    date: initialExpense.date ? new Date(initialExpense.date).toISOString().split('T')[0] : getTodayDateString(),
                    splits: fullSplits
                });

                // Set selected members from existing splits
                if (initialExpense.splits && members.length > 0) {

                    const selectedIds = initialExpense.splits
                        .filter(s => s.amount > 0)
                        .map(s => {

                            // Extract user ID from split
                            let userId = null;
                            if (s.user) {
                                if (typeof s.user === 'object') {
                                    // Check if _id exists and is not null
                                    if (s.user._id && s.user._id !== null) {
                                        userId = String(s.user._id);
                                    }
                                    // If _id is null, we'll fall through to name matching below
                                } else {
                                    userId = String(s.user);
                                }
                            }

                            // Validate the extracted ID
                            if (userId && userId !== 'null' && userId !== 'undefined' && userId !== '') {
                                return userId;
                            }

                            // Fallback to name matching for shadow members
                            if (s.userName) {
                                const matchingMember = members.find(m =>
                                    m.name?.toLowerCase().trim() === s.userName?.toLowerCase().trim()
                                );
                                if (matchingMember) {
                                    const matchedId = String(getMemberId(matchingMember));
                                    return matchedId;
                                }
                            }

                            return null;
                        })
                        .filter(Boolean);

                    setSelectedMemberIds(selectedIds);
                    prevSelectedRef.current = selectedIds;
                }

                // CRITICAL: We stay in 'First Load' mode for one turn to let state settle
                isFirstLoad.current = true;
            } else {
                setSplitType('equal');
                const allSelected = members.map(m => String(getMemberId(m)));
                setSelectedMemberIds(allSelected);
                prevSelectedRef.current = allSelected;

                // Find matching member ID for current user to ensure dropdown value match
                let defaultPayer = '';
                if (currentUser && members.length > 0) {

                    // Find member matching current user (checks ID, Phone, Email)
                    const matchingMember = members.find(m => isCurrentMember(m, currentUser));

                    if (matchingMember) {
                        defaultPayer = String(getMemberId(matchingMember));
                    }
                }

                reset({
                    description: '',
                    amount: '',
                    category: '',
                    paidBy: defaultPayer,
                    date: getTodayDateString(),
                    splits: []
                });

                // For NEW expenses, we're NOT in first load mode
                isFirstLoad.current = false;
            }
            setIsInitializing(false);
        } else {
            reset();
            setSplitType('equal');
            setSelectedMemberIds([]); // Reset selection on close
            isFirstLoad.current = true;
            setIsInitializing(false);
        }
    }, [open, initialExpense, reset, group, currentUser, members]);

    // Track previous selection to detect additions/removals
    const prevSelectedRef = React.useRef(selectedMemberIds);

    useEffect(() => {
        if (!amount || members.length === 0 || splitType === 'custom') return;

        // Skip auto-equalize on initial load for ANY existing expense (Edit mode).
        // This avoids race conditions between 'amount' (from reset) and 'selectedMemberIds' updates.
        if (initialExpense && isFirstLoad.current) {
            // Once we have both amount and members, we consider the next tick as 'ready'
            if (amount && selectedMemberIds.length > 0) {
                isFirstLoad.current = false;
            }
            return;
        }

        const totalAmount = parseFloat(amount);
        if (isNaN(totalAmount) || totalAmount <= 0) return;

        const activeMembers = selectedMemberIds.length;

        // If no one is selected, just zero out everyone
        if (activeMembers === 0) {
            const zeroSplits = members.map(m => ({
                user: getMemberId(m),
                userName: m.name,
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
                    user: getMemberId(member),
                    userName: member.name,
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
                user: getMemberId(member),
                userName: member.name,
                amount: splitAmount
            };
        });

        // Update internal form splits
        setValue('splits', newSplits, { shouldValidate: true });

    }, [amount, members, selectedMemberIds, setValue, splitType, initialExpense]);

    // Handle CUSTOM mode: When selection changes, redistribute remaining amount
    useEffect(() => {
        if (!amount || members.length === 0 || splitType !== 'custom') return;

        // Skip on initial load of existing expense to preserve saved values
        if (initialExpense && isFirstLoad.current) {
            // Once we have both amount and members, we consider the next tick as 'ready'
            if (amount && selectedMemberIds.length > 0) {
                isFirstLoad.current = false;
            }
            return;
        }

        const totalAmount = parseFloat(amount);
        if (isNaN(totalAmount) || totalAmount <= 0) return;

        const activeMembers = selectedMemberIds.length;

        if (activeMembers === 0) {
            // Zero out everyone if no one is selected
            const zeroSplits = members.map(m => ({
                user: getMemberId(m),
                userName: m.name,
                amount: 0
            }));
            setValue('splits', zeroSplits);
            return;
        }

        // Distribute the FULL amount among selected members
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
                    user: getMemberId(member),
                    userName: member.name,
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
                user: getMemberId(member),
                userName: member.name,
                amount: splitAmount
            };
        });

        setValue('splits', newSplits, { shouldValidate: true });
    }, [amount, members, selectedMemberIds, setValue, splitType, initialExpense]);



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

            // Re-calculate splits one last time to ensure we have the absolute latest data
            // This prevents race conditions where 'amount' was just typed and 'splits' haven't updated in useEffect yet.
            let finalSplits = [];

            if (splitType === 'equal') {
                const totalAmount = parseFloat(data.amount);
                const activeMembers = selectedMemberIds.length;

                if (activeMembers === 0) {
                    toast.error("Please select at least one person to split with.");
                    setLoading(false);
                    return;
                }

                const amountPerPerson = totalAmount / activeMembers;
                const roundedAmount = Math.floor(amountPerPerson * 100) / 100;
                const remainder = parseFloat((totalAmount - (roundedAmount * activeMembers)).toFixed(2));
                let remainderAdded = false;

                finalSplits = members.map((member) => {
                    const mId = String(getMemberId(member));
                    const isSelected = selectedMemberIds.includes(mId);
                    if (!isSelected) return { user: mId, userName: member.name, amount: 0, owed: 0 };

                    let splitAmount = roundedAmount;
                    if (!remainderAdded) {
                        splitAmount = parseFloat((roundedAmount + remainder).toFixed(2));
                        remainderAdded = true;
                    }
                    return { user: mId, userName: member.name, amount: splitAmount, owed: splitAmount };
                }).filter(s => s.amount > 0);
            } else {
                // Custom Splits - Use values from form 'data.splits'
                finalSplits = members.map((member, index) => {
                    const splitEntry = data.splits && data.splits[index];
                    const amount = splitEntry ? parseFloat(splitEntry.amount || 0) : 0;
                    return {
                        user: getMemberId(member),
                        userName: member.name,
                        amount: amount,
                        owed: amount
                    };
                }).filter(s => s.amount > 0);
            }

            // Final Validation
            const totalSplitValue = finalSplits.reduce((sum, s) => sum + s.amount, 0);
            const expenseAmount = Number(data.amount);

            if (Math.abs(totalSplitValue - expenseAmount) > 0.1) {
                if (finalSplits.length === 0) {
                    toast.error("Please select at least one person to split with.");
                } else {
                    toast.error(`Total split (₹${totalSplitValue.toFixed(2)}) doesn't match total (₹${expenseAmount.toFixed(2)})`);
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
                date: data.date,
                splits: finalSplits,
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

                if (onExpenseAdded) await onExpenseAdded();
                onClose();
            } catch (err) {
                console.error('Submission error:', err);
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
            fullScreen={isMobile}
            onClose={(event, reason) => {
                if (reason === 'escapeKeyDown') {
                    onClose();
                }
                // Ignore 'backdropClick' - prevents closing when clicking outside
            }}
            TransitionComponent={Fade}
            transitionDuration={300}
            disableScrollLock={false}
            disableEscapeKeyDown={false}
            keepMounted={false}
            scroll="paper"
            maxWidth="sm"
            fullWidth
            sx={{
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(4px)'
                },
                '& .MuiDialog-paper': {
                    borderRadius: isMobile ? 0 : '16px',
                    margin: isMobile ? 0 : { xs: 2, sm: 3 },
                    width: isMobile ? '100%' : undefined,
                    maxWidth: isMobile ? '100%' : '690px',
                    maxHeight: isMobile ? '100%' : { xs: '90vh', sm: '85vh' },
                    overflowY: 'auto',
                    paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : 0
                },
                '& .MuiDialog-container': {
                    overscrollBehavior: 'contain',
                    '&::-webkit-scrollbar': { display: 'none' }
                }
            }}
        >
            <HeaderBox sx={{
                backdropFilter: 'blur(24px)',

                background: 'linear-gradient(rgba(42, 51, 59, 0.8), rgba(5, 4, 57, 0.8)), var(--active-gradient)',
            }}>
                <Box >
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: theme.palette.text.primary, }}>
                        {initialExpense ? 'Edit Expense' : 'Add New Expense'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.3, color: theme.palette.text.secondary }}>
                        Enter details to split costs
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        color: theme.palette.text.secondary,
                        '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.1)', color: theme.palette.text.primary }
                    }}
                >
                    <CloseIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
            </HeaderBox>

            <DialogContent sx={{
                p: '14px !important',
                // bgcolor: '#1E293B',
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(24px)',

                maxHeight: { xs: '70vh', sm: '80vh' },
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                <Stack spacing={2.5}>
                    {/* Description */}
                    <Box>
                        <FormLabel>Description</FormLabel>
                        <Controller
                            name="description"
                            control={control}
                            rules={{ required: 'Description is required' }}
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
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <FormLabel>Amount</FormLabel>
                            <Controller
                                name="amount"
                                control={control}
                                rules={{
                                    required: 'Amount is required',
                                    min: { value: 0.01, message: 'Amount must be greater than 0' }
                                }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        placeholder="0.00"
                                        type="number"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: <Typography sx={{ mr: 1, color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.9rem' }}>₹</Typography>
                                        }}
                                    />
                                )}
                            />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <FormLabel>Category</FormLabel>
                            <Controller
                                name="category"
                                control={control}
                                rules={{ required: 'Category is required' }}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        fullWidth
                                        displayEmpty
                                        value={field.value || ''}
                                        renderValue={(selected) => {
                                            if (!selected) return <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>Select Category</Typography>;
                                            const categoryStyle = getCategoryStyle(selected);
                                            const Icon = CATEGORY_ICONS[selected] || CategoryIcon;
                                            return (
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ overflow: 'hidden' }}>
                                                    <Box
                                                        sx={{
                                                            width: 18, height: 18,
                                                            borderRadius: '6px',
                                                            bgcolor: `${categoryStyle.color}15`,
                                                            color: categoryStyle.color,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <Icon sx={{ fontSize: '0.9rem' }} />
                                                    </Box>
                                                    <Typography noWrap sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                                        {selected}
                                                    </Typography>
                                                </Stack>
                                            );
                                        }}
                                        sx={{ '& .MuiSvgIcon-root': { color: theme.palette.text.secondary } }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#FFFFFF',
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: '12px',
                                                    boxShadow: theme.palette.mode === 'dark' ? '0 20px 25px -5px rgba(0, 0, 0, 0.4)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                    mt: 1,
                                                    '& .MuiMenuItem-root': {
                                                        color: theme.palette.text.primary,
                                                        fontSize: '0.9rem',
                                                        p: '10px 16px',
                                                        gap: '12px',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            bgcolor: theme.palette.action.hover,
                                                            color: theme.palette.text.primary
                                                        },
                                                        '&.Mui-selected': {
                                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.12) !important' : 'rgba(59, 130, 246, 0.08) !important',
                                                            color: '#3b82f6',
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

                    {/* Paid By & Date Row */}
                    <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <FormLabel>Who Paid?</FormLabel>
                            <Controller
                                name="paidBy"
                                control={control}
                                rules={{ required: 'Please select who paid' }}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        fullWidth
                                        displayEmpty
                                        value={field.value || ''}
                                        renderValue={(selected) => {
                                            if (!selected) return <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>Select Member</Typography>;
                                            const member = members.find(m => String(getMemberId(m)) === String(selected));
                                            if (!member) return selected;

                                            // Check if this member is the current user
                                            const isMe = isCurrentMember(member, currentUser);
                                            return (
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ overflow: 'hidden' }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 20, height: 20,
                                                            bgcolor: getAvatarConfig(member.name, member.avatarUrl).bgcolor,
                                                            fontSize: '0.7rem'
                                                        }}
                                                        src={getAvatarConfig(member.name, member.avatarUrl).src}
                                                    />
                                                    <Typography noWrap sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                                        {isMe ? 'You' : member.name}
                                                    </Typography>
                                                </Stack>
                                            );
                                        }}
                                        sx={{ '& .MuiSvgIcon-root': { color: theme.palette.text.secondary } }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#FFFFFF',
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: '12px',
                                                    boxShadow: theme.palette.mode === 'dark' ? '0 20px 25px -5px rgba(0, 0, 0, 0.4)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                    mt: 1,
                                                    '& .MuiMenuItem-root': {
                                                        color: theme.palette.text.primary,
                                                        fontSize: '0.9rem',
                                                        p: '10px 16px',
                                                        gap: '12px',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            bgcolor: theme.palette.action.hover,
                                                            color: theme.palette.text.primary
                                                        },
                                                        '&.Mui-selected': {
                                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.12) !important' : 'rgba(59, 130, 246, 0.08) !important',
                                                            color: '#3b82f6',
                                                            fontWeight: 600
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: '0.85rem', color: '#64748b !important' }}>Select Member</MenuItem>
                                        {members.map(member => {
                                            const isMe = isCurrentMember(member, currentUser);
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

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <FormLabel>Date</FormLabel>
                            <Controller
                                name="date"
                                control={control}
                                rules={{ required: 'Date is required' }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        type="date"
                                        fullWidth
                                        sx={{
                                            '& input::-webkit-calendar-picker-indicator': {
                                                filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                                                cursor: 'pointer'
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Box>
                    </Stack>

                    {/* Divider */}
                    <Box sx={{ height: '1px', background: theme.palette.divider, my: 1 }} />

                    {/* Split Section */}
                    <Box>
                        {/* Split Type Tabs - Compact Slider */}
                        <Box sx={{ mb: 2 }}>
                            <FormLabel sx={{ fontSize: '0.75rem', mb: 0.5 }}>Split Method</FormLabel>
                            <Box sx={{
                                background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                borderRadius: '12px',
                                p: 0.4,
                                display: 'flex',
                                width: '100%',
                                position: 'relative'
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
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            py: 0.7,
                                            minHeight: 0,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            color: splitType === type ? 'white' : theme.palette.text.secondary,
                                            background: splitType === type ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
                                            boxShadow: splitType === type ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                                            '&:hover': {
                                                background: splitType === type ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
                                            }
                                        }}
                                    >
                                        {type === 'equal' ? 'Equally' : 'Unequally'}
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        <Typography sx={{ fontSize: '0.8rem', color: theme.palette.text.secondary, mb: 1.5, display: 'block' }}>
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
                                            borderColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : theme.palette.divider,
                                            cursor: splitType === 'equal' ? 'default' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: (splitType !== 'equal' && isSelected) ? 'rgba(59, 130, 246, 0.12)' : (splitType !== 'equal' ? theme.palette.action.hover : 'transparent')
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
                                                        background: isSelected ? '#3b82f6' : 'transparent',
                                                        border: isSelected ? 'none' : `2px solid ${theme.palette.divider}`,
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
                                                color: isSelected ? theme.palette.text.primary : theme.palette.text.secondary,
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
                                                                startAdornment: <Typography sx={{ mr: 0.5, color: splitType === 'equal' ? theme.palette.text.secondary : theme.palette.text.primary, fontSize: '0.9rem', fontWeight: 600 }}>₹</Typography>
                                                            }}
                                                            sx={{
                                                                width: '80px',
                                                                '& .MuiInputBase-input': {
                                                                    fontSize: '0.95rem',
                                                                    fontWeight: 700,
                                                                    textAlign: 'right',
                                                                    color: splitType === 'equal' ? theme.palette.text.secondary : theme.palette.text.primary, // Grey out auto-calc
                                                                    p: 0.5
                                                                },
                                                                '& .MuiInputBase-input.Mui-disabled': {
                                                                    color: `${theme.palette.text.secondary} !important`,
                                                                    WebkitTextFillColor: `${theme.palette.text.secondary} !important`,
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
                            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            border: `1px dashed ${theme.palette.divider}`
                        }}>
                            <Typography sx={{ fontWeight: 500, fontSize: '0.8rem', color: theme.palette.text.secondary }}>
                                Selected: <span style={{ color: theme.palette.text.primary }}>{selectedMemberIds.length}</span> of {members.length}
                            </Typography>
                            {splitType === 'custom' && (
                                <Typography sx={{ fontWeight: 500, fontSize: '0.8rem', color: theme.palette.text.secondary }}>
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
                        {/* <Button
                            fullWidth
                            onClick={onClose}
                            sx={{
                                py: 1,
                                borderRadius: '10px',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                color: theme.palette.text.secondary,
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                textTransform: 'none',
                                '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
                            }}
                        >
                            Cancel
                        </Button> */}
                        <Button
                            fullWidth
                            disabled={loading}
                            onClick={handleSubmit(onSubmit, (errors) => {
                                console.error('Form Validation Errors:', errors);
                                const firstError = Object.values(errors)[0];
                                if (firstError?.message) toast.error(firstError.message);
                            })}
                            sx={{
                                py: 1.25,
                                borderRadius: '12px',
                                background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                textTransform: 'none',
                                boxShadow: loading ? 'none' : '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    boxShadow: loading ? 'none' : '0 15px 25px -5px rgba(37, 99, 235, 0.5)',
                                    transform: loading ? 'none' : 'translateY(-2px)'
                                },
                                '&:active': {
                                    transform: 'translateY(1px)'
                                },
                                '& .MuiCircularProgress-root': {
                                    color: 'white'
                                }
                            }}
                        >
                            {loading ? (
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <CircularProgress size={18} />
                                    <span>{initialExpense ? 'Saving Changes...' : 'Adding Expense...'}</span>
                                </Stack>
                            ) : (
                                <span>{initialExpense ? 'Update Expense' : 'Confirm Expense'}</span>
                            )}
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent >
        </StyledDialog >
    );
}
