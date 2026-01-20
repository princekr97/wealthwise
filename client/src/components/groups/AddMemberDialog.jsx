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
    Badge as BadgeIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { groupService } from '../../services/groupService';
import { styled } from '@mui/material/styles';

// Premium Styled Dialog
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '20px',
        background: '#1E293B',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        maxWidth: '440px',
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

export default function AddMemberDialog({ open, onClose, groupId, onMemberAdded }) {
    const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            phone: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            await groupService.addMemberToGroup(groupId, {
                name: data.name,
                email: data.email,
                phone: data.phone
            });
            toast.success(`${data.name} added to group!`);
            reset();
            onMemberAdded();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add member');
        }
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 400 }}
        >
            <HeaderBox>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '9px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        flexShrink: 0
                    }}>
                        <PersonAddIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem', color: '#F1F5F9', lineHeight: 1.3 }}>
                            Add New Member
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.75rem', mt: 0.2 }}>
                            Invite a friend to join this group
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: '#94A3B8',
                        flexShrink: 0,
                        '&:hover': { color: '#F1F5F9', background: 'rgba(255,255,255,0.08)' }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </HeaderBox>

            <DialogContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                    {/* Name Input */}
                    <Box>
                        <Typography sx={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: 600, mb: 1, ml: 0.5 }}>Name</Typography>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'Name is required' }}
                            render={({ field, fieldState: { error } }) => (
                                <ModernTextField
                                    {...field}
                                    placeholder="e.g. Saurabh Gupta"
                                    fullWidth
                                    error={!!error}
                                    helperText={error?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <BadgeIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* Phone Input */}
                    <Box>
                        <Typography sx={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: 600, mb: 1, ml: 0.5 }}>Mobile Number</Typography>
                        <Controller
                            name="phone"
                            control={control}
                            rules={{
                                required: 'Mobile number is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Enter 10-digit mobile number'
                                }
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <ModernTextField
                                    {...field}
                                    placeholder="e.g. 9876543210"
                                    fullWidth
                                    error={!!error}
                                    helperText={error?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* Email Input */}
                    <Box>
                        <Typography sx={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: 600, mb: 1, ml: 0.5 }}>Email Address <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span></Typography>
                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email format'
                                }
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <ModernTextField
                                    {...field}
                                    placeholder="e.g. saurabh@gmail.com"
                                    fullWidth
                                    error={!!error}
                                    helperText={error?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* Actions */}
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        fullWidth
                        disabled={isSubmitting}
                        sx={{
                            py: 1.2,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)',
                            mt: 2,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 16px rgba(139, 92, 246, 0.45)'
                            },
                            '&:disabled': {
                                background: 'rgba(139, 92, 246, 0.3)',
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        }}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Member'}
                    </Button>
                </Stack>
            </DialogContent>
        </StyledDialog>
    );
}
