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

// Premium Styled Dialog matching AddGroupExpenseDialog
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '24px',
        background: '#0f172a', // Deep Slate
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        maxWidth: '420px',
        width: '100%',
        color: 'white',
        overflow: 'hidden'
    }
}));

const HeaderBox = styled(Box)({
    padding: '24px',
    background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
});

const ModernTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '14px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#f8fafc',
        transition: 'all 0.2s',
        fontSize: '0.95rem',
        paddingLeft: '4px',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
        },
        '& fieldset': { border: 'none' },
        '& input::placeholder': { color: '#64748b' }
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
                <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
                        Add New Member
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                        Invite a friend to join this group
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: '#64748b',
                        '&:hover': { color: 'white', background: 'rgba(255,255,255,0.05)' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </HeaderBox>

            <DialogContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                    {/* Name Input */}
                    <Box>
                        <Typography sx={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500, mb: 1, ml: 1 }}>Name</Typography>
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
                                                <BadgeIcon sx={{ color: '#64748b', fontSize: 20 }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* Phone Input */}
                    <Box>
                        <Typography sx={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500, mb: 1, ml: 1 }}>Mobile Number</Typography>
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
                                                <PhoneIcon sx={{ color: '#64748b', fontSize: 20 }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* Email Input */}
                    <Box>
                        <Typography sx={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500, mb: 1, ml: 1 }}>Email Address <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional)</span></Typography>
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
                                                <EmailIcon sx={{ color: '#64748b', fontSize: 20 }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* Actions */}
                    <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                        <Button
                            onClick={onClose}
                            fullWidth
                            sx={{
                                py: 1.5,
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#e2e8f0',
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            fullWidth
                            disabled={isSubmitting}
                            sx={{
                                py: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)'
                                }
                            }}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Member'}
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </StyledDialog>
    );
}
