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
    Fade
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
        background: '#1E293B',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        maxWidth: '690px',
        width: '100%',
        color: 'white',
        overflow: 'hidden'
    }
}));

const HeaderBox = styled(Box)({
    padding: '16px 20px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
});

const ModernTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#F1F5F9',
        transition: 'all 0.2s',
        fontSize: '0.9rem',
        paddingLeft: '4px',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            borderColor: '#8b5cf6',
            boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.15)'
        },
        '& fieldset': { border: 'none' },
        '& input': {
            color: '#F1F5F9',
            '&::placeholder': { color: '#94A3B8', opacity: 1 }
        }
    }
});

export default function AddMemberDialog({ open, onClose, groupId, onMemberAdded, group, currentUser, onRemoveMember }) {
    const [activeTab, setActiveTab] = useState('add');
    const [pendingMembers, setPendingMembers] = useState([]);
    const [contactPickerSupported, setContactPickerSupported] = useState(false);
    const { control, handleSubmit, reset, formState: { isSubmitting }, setValue } = useForm({
        defaultValues: { name: '', email: '', phone: '' }
    });

    React.useEffect(() => {
        setContactPickerSupported('contacts' in navigator && 'ContactsManager' in window);
    }, []);

    // Strict scroll locking for mobile with scroll position preservation
    React.useEffect(() => {
        if (open) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }

        return () => {
            if (open) { // Cleanup if unmounting while open
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        };
    }, [open]);

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

    const handleDone = async () => {
        if (pendingMembers.length === 0) {
            onClose();
            return;
        }

        try {
            for (const member of pendingMembers) {
                await groupService.addMemberToGroup(groupId, { name: member.name, email: member.email, phone: member.phone });
            }
            toast.success(`${pendingMembers.length} member(s) added successfully!`);
            setPendingMembers([]);
            onMemberAdded();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add members');
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
            <HeaderBox>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', flexShrink: 0 }}>
                        <PersonAddIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem', color: '#F1F5F9', lineHeight: 1.3 }}>Add Member</Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.75rem', mt: 0.2 }}>Add people to split expenses</Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8', flexShrink: 0, '&:hover': { color: '#F1F5F9', background: 'rgba(255,255,255,0.08)' } }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </HeaderBox>

            <DialogContent sx={{ p: 0 }}>
                {/* Tabs */}
                <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', p: 0.5, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Box onClick={() => setActiveTab('add')} sx={{ flex: 1, px: 2, py: 1, cursor: 'pointer', color: activeTab === 'add' ? 'white' : 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.8rem', borderRadius: '10px', backgroundColor: activeTab === 'add' ? 'rgba(139, 92, 246, 0.15)' : 'transparent', border: activeTab === 'add' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, '&:hover': { color: 'white', backgroundColor: activeTab === 'add' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)' } }}>
                            <PersonAddIcon sx={{ fontSize: 16 }} />
                            Add New
                        </Box>
                        <Box onClick={() => setActiveTab('members')} sx={{ flex: 1, px: 2, py: 1, cursor: 'pointer', color: activeTab === 'members' ? 'white' : 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.8rem', borderRadius: '10px', backgroundColor: activeTab === 'members' ? 'rgba(139, 92, 246, 0.15)' : 'transparent', border: activeTab === 'members' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, '&:hover': { color: 'white', backgroundColor: activeTab === 'members' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)' } }}>
                            <GroupIcon sx={{ fontSize: 16 }} />
                            Members
                            <Box sx={{ px: 0.75, py: 0.15, borderRadius: '4px', background: activeTab === 'members' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)', fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>{group?.members?.length || 0}</Box>
                        </Box>
                    </Stack>
                </Box>

                {/* Add Form */}
                {activeTab === 'add' && (
                    <Box sx={{ px: 2.5, py: 2.5, minHeight: '400px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Details</Typography>
                            {contactPickerSupported && (
                                <Button onClick={handlePickContact} startIcon={<ContactsIcon sx={{ fontSize: 16 }} />} sx={{ py: 0.5, px: 1.5, borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#60A5FA', fontWeight: 600, fontSize: '0.7rem', textTransform: 'none', '&:hover': { background: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.4)' } }}>Pick Contact</Button>
                            )}
                        </Box>
                        <Stack spacing={1.75}>
                            <Box>
                                <Typography sx={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: 600, mb: 1, ml: 0.5 }}>Name</Typography>
                                <Controller name="name" control={control} rules={{ required: 'Name is required' }} render={({ field, fieldState: { error } }) => (<ModernTextField {...field} placeholder="e.g. Saurabh Gupta" fullWidth error={!!error} helperText={error?.message} InputProps={{ startAdornment: (<InputAdornment position="start"><BadgeIcon sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>) }} />)} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: 600, mb: 1, ml: 0.5 }}>Mobile Number</Typography>
                                <Controller name="phone" control={control} rules={{ required: 'Mobile number is required', pattern: { value: /^[0-9]{10}$/, message: 'Enter 10-digit mobile number' } }} render={({ field, fieldState: { error } }) => (<ModernTextField {...field} placeholder="e.g. 9876543210" fullWidth error={!!error} helperText={error?.message} InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIcon sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>) }} />)} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: 600, mb: 1, ml: 0.5 }}>Email Address <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span></Typography>
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
                                                <Typography sx={{ color: '#F1F5F9', fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</Typography>
                                                <Typography sx={{ color: '#64748B', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.phone}</Typography>
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
                    <Box sx={{ minHeight: '400px', maxHeight: '400px', overflowY: 'auto', px: 2.5, py: 2 }}>
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
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    background: 'rgba(255, 255, 255, 0.06)',
                                                    borderColor: 'rgba(255, 255, 255, 0.12)',
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
                                                    <Typography sx={{ color: '#F1F5F9', fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {member.name}
                                                    </Typography>
                                                    {isCurrentUser && (
                                                        <Box sx={{ px: 1, py: 0.25, borderRadius: '6px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)', fontSize: '0.65rem', fontWeight: 700, color: '#C4B5FD', lineHeight: 1 }}>
                                                            YOU
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Typography sx={{ color: '#64748B', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                    <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0, 0, 0, 0.2)' }}>
                        <Button onClick={handleDone} fullWidth disabled={isSubmitting} sx={{ py: 1.2, borderRadius: '12px', background: pendingMembers.length > 0 ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', boxShadow: pendingMembers.length > 0 ? '0 4px 12px rgba(139, 92, 246, 0.35)' : 'none', '&:hover': { background: pendingMembers.length > 0 ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.12)', transform: pendingMembers.length > 0 ? 'translateY(-1px)' : 'none', boxShadow: pendingMembers.length > 0 ? '0 6px 16px rgba(139, 92, 246, 0.45)' : 'none' }, '&:disabled': { background: 'rgba(139, 92, 246, 0.3)', color: 'rgba(255, 255, 255, 0.5)' } }}>
                            {isSubmitting ? 'Saving...' : pendingMembers.length > 0 ? `Done - Add ${pendingMembers.length} Member(s)` : 'Done'}
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </StyledDialog>
    );
}
