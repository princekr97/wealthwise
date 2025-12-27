import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    InputAdornment,
    IconButton,
    CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset as ResetIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export function ResetPassword() {
    const navigate = useNavigate();
    const { token } = useParams();
    const resetPasswordAction = useAuthStore((state) => state.resetPassword);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(resetPasswordSchema)
    });

    const onSubmit = async (values) => {
        setLoading(true);
        // Pass the token from URL and the new password
        const res = await resetPasswordAction({ token, password: values.password });
        setLoading(false);

        if (res.success) {
            toast.success('Password updated successfully! Please login.');
            navigate('/login');
        } else {
            toast.error(res.message || 'Failed to reset password');
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <ResetIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.8 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Set New Password
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Please enter your new password below.
                </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                    <TextField
                        {...register('password')}
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiInputBase-root': {
                                color: '#fff',
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                            },
                        }}
                    />

                    <TextField
                        {...register('confirmPassword')}
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        sx={{
                            '& .MuiInputBase-root': {
                                color: '#fff',
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                            },
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        fullWidth
                        sx={{
                            mt: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                    </Button>

                    <Button
                        variant="text"
                        onClick={() => navigate('/login')}
                        fullWidth
                        sx={{
                            mt: 1,
                            textTransform: 'none',
                            color: 'text.secondary',
                            '&:hover': { color: '#fff' }
                        }}
                    >
                        Back to Login
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}
