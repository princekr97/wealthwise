import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    CircularProgress,
} from '@mui/material';
import {
    Lock,
    ShieldCheck,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
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
        <div className="w-full">
            <div className="p-8">
                <div className="mb-8 text-center">
                    <div className="inline-flex p-3 bg-purple-500/20 rounded-2xl mb-4">
                        <Lock className="text-purple-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
                    <p className="text-slate-400 text-sm">Please enter your new password below to regain access.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Password Field */}
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">New Password</label>
                        <div className="relative group">
                            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-purple-400'}`} size={20} />
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 transition-all ${errors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-purple-500/50'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1.5 text-xs text-rose-500 items-center flex gap-1"><span className="w-1 h-1 rounded-full bg-rose-500" /> {errors.password.message}</p>}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Confirm New Password</label>
                        <div className="relative group">
                            <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.confirmPassword ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-purple-400'}`} size={20} />
                            <input
                                {...register('confirmPassword')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 transition-all ${errors.confirmPassword ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-purple-500/50'}`}
                            />
                        </div>
                        {errors.confirmPassword && <p className="mt-1.5 text-xs text-rose-500 items-center flex gap-1"><span className="w-1 h-1 rounded-full bg-rose-500" /> {errors.confirmPassword.message}</p>}
                    </div>

                    <div className="space-y-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-purple-600 text-white font-bold py-4 rounded-2xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <CircularProgress size={20} color="inherit" />
                                    <span>Updating...</span>
                                </Box>
                            ) : (
                                <>
                                    <span>Update Password</span>
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 py-3 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            <ArrowLeft size={16} /> Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
