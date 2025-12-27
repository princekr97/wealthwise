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
      email: '',
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
            }}
          >
            Welcome Back
          </Typography>
        </Box>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ display: 'block', mb: 2 }}
        >
          {loginMode === 'email'
            ? 'Access your financial dashboard'
            : 'Login securely via phone'}
        </Typography>
      </Box>

      {/* Login Mode Toggle - Compact Pill Style */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        mb: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        p: 0.5,
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <Button
          size="small"
          onClick={() => setLoginMode('email')}
          sx={{
            flex: 1,
            textTransform: 'none',
            borderRadius: 1.5,
            fontSize: '0.8rem',
            py: 0.75,
            backgroundColor: loginMode === 'email' ? 'primary.main' : 'transparent',
            color: loginMode === 'email' ? '#fff' : 'text.secondary',
            '&:hover': {
              backgroundColor: loginMode === 'email' ? 'primary.dark' : 'rgba(255, 255, 255, 0.05)',
            }
          }}
        >
          Email
        </Button>
        <Button
          size="small"
          onClick={() => setLoginMode('phone')}
          sx={{
            flex: 1,
            textTransform: 'none',
            borderRadius: 1.5,
            fontSize: '0.8rem',
            py: 0.75,
            backgroundColor: loginMode === 'phone' ? 'primary.main' : 'transparent',
            color: loginMode === 'phone' ? '#fff' : 'text.secondary',
            '&:hover': {
              backgroundColor: loginMode === 'phone' ? 'primary.dark' : 'rgba(255, 255, 255, 0.05)',
            }
          }}
        >
          OTP
        </Button>
      </Box>

      {/* Form Area */}
      {loginMode === 'email' ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              size="small"
              placeholder="you@example.com"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
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
                      color: 'text.secondary',
                      '&.Mui-checked': { color: 'primary.main' },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                  >
                    Remember me
                  </Typography>
                }
              />
              <Link
                component="button"
                type="button"
                variant="caption"
                color="primary"
                onClick={() => setForgotPasswordOpen(true)}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{
                mt: 1,
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: 2,
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                textTransform: 'none',
                minHeight: { xs: 44, sm: 48 },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} color="inherit" />
                  Logging in...
                </Box>
              ) : (
                'Log in'
              )}
            </Button>
          </Stack>
        </form>
      ) : (
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <TextField
            label="Phone Number"
            type="tel"
            fullWidth
            size="small"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            disabled={otpSent || otpLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ fontSize: 20, color: 'primary.main', opacity: 0.7 }} />
                </InputAdornment>
              ),
            }}
          />

          {otpSent && (
            <TextField
              label="Enter OTP"
              type="text"
              fullWidth
              size="small"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="6-digit code"
              disabled={otpLoading}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <OtpIcon sx={{ fontSize: 20, color: 'primary.main', opacity: 0.7 }} />
                  </InputAdornment>
                ),
              }}
            />
          )}

          <Button
            onClick={otpSent ? handleVerifyOTP : handleSendOTP}
            variant="contained"
            color="primary"
            fullWidth
            disabled={otpLoading}
            sx={{
              mt: 1,
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: 2,
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              textTransform: 'none',
              minHeight: { xs: 44, sm: 48 },
            }}
          >
            {otpLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                {otpSent ? 'Verifying...' : 'Sending...'}
              </Box>
            ) : (
              otpSent ? 'Verify & Log in' : 'Send One-Time Password'
            )}
          </Button>

          {otpSent && (
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setOtpSent(false);
                setOtp('');
              }}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Change Phone Number
            </Button>
          )}
        </Stack>
      )}

      {/* Footer */}
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{
          mt: { xs: 2.5, sm: 3 },
          textAlign: 'center',
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
            '&:hover': { textDecoration: 'underline' },
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
            Don't worry! Enter the email address associated with your account and we'll send you a secure link to reset your password.
          </Typography>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            size="small"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="you@example.com"
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