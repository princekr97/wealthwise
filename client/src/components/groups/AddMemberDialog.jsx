import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    TextField,
    Button,
    Stack,
    IconButton,
    InputAdornment,
    Typography,
    Box,
    Fade,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    PersonAdd as PersonAddIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Badge as BadgeIcon,
    Delete as DeleteIcon,
    Group as GroupIcon,
    Contacts as ContactsIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '24px',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.85)' : '#FFFFFF',
        backdropFilter: 'blur(24px)',
        border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(71, 85, 105, 0.15)',
        boxShadow: theme.palette.mode === 'dark'
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        maxWidth: '440px',
        width: '100%',
        color: theme.palette.mode === 'dark' ? '#F8FAFC' : '#1E293B',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100% - 96px)'
    }
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    padding: '16px 20px',
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
    zIndex: 10,
    flexShrink: 0
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(226, 232, 240, 0.3)',
        border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(71, 85, 105, 0.15)',
        color: theme.palette.mode === 'dark' ? '#F1F5F9' : '#1E293B',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '0.95rem',
        paddingLeft: '8px',
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(226, 232, 240, 0.5)',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(71, 85, 105, 0.3)'
        },
        '&.Mui-focused': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.04)' : 'rgba(139, 92, 246, 0.02)',
            borderColor: '#8b5cf6',
            boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.12)'
        },
        '& fieldset': { border: 'none' },
        '& input': {
            color: theme.palette.mode === 'dark' ? '#F1F5F9' : '#1E293B',
            fontWeight: 500,
            padding: '12px 14px',
            '&::placeholder': { color: theme.palette.mode === 'dark' ? '#94A3B8' : '#64748B', opacity: 1 }
        }
    }
}));

