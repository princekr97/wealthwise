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
        borderRadius: '20px',
        backgroundColor: theme.palette.mode === 'dark' ? '#1E293B' : '#F8FAFC',
        border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(71, 85, 105, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        maxWidth: '690px',
        width: '100%',
        color: theme.palette.mode === 'dark' ? 'white' : '#1E293B',
        overflow: 'hidden'
    }
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    padding: '16px 20px',
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(226, 232, 240, 0.5)',
        border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(71, 85, 105, 0.2)',
        color: theme.palette.mode === 'dark' ? '#F1F5F9' : '#1E293B',
        transition: 'all 0.2s',
        fontSize: '0.9rem',
        paddingLeft: '4px',
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.7)',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(71, 85, 105, 0.3)'
        },
        '&.Mui-focused': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)',
            borderColor: '#8b5cf6',
            boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.15)'
        },
        '& fieldset': { border: 'none' },
        '& input': {
            color: theme.palette.mode === 'dark' ? '#F1F5F9' : '#1E293B',
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
            setPendingMembers([]);
            setActiveTab('add');
            setIsDone(false);
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

    const onSubmit = async (data) => {
        setPendingMembers(prev => [...prev, { ...data, tempId: Date.now() }]);
        toast.success(`${data.name} added to list`);
        reset();
    };

    const removePendingMember = (tempId) => {
        setPendingMembers(prev => prev.filter(m => m.tempId !== tempId));
    };

    const [isDone, setIsDone] = useState(false);

    const handleDone = async () => {
        if (pendingMembers.length === 0) {
            onClose();
            return;
        }

        setIsDone(true);
        try {
            for (const member of pendingMembers) {
                await groupService.addMemberToGroup(groupId, { name: member.name, email: member.email, phone: member.phone });
            }
            toast.success(`${pendingMembers.length} member(s) added successfully!`);
            setPendingMembers([]);
            onClose();
            await onMemberAdded();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add members');
            setIsDone(false);
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
            scroll="body"
            sx={{
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)'
                }
            }}
        >
            <HeaderBox sx={{
                padding: '16px 20px',
                background: isDark
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(71, 85, 105, 0.15)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', flexShrink: 0 }}>
                        <PersonAddIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem', color: isDark ? '#F1F5F9' : '#000000', lineHeight: 1.3 }}>Add Member</Typography>
                        <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#374151', fontSize: '0.75rem', mt: 0.2 }}>Add people to split expenses</Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: isDark ? '#94A3B8' : '#374151', flexShrink: 0, '&:hover': { color: isDark ? '#F1F5F9' : '#000000', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </HeaderBox>

            <DialogContent sx={{ p: 0, background: theme.palette.mode === 'dark' ? '#1E293B' : '#F8FAFC' }}>
                {/* Tabs */}
                <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, background: theme.palette.mode === 'dark' ? '#1E293B' : '#F8FAFC' }}>
                    <Stack direction="row" spacing={1} sx={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', borderRadius: '12px', p: 0.5, border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <Box onClick={() => setActiveTab('add')} sx={{ flex: 1, px: 2, py: 1, cursor: 'pointer', color: activeTab === 'add' ? 'white' : isDark ? 'rgba(255,255,255,0.6)' : '#374151', fontWeight: 600, fontSize: '0.8rem', borderRadius: '10px', backgroundColor: activeTab === 'add' ? 'rgba(139, 92, 246, 0.15)' : 'transparent', border: activeTab === 'add' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, '&:hover': { color: activeTab === 'add' ? 'white' : isDark ? 'white' : '#000000', backgroundColor: activeTab === 'add' ? 'rgba(139, 92, 246, 0.2)' : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 92, 246, 0.08)' } }}>
                            <PersonAddIcon sx={{ fontSize: 16 }} />
                            Add New
                        </Box>
                        <Box onClick={() => setActiveTab('members')} sx={{ flex: 1, px: 2, py: 1, cursor: 'pointer', color: activeTab === 'members' ? 'white' : isDark ? 'rgba(255,255,255,0.6)' : '#374151', fontWeight: 600, fontSize: '0.8rem', borderRadius: '10px', backgroundColor: activeTab === 'members' ? 'rgba(139, 92, 246, 0.15)' : 'transparent', border: activeTab === 'members' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, '&:hover': { color: activeTab === 'members' ? 'white' : isDark ? 'white' : '#000000', backgroundColor: activeTab === 'members' ? 'rgba(139, 92, 246, 0.2)' : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(139, 92, 246, 0.08)' } }}>
                            <GroupIcon sx={{ fontSize: 16 }} />
                            Members
                            <Box sx={{ px: 0.75, py: 0.15, borderRadius: '4px', background: activeTab === 'members' ? 'rgba(139, 92, 246, 0.3)' : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>{group?.members?.length || 0}</Box>
                        </Box>
                    </Stack>
                </Box>

                {/* Add Form */}
                {activeTab === 'add' && (
                    <Box sx={{ px: 2.5, py: 2.5, minHeight: '400px', background: theme.palette.mode === 'dark' ? '#1E293B' : '#F8FAFC' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ color: isDark ? '#94A3B8' : '#374151', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Details</Typography>
                            {contactPickerSupported && (
                                <Button onClick={handlePickContact} startIcon={<ContactsIcon sx={{ fontSize: 16 }} />} sx={{ py: 0.5, px: 1.5, borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#60A5FA', fontWeight: 600, fontSize: '0.7rem', textTransform: 'none', '&:hover': { background: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.4)' } }}>Pick Contact</Button>
                            )}
                        </Box>
                        <Stack spacing={1.75}>
                            <Box>
                                <Typography sx={{ color: isDark ? '#E2E8F0' : '#000000', fontSize: '0.85rem', fontWeight: 600, mb: 1, ml: 0.5 }}>Name</Typography>
                                <Controller name="name" control={control} rules={{ required: 'Name is required' }} render={({ field, fieldState: { error } }) => (<ModernTextField {...field} placeholder="e.g. Saurabh Gupta" fullWidth error={!!error} helperText={error?.message} InputProps={{ startAdornment: (<InputAdornment position="start"><BadgeIcon sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>) }} />)} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: isDark ? '#E2E8F0' : '#000000', fontSize: '0.85rem', fontWeight: 600, mb: 1, ml: 0.5 }}>Mobile Number</Typography>
                                <Controller name="phone" control={control} rules={{ required: 'Mobile number is required', pattern: { value: /^[0-9]{10}$/, message: 'Enter 10-digit mobile number' } }} render={({ field, fieldState: { error } }) => (<ModernTextField {...field} placeholder="e.g. 9876543210" fullWidth error={!!error} helperText={error?.message} InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIcon sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>) }} />)} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: isDark ? '#E2E8F0' : '#000000', fontSize: '0.85rem', fontWeight: 600, mb: 1, ml: 0.5 }}>Email Address <span style={{ color: isDark ? '#94A3B8' : '#374151', fontWeight: 400 }}>(Optional)</span></Typography>
                                <Controller name="email" control={control} rules={{ pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email format' } }} render={({ field, fieldState: { error } }) => (<ModernTextField {...field} placeholder="e.g. saurabh@gmail.com" fullWidth error={!!error} helperText={error?.message} InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>) }} />)} />
                            </Box>
                            <Button onClick={handleSubmit(onSubmit)} fullWidth disabled={isSubmitting} sx={{ py: 1.2, borderRadius: '12px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)', '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(16, 185, 129, 0.45)' }, '&:disabled': { background: 'rgba(16, 185, 129, 0.3)', color: 'rgba(255, 255, 255, 0.5)' } }}>+ Add to List</Button>
                        </Stack>

                        {pendingMembers.length > 0 && (
                            <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ready to Add ({pendingMembers.length})</Typography>
                                <Stack spacing={1}>
                                    {pendingMembers.map((member) => (
                                        <Box key={member.tempId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: getAvatarColor(member.name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                                <img src={'https://api.dicebear.com/7.x/notionists/svg?seed=' + member.name} alt={member.name} style={{ width: '100%', height: '100%' }} />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography sx={{ color: isDark ? '#F1F5F9' : '#000000', fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</Typography>
                                                <Typography sx={{ color: isDark ? '#64748B' : '#374151', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.phone}</Typography>
                                            </Box>
                                            <IconButton size="small" onClick={() => removePendingMember(member.tempId)} sx={{ width: 28, height: 28, color: '#EF4444', opacity: 0.7, flexShrink: 0, '&:hover': { opacity: 1, background: 'rgba(239, 68, 68, 0.1)' } }}>
                                                <CloseIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Members List */}
                {activeTab === 'members' && (
                    <Box sx={{ minHeight: '400px', maxHeight: '400px', overflowY: 'auto', px: 2.5, py: 2, background: theme.palette.mode === 'dark' ? '#1E293B' : '#F8FAFC' }}>
                        {group?.members?.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
                                <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>No members yet</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.25}>
                                {group?.members?.map((member, index) => {
                                    const isCurrentUser = currentUser && (
                                        (member.userId?._id && String(member.userId._id) === String(currentUser._id)) ||
                                        (member.email && currentUser.email && member.email.toLowerCase() === currentUser.email.toLowerCase())
                                    );

                                    return (
                                        <Box
                                            key={member._id || index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: '12px',
                                                background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(226, 232, 240, 0.6)',
                                                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(71, 85, 105, 0.2)',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(226, 232, 240, 0.8)',
                                                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(71, 85, 105, 0.3)',
                                                    transform: 'translateX(4px)'
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: '10px',
                                                    background: getAvatarColor(member.name),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                }}
                                            >
                                                <img
                                                    src={'https://api.dicebear.com/7.x/notionists/svg?seed=' + member.name}
                                                    alt={member.name}
                                                    style={{ width: '100%', height: '100%' }}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography sx={{ color: isDark ? '#F1F5F9' : '#1E293B', fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {member.name}
                                                    </Typography>
                                                    {isCurrentUser && (
                                                        <Box sx={{ px: 1, py: 0.25, borderRadius: '6px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)', fontSize: '0.65rem', fontWeight: 700, color: '#C4B5FD', lineHeight: 1 }}>
                                                            YOU
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Typography sx={{ color: isDark ? '#64748B' : '#64748B', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {member.phone || member.email || 'No contact info'}
                                                </Typography>
                                            </Box>
                                            {!isCurrentUser && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onRemoveMember(member.userId?._id || member.userId || member._id)}
                                                    sx={{ width: 36, height: 36, color: '#EF4444', opacity: 0.7, flexShrink: 0, '&:hover': { opacity: 1, background: 'rgba(239, 68, 68, 0.15)', transform: 'scale(1.1)' } }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                )}

                {activeTab === 'add' && (
                    <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(226, 232, 240, 0.3)' }}>
                        <Button onClick={handleDone} fullWidth disabled={isSubmitting || isDone} sx={{ py: 1.2, borderRadius: '12px', background: pendingMembers.length > 0 ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', boxShadow: pendingMembers.length > 0 ? '0 4px 12px rgba(139, 92, 246, 0.35)' : 'none', '&:hover': { background: pendingMembers.length > 0 ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.12)', transform: pendingMembers.length > 0 ? 'translateY(-1px)' : 'none', boxShadow: pendingMembers.length > 0 ? '0 6px 16px rgba(139, 92, 246, 0.45)' : 'none' }, '&:disabled': { background: 'rgba(139, 92, 246, 0.3)', color: 'rgba(255, 255, 255, 0.5)' } }}>
                            {isDone ? 'Saving...' : isSubmitting ? 'Saving...' : pendingMembers.length > 0 ? `Done - Add ${pendingMembers.length} Member(s)` : 'Done'}
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </StyledDialog>
    );
}
