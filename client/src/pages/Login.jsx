/**
 * Login Page
 *
 * Uses MUI components for consistency with the rest of the app.
 * Mobile-first responsive design.
 */

import React, { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Stack,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Close as CloseIcon,
  Email as EmailIcon,
  PhoneIphone as PhoneIcon,
  VpnKey as OtpIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const authStore = useAuthStore();
  const forgotPasswordAction = authStore.forgotPassword;
  const sendOTPAction = authStore.sendOTP;
  const verifyOTPAction = authStore.verifyOTP;

  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'phone'
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Phone Login State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

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

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    setOtpLoading(true);
    const res = await sendOTPAction(phoneNumber);
    setOtpLoading(false);
    if (res.success) {
      setOtpSent(true);
      toast.success(res.message || 'OTP sent successfully!');

      // Development Helper: Show OTP in toast if available

      // Development Helper: Show OTP in toast if available
      // if (res.debugOtp) {
      //   toast.info(`DEV OTP: ${res.debugOtp}`, { duration: 3000 });
      // }
    } else {
      toast.error(res.message);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setOtpLoading(true);
    const res = await verifyOTPAction({ phoneNumber, otp });
    setOtpLoading(false);
    if (res.success) {
      toast.success('Welcome Back!');
      const redirectTo = location.state?.from?.pathname || '/app/dashboard';
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(res.message);
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
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <LoginIcon sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 22 } }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: '#F1F5F9'
            }}
          >
            Welcome Back
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ 
            display: 'block', 
            mb: 2,
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            color: '#94A3B8'
          }}
        >
          {loginMode === 'email'
            ? 'Access your financial dashboard'
            : 'Login securely via phone'}
        </Typography>
      </Box>

      {/* Login Mode Toggle - Modern Pill Style */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        mb: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        p: 0.5,
        borderRadius: 2.5,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)'
      }}>
        <Button
          size="small"
          onClick={() => setLoginMode('email')}
          startIcon={<EmailIcon sx={{ fontSize: 16 }} />}
          sx={{
            flex: 1,
            textTransform: 'none',
            borderRadius: 2,
            fontSize: '0.85rem',
            py: 1,
            fontWeight: 600,
            background: loginMode === 'email' 
              ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
              : 'transparent',
            color: loginMode === 'email' ? '#fff' : '#94A3B8',
            boxShadow: loginMode === 'email' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: loginMode === 'email' 
                ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              transform: 'translateY(-1px)',
            }
          }}
        >
          Email
        </Button>
        <Box sx={{ flex: 1, position: 'relative' }}>
          <Button
            size="small"
            onClick={() => toast.info('OTP Login coming soon! 🚀')}
            startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
            sx={{
              width: '100%',
              textTransform: 'none',
              borderRadius: 2,
              fontSize: '0.85rem',
              py: 1,
              fontWeight: 600,
              background: 'transparent',
              color: '#64748B',
              cursor: 'not-allowed',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }
            }}
          >
            OTP
          </Button>
          <Box
            sx={{
              position: 'absolute',
              top: -6,
              right: 8,
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#fff',
              fontSize: '0.55rem',
              fontWeight: 700,
              px: 0.7,
              py: 0.25,
              borderRadius: 0.75,
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
              letterSpacing: '0.5px',
              pointerEvents: 'none'
            }}
          >
            SOON
          </Box>
        </Box>
      </Box>

      {/* Form Area */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          <TextField
            {...register('identifier')}
            label="Email / Phone"
            type="text"
            fullWidth
            size="small"
            placeholder="you@example.com or 9876543210"
            error={!!errors.identifier}
            helperText={errors.identifier?.message}
            InputLabelProps={{
              sx: {
                color: '#94A3B8',
                '&.Mui-focused': {
                  color: '#3B82F6'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ fontSize: 20, color: 'primary.main', opacity: 0.7 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                }
              },
              '& .MuiInputBase-input': {
                color: '#F1F5F9',
                '&::placeholder': {
                  color: '#64748B',
                  opacity: 1
                },
                '&:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important',
                  caretColor: '#F1F5F9',
                  transition: 'background-color 5000s ease-in-out 0s'
                },
                '&:-webkit-autofill:hover': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important'
                },
                '&:-webkit-autofill:focus': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important'
                },
                '&:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important'
                }
              },
            }}
          />

          <TextField
            {...register('password')}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            size="small"
            placeholder="••••••••"
            error={!!errors.password}
            helperText={errors.password?.message}
            InputLabelProps={{
              sx: {
                color: '#94A3B8',
                '&.Mui-focused': {
                  color: '#3B82F6'
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    sx={{ 
                      color: '#94A3B8',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)'
                      }
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                }
              },
              '& .MuiInputBase-input': {
                color: '#F1F5F9',
                '&::placeholder': {
                  color: '#64748B',
                  opacity: 1
                },
                '&:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important',
                  caretColor: '#F1F5F9',
                  transition: 'background-color 5000s ease-in-out 0s'
                },
                '&:-webkit-autofill:hover': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important'
                },
                '&:-webkit-autofill:focus': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important'
                },
                '&:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important'
                }
              },
            }}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  sx={{
                    color: '#64748B',
                    '&.Mui-checked': { color: '#3B82F6' },
                  }}
                />
              }
              label={
                <Typography
                  variant="caption"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' }, color: '#94A3B8' }}
                >
                  Remember me
                </Typography>
              }
            />
            <Link
              component="button"
              type="button"
              variant="caption"
              onClick={() => setForgotPasswordOpen(true)}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                textDecoration: 'none',
                fontWeight: 600,
                color: '#3B82F6',
                '&:hover': { 
                  textDecoration: 'underline',
                  color: '#60A5FA'
                },
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 1,
              py: { xs: 1.4, sm: 1.6 },
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              textTransform: 'none',
              minHeight: { xs: 48, sm: 52 },
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: '0 12px 28px rgba(59, 130, 246, 0.4)',
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(0px)',
              },
              '&:disabled': {
                background: 'rgba(59, 130, 246, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={20} color="inherit" />
                Logging in...
              </Box>
            ) : (
              'Log in'
            )}
          </Button>
        </Stack>
      </form>

      {/* Footer */}
      <Typography
        variant="body2"
        sx={{
          mt: { xs: 2.5, sm: 3 },
          textAlign: 'center',
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          color: '#94A3B8'
        }}
      >
        Don't have an account?{' '}
        <Link
          component={RouterLink}
          to="/register"
          color="primary"
          sx={{
            fontWeight: 600,
            textDecoration: 'none',
            color: '#3B82F6',
            '&:hover': { 
              textDecoration: 'underline',
              color: '#60A5FA'
            },
          }}
        >
          Create one
        </Link>
      </Typography>

      <Dialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            backgroundImage: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          pt: 3,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            🔒 Reset Password
          </Typography>
          <IconButton
            onClick={() => setForgotPasswordOpen(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Enter your email or phone number to receive a password reset link.
          </Typography>
          <TextField
            label="Email or Phone"
            type="text"
            fullWidth
            size="small"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="you@example.com or 9876543210"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ fontSize: 20, color: 'primary.main', opacity: 0.7 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                '& input': {
                  color: '#fff',
                },
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.6)',
                '&.MuiInputLabel-shrink': {
                  backgroundColor: 'transparent',
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleForgotPassword}
            variant="contained"
            color="primary"
            fullWidth
            disabled={resetLoading}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              py: 1.25,
              fontWeight: 600,
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
              '&:hover': {
                boxShadow: '0 12px 20px rgba(16, 185, 129, 0.3)',
              }
            }}
          >
            {resetLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                Sending...
              </Box>
            ) : (
              'Reset Password'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}