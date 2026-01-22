import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
  Smartphone,
  X,
  Shield,
  Check
} from 'lucide-react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import { loginSchema } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const authStore = useAuthStore();
  const forgotPasswordAction = authStore.forgotPassword;

  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'phone'
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  const onSubmit = async (values) => {
    const res = await login(values);
    if (res.success) {
      toast.success('Welcome Back!');
      const redirectTo = location.state?.from?.pathname || '/app/dashboard';
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(res.message || 'Unable to login');
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setResetLoading(true);
    const res = await forgotPasswordAction(resetEmail);
    setResetLoading(false);
    if (res.success) {
      toast.success(res.message);
      // Development Helper: Auto-redirect to reset password screen
      if (res.debugLink) {
        const token = res.debugLink.split('/').pop();
        setForgotPasswordOpen(false);
        setResetEmail('');
        navigate(`/reset-password/${token}`);
      } else {
        setForgotPasswordOpen(false);
        setResetEmail('');
      }
    } else {
      toast.error(res.message || 'Error sending reset link');
    }
  };

  return (
    <div className="w-full">
      {/* Tab Switcher - Page Level */}
      <div className="flex p-2 bg-white/5 border-b border-white/5">
        <button
          className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-emerald-500 to-purple-600 text-white shadow-lg"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-slate-400 hover:text-white"
        >
          Sign Up
        </button>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <LogIn className="text-purple-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          </div>
          <p className="text-slate-400 text-sm">Access your financial dashboard securely</p>
        </div>

        {/* Login Mode Toggle - Inner Form */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mb-6">
          <button
            onClick={() => setLoginMode('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${loginMode === 'email' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <Mail size={16} /> Email
          </button>
          <div className="flex-1 relative">
            <button
              onClick={() => toast.info('Phone login coming soon! 🚀')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
            >
              <Smartphone size={16} /> Phone
            </button>
            <span className="absolute -top-2 -right-1 bg-amber-500/90 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full shadow-lg">SOON</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Identifier Field */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Email or Phone</label>
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.identifier ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-purple-400'}`} size={20} />
              <input
                {...register('identifier')}
                type="text"
                placeholder="you@example.com"
                className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 transition-all ${errors.identifier ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-purple-500/50'}`}
              />
            </div>
            {errors.identifier && <p className="mt-1.5 text-xs text-rose-500 items-center flex gap-1"><span className="w-1 h-1 rounded-full bg-rose-500" /> {errors.identifier.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-slate-300 text-sm font-medium">Password</label>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
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

          {/* Remember Me */}
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-5 h-5 border border-white/20 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500/50">
                <Check size={14} className="text-emerald-400 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="ml-3 text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Remember this device</span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-purple-600 text-white font-bold py-4 rounded-2xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Authenticating...</span>
              </Box>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-transparent text-slate-500 font-medium">or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => toast.info('Google login will be added in future enhancements! 🚀')}
              className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => toast.info('GitHub login will be added in future enhancements! 🚀')}
              className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-400" size={20} />
            Reset Password
          </div>
          <IconButton onClick={() => setForgotPasswordOpen(false)} sx={{ color: 'slate.400' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 3 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          <div className="relative group">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="email"
              placeholder="you@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleForgotPassword}
            disabled={resetLoading}
            fullWidth
            sx={{
              background: 'linear-gradient(to right, #10b981, #3b82f6)',
              color: 'white',
              fontWeight: 700,
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': { opacity: 0.9 },
              '&:disabled': { opacity: 0.5 }
            }}
          >
            {resetLoading ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}