export default function AddMemberDialog({ open, onClose, groupId, onMemberAdded, group, currentUser, onRemoveMember }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [activeTab, setActiveTab] = useState('add');
    const [pendingMembers, setPendingMembers] = useState([]);
    const [contactPickerSupported, setContactPickerSupported] = useState(false);
    const { control, handleSubmit, reset, formState: { isSubmitting }, setValue } = useForm({
        defaultValues: { name: '', email: '', phone: '' }
    });

    React.useEffect(() => {
        setContactPickerSupported('contacts' in navigator && 'ContactsManager' in window);
    }, []);

    React.useEffect(() => {
        if (!open) {
            setActiveTab('add');
            reset();
        }
    }, [open, reset]);

    const getAvatarColor = (name) => {
        if (!name) return '#666';
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return `hsl(${hash % 360}, 70%, 50%)`;
    };

    const handlePickContact = async () => {
        try {
            const props = ['name', 'tel'];
            const opts = { multiple: false };
            const contacts = await navigator.contacts.select(props, opts);

            if (contacts && contacts.length > 0) {
                const contact = contacts[0];
                if (contact.name && contact.name[0]) {
                    setValue('name', contact.name[0]);
                }
                if (contact.tel && contact.tel[0]) {
                    const phone = contact.tel[0].replace(/\D/g, '').slice(-10);
                    setValue('phone', phone);
                }
                toast.success('Contact imported!');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                toast.error('Failed to access contacts');
            }
        }
    };

    const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

    const onSubmit = (data) => {
        setPendingMembers(prev => [...prev, { ...data, tempId: Date.now() }]);
        toast.success(`${data.name} added to staging list`);
        reset();
    };

    const removePendingMember = (tempId) => {
        setPendingMembers(prev => prev.filter(m => m.tempId !== tempId));
    };

    const handleBulkSave = async () => {
        if (pendingMembers.length === 0) {
            onClose();
            return;
        }

        setIsSubmittingBulk(true);
        try {
            const membersPayload = pendingMembers.map(m => ({
                name: m.name,
                email: m.email,
                phone: m.phone
            }));
            await groupService.addMembersToGroupBulk(groupId, membersPayload);
            toast.success(`${pendingMembers.length} member(s) added successfully!`);
            setPendingMembers([]);
            if (onMemberAdded) await onMemberAdded();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add members');
        } finally {
            setIsSubmittingBulk(false);
        }
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 400 }}
            disableScrollLock={false}
            keepMounted={false}
            scroll="paper"
            sx={{
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)'
                }
            }}
        >
            <HeaderBox>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <PersonAddIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            color: isDark ? '#F1F5F9' : '#0F172A',
                            lineHeight: 1.2,
                            letterSpacing: '-0.5px'
                        }}>Manage Members</Typography>
                        <Typography variant="body2" sx={{
                            color: isDark ? '#94A3B8' : '#64748B',
                            fontSize: '0.75rem',
                            mt: 0.2,
                            fontWeight: 500
                        }}>Add or remove group members</Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        width: 32,
                        height: 32,
                        color: isDark ? '#64748B' : '#94A3B8',
                        flexShrink: 0,
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                        '&:hover': {
                            color: isDark ? '#F1F5F9' : '#000000',
                            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            transform: 'rotate(90deg)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </HeaderBox>

            <DialogContent sx={{
                p: 0,
                background: 'transparent',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                {/* Visual Glow */}
                <Box sx={{
                    position: 'absolute',
                    top: '10%',
                    right: '-5%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                {/* Tabs */}
                <Box sx={{ px: 3, pt: 3, pb: 1, position: 'relative', zIndex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '16px',
                        p: 0.75,
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Box
                            onClick={() => setActiveTab('add')}
                            sx={{
                                flex: 1,
                                px: 2,
                                py: 1.25,
                                cursor: 'pointer',
                                color: activeTab === 'add' ? 'white' : isDark ? '#94A3B8' : '#64748B',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                borderRadius: '12px',
                                backgroundColor: activeTab === 'add' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                                border: activeTab === 'add' ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                boxShadow: activeTab === 'add' ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none',
                                '&:hover': {
                                    color: activeTab === 'add' ? 'white' : isDark ? 'white' : '#000000',
                                    backgroundColor: activeTab === 'add' ? 'rgba(139, 92, 246, 0.2)' : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 92, 246, 0.08)'
                                }
                            }}
                        >
                            <PersonAddIcon sx={{ fontSize: 18 }} />
                            Add New
                        </Box>
                        <Box
                            onClick={() => setActiveTab('members')}
                            sx={{
                                flex: 1,
                                px: 2,
                                py: 1.25,
                                cursor: 'pointer',
                                color: activeTab === 'members' ? 'white' : isDark ? '#94A3B8' : '#64748B',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                borderRadius: '12px',
                                backgroundColor: activeTab === 'members' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                                border: activeTab === 'members' ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                boxShadow: activeTab === 'members' ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none',
                                '&:hover': {
                                    color: activeTab === 'members' ? 'white' : isDark ? 'white' : '#000000',
                                    backgroundColor: activeTab === 'members' ? 'rgba(139, 92, 246, 0.2)' : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 92, 246, 0.08)'
                                }
                            }}
                        >
                            <GroupIcon sx={{ fontSize: 18 }} />
                            Members
                            <Box sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: '6px',
                                background: activeTab === 'members' ? 'rgba(139, 92, 246, 0.3)' : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                lineHeight: 1
                            }}>{group?.members?.length || 0}</Box>
                        </Box>
                    </Stack>
                </Box>

                {/* Add Form */}
                {activeTab === 'add' && (
                    <Box sx={{ px: 3, pt: 2, pb: 4, flex: 1, minHeight: '350px', background: 'transparent', position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                            <Typography sx={{
                                color: isDark ? '#94A3B8' : '#64748B',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>New Member Details</Typography>
                            {contactPickerSupported && (
                                <Button
                                    onClick={handlePickContact}
                                    startIcon={<ContactsIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                        py: 0.75,
                                        px: 2,
                                        borderRadius: '10px',
                                        background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        color: '#60A5FA',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'rgba(59, 130, 246, 0.15)',
                                            borderColor: 'rgba(59, 130, 246, 0.4)',
                                            transform: 'translateY(-1px)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >Pick Contact</Button>
                            )}
                        </Box>
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography sx={{ color: isDark ? '#E2E8F0' : '#475569', fontSize: '0.85rem', fontWeight: 700, mb: 1.2, ml: 0.5 }}>Full Name</Typography>
                                <Controller name="name" control={control} rules={{ required: 'Name is required' }} render={({ field, fieldState: { error } }) => (<ModernTextField {...field} placeholder="e.g. Prince Gupta" fullWidth error={!!error} helperText={error?.message} InputProps={{ startAdornment: (<InputAdornment position="start"><BadgeIcon sx={{ color: '#8b5cf6', fontSize: 20, mr: 0.5 }} /></InputAdornment>) }} />)} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: isDark ? '#E2E8F0' : '#475569', fontSize: '0.85rem', fontWeight: 700, mb: 1.2, ml: 0.5 }}>Mobile Number</Typography>
                                <Controller name="phone" control={control} rules={{ required: 'Mobile number is required', pattern: { value: /^[0-9]{10}$/, message: 'Enter 10-digit mobile number' } }} render={({ field, fieldState: { error } }) => (<ModernTextField {...field} placeholder="e.g. 9988812345" fullWidth error={!!error} helperText={error?.message} InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIcon sx={{ color: '#8b5cf6', fontSize: 20, mr: 0.5 }} /></InputAdornment>) }} />)} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: isDark ? '#E2E8F0' : '#475569', fontSize: '0.85rem', fontWeight: 700, mb: 1.2, ml: 0.5 }}>Email Address <span style={{ color: isDark ? '#64748B' : '#94A3B8', fontWeight: 400, fontSize: '0.75rem' }}>(Optional)</span></Typography>
                                <Controller name="email" control={control} rules={{ pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email format' } }} render={({ field, fieldState: { error } }) => (<ModernTextField {...field} placeholder="e.g. prince@gmail.com" fullWidth error={!!error} helperText={error?.message} InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon sx={{ color: '#8b5cf6', fontSize: 20, mr: 0.5 }} /></InputAdornment>) }} />)} />
                            </Box>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                fullWidth
                                disabled={isSubmitting}
                                sx={{
                                    py: 1.1,
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    color: '#FFFFFF',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    textTransform: 'none',
                                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 12px 32px rgba(16, 185, 129, 0.3)'
                                    },
                                    '&:disabled': { background: 'rgba(16, 185, 129, 0.3)', color: 'rgba(255, 255, 255, 0.5)' },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >+ Add to List</Button>
                        </Stack>

                        {pendingMembers.length > 0 && (
                            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <Typography sx={{
                                    color: '#94A3B8',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    mb: 1.5,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>Pending Save ({pendingMembers.length})</Typography>
                                <Stack spacing={1.2}>
                                    {pendingMembers.map((member) => (
                                        <Box key={member.tempId} sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            px: 1.25,
                                            py: 0.85,
                                            borderRadius: '10px',
                                            background: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
                                            border: '1px solid rgba(16, 185, 129, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            animation: 'fadeIn 0.3s ease-out'
                                        }}>
                                            <Box sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '6px',
                                                background: getAvatarColor(member.name),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                overflow: 'hidden'
                                            }}>
                                                <img src={'https://api.dicebear.com/7.x/notionists/svg?seed=' + member.name} alt={member.name} style={{ width: '100%', height: '100%' }} />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography sx={{ color: isDark ? '#F1F5F9' : '#1E293B', fontWeight: 700, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</Typography>
                                                <Typography sx={{ color: '#64748B', fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{member.phone}</Typography>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => removePendingMember(member.tempId)}
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    color: '#EF4444',
                                                    opacity: 0.6,
                                                    flexShrink: 0,
                                                    '&:hover': { opacity: 1, background: 'rgba(239, 68, 68, 0.1)' }
                                                }}
                                            >
                                                <CloseIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                        <Box sx={{ height: 20 }} />
                    </Box>
                )}

                {/* Members List */}
                {activeTab === 'members' && (
                    <Box sx={{
                        flex: 1, minHeight: '350px', px: 3, py: 2, background: 'transparent', position: 'relative', zIndex: 1,
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }
                    }}>
                        {group?.members?.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                                <Box sx={{ mb: 2, opacity: 0.2 }}>
                                    <GroupIcon sx={{ fontSize: 64, color: '#94A3B8' }} />
                                </Box>
                                <Typography sx={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: 600 }}>No members found in this group</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.25}>
                                {[...group.members].sort((a, b) => {
                                    const isAUser = currentUser && (
                                        (a.userId?._id && String(a.userId._id) === String(currentUser._id)) ||
                                        (a.userId && String(a.userId) === String(currentUser._id)) ||
                                        (a.email && currentUser.email && a.email.toLowerCase() === currentUser.email.toLowerCase())
                                    );
                                    const isBUser = currentUser && (
                                        (b.userId?._id && String(b.userId._id) === String(currentUser._id)) ||
                                        (b.userId && String(b.userId) === String(currentUser._id)) ||
                                        (b.email && currentUser.email && b.email.toLowerCase() === currentUser.email.toLowerCase())
                                    );
                                    if (isAUser) return -1;
                                    if (isBUser) return 1;
                                    return a.name.localeCompare(b.name);
                                }).map((member, index) => {
                                    const isCurrentUser = currentUser && (
                                        (member.userId?._id && String(member.userId._id) === String(currentUser._id)) ||
                                        (member.userId && String(member.userId) === String(currentUser._id)) ||
                                        (member.email && currentUser.email && member.email.toLowerCase() === currentUser.email.toLowerCase())
                                    );

                                    return (
                                        <Box
                                            key={member._id || index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                px: 1.5,
                                                py: 1,
                                                borderRadius: '14px',
                                                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                                border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                                                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: isDark ? '0 4px 10px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.05)'
                                                }
                                            }}
                                        >
                                            {/* Accent Glow */}
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '4px',
                                                height: '100%',
                                                background: isCurrentUser ? 'linear-gradient(to bottom, #8b5cf6, #6366f1)' : 'transparent',
                                                opacity: 0.8
                                            }} />

                                            <Box
                                                sx={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: '8px',
                                                    background: getAvatarColor(member.name),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}
                                            >
                                                <img
                                                    src={'https://api.dicebear.com/7.x/notionists/svg?seed=' + member.name}
                                                    alt={member.name}
                                                    style={{ width: '100%', height: '100%' }}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.1 }}>
                                                    <Typography sx={{
                                                        color: isDark ? '#F1F5F9' : '#0F172A',
                                                        fontWeight: 800,
                                                        fontSize: '0.825rem',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        letterSpacing: '-0.3px'
                                                    }}>
                                                        {member.name}
                                                    </Typography>
                                                    {isCurrentUser && (
                                                        <Box sx={{
                                                            px: 0.5,
                                                            py: 0.1,
                                                            borderRadius: '3px',
                                                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2))',
                                                            border: '1px solid rgba(139, 92, 246, 0.4)',
                                                            fontSize: '0.55rem',
                                                            fontWeight: 800,
                                                            color: '#C4B5FD',
                                                            lineHeight: 1,
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            YOU
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Typography sx={{
                                                    color: isDark ? '#94A3B8' : '#64748B',
                                                    fontSize: '0.65rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    fontWeight: 500
                                                }}>
                                                    {member.phone || member.email || 'No contact info'}
                                                </Typography>
                                            </Box>
                                            {!isCurrentUser && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onRemoveMember(member.userId?._id || member.userId || member._id)}
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        color: '#EF4444',
                                                        opacity: 0.5,
                                                        flexShrink: 0,
                                                        borderRadius: '8px',
                                                        '&:hover': {
                                                            opacity: 1,
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            transform: 'scale(1.1)',
                                                            color: '#F87171'
                                                        },
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                        <Box sx={{ height: 20 }} /> {/* Bottom padding fix */}
                    </Box>
                )}
            </DialogContent>

            {/* Bulk Save Footer */}
            {activeTab === 'add' && pendingMembers.length > 0 && (
                <Box sx={{
                    px: 3,
                    py: 2,
                    borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
                    background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 20
                }}>
                    <Button
                        fullWidth
                        onClick={handleBulkSave}
                        disabled={isSubmittingBulk}
                        sx={{
                            py: 1.5,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: 'white',
                            fontWeight: 800,
                            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        {isSubmittingBulk ? 'Saving Members...' : `Save ${pendingMembers.length} Person(s) to Group`}
                    </Button>
                </Box>
            )}
        </StyledDialog>
    );
}
