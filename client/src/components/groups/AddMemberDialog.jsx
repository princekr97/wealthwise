import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    IconButton,
    InputAdornment,
    Typography,
    Box
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

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '28px',
        padding: '8px',
        background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), var(--active-gradient)',
        backgroundAttachment: 'fixed',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        maxWidth: '400px',
        width: '100%',
        color: 'white'
    }
}));

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: 'white',
        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
        '& input::placeholder': { color: 'rgba(255, 255, 255, 0.4)', opacity: 1 }
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
        <StyledDialog open={open} onClose={onClose} maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, color: 'white' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '14px',
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        <PersonAddIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '0.5px' }}>Add Member</Typography>
                </Stack>
                <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255, 255, 255, 0.4)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6 }}>
                    Add a friend to split expenses with. If they use WealthWise, we'll link their account.
                </Typography>

                <Stack spacing={2.5}>
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Name is required' }}
                        render={({ field, fieldState: { error } }) => (
                            <StyledTextField
                                {...field}
                                fullWidth
                                placeholder="Name (e.g. John Doe)"
                                error={!!error}
                                helperText={error?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BadgeIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )}
                    />

                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <StyledTextField
                                {...field}
                                fullWidth
                                placeholder="Email (Optional)"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )}
                    />

                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <StyledTextField
                                {...field}
                                fullWidth
                                placeholder="Phone (Optional)"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 2, display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                <Button
                    onClick={onClose}
                    fullWidth
                    sx={{
                        py: 1.25,
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': { background: 'rgba(255, 255, 255, 0.1)', color: 'white' }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    variant="contained"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{
                        py: 1.25,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        '&:hover': {
                            boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                            transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    {isSubmitting ? 'Adding...' : 'Add Member'}
                </Button>
            </DialogActions>
        </StyledDialog>
    );
}
