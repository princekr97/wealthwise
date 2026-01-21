/**
 * Register Page
 *
 * Uses MUI components for consistency with the rest of the app.
 * Mobile-first responsive design.
 */

import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Stack,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Person as PersonIcon,
  PhoneIphone as PhoneIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: ''
    }
  });

  const onSubmit = async (values) => {
    const res = await registerUser(values);
    if (res.success) {
      toast.success('Account created. Welcome to KhataBahi!');
      navigate('/app/dashboard', { replace: true });
    } else {
      toast.error(res.message || 'Unable to register');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <PersonAddIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Create Account
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, color: '#94A3B8' }}
        >
          Join KhataBahi and start managing money smarter 🚀
        </Typography>
      </Box>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          <TextField
            {...register('name')}
            label="Full Name"
            type="text"
            fullWidth
            size="small"
            placeholder="Prince Gupta"
            error={!!errors.name}
            helperText={errors.name?.message}
            InputLabelProps={{
              sx: {
                color: '#94A3B8',
                '&.Mui-focused': {
                  color: '#10B981'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ fontSize: 20, color: '#10B981', opacity: 0.7 }} />
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
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
                }
              },
              '& .MuiInputBase-input': {
                color: '#F1F5F9',
                '&::placeholder': {
                  color: '#64748B',
                  opacity: 1
                },
                '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important',
                  caretColor: '#F1F5F9',
                  transition: 'background-color 5000s ease-in-out 0s'
                }
              },
            }}
          />

          <TextField
            {...register('email')}
            label="Email"
            type="email"
            fullWidth
            size="small"
            placeholder="you@example.com"
            error={!!errors.email}
            helperText={errors.email?.message}
            InputLabelProps={{
              sx: {
                color: '#94A3B8',
                '&.Mui-focused': {
                  color: '#10B981'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ fontSize: 20, color: '#10B981', opacity: 0.7 }} />
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
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
                }
              },
              '& .MuiInputBase-input': {
                color: '#F1F5F9',
                '&::placeholder': {
                  color: '#64748B',
                  opacity: 1
                },
                '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important',
                  caretColor: '#F1F5F9',
                  transition: 'background-color 5000s ease-in-out 0s'
                }
              },
            }}
          />

          <TextField
            {...register('phoneNumber')}
            label="Phone Number"
            type="tel"
            fullWidth
            size="small"
            placeholder="10-digit mobile number"
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber?.message || "Required for group member syncing"}
            InputLabelProps={{
              sx: {
                color: '#94A3B8',
                '&.Mui-focused': {
                  color: '#10B981'
                }
              }
            }}
            FormHelperTextProps={{
              sx: {
                color: '#64748B',
                fontSize: '0.7rem'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ fontSize: 20, color: '#10B981', opacity: 0.7 }} />
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
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
                }
              },
              '& .MuiInputBase-input': {
                color: '#F1F5F9',
                '&::placeholder': {
                  color: '#64748B',
                  opacity: 1
                },
                '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                  WebkitTextFillColor: '#F1F5F9 !important',
                  caretColor: '#F1F5F9',
                  transition: 'background-color 5000s ease-in-out 0s'
                }
              },
            }}
          />

          <Box>
            <TextField
              {...register('password')}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              placeholder="At least 6 characters"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputLabelProps={{
                sx: {
                  color: '#94A3B8',
                  '&.Mui-focused': {
                    color: '#10B981'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ fontSize: 20, color: '#10B981', opacity: 0.7 }} />
                  </InputAdornment>
                ),
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
                          color: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)'
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
                    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#F1F5F9',
                  '&::placeholder': {
                    color: '#64748B',
                    opacity: 1
                  },
                  '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
                    WebkitBoxShadow: '0 0 0 100px #1E293B inset !important',
                    WebkitTextFillColor: '#F1F5F9 !important',
                    caretColor: '#F1F5F9',
                    transition: 'background-color 5000s ease-in-out 0s'
                  }
                },
              }}
            />
            {!errors.password && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.75,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                🔒 Use letters, numbers & symbols for security
              </Typography>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 1.5,
              py: { xs: 1.4, sm: 1.6 },
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              textTransform: 'none',
              minHeight: { xs: 48, sm: 52 },
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 12px 28px rgba(16, 185, 129, 0.4)',
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(0px)',
              },
              '&:disabled': {
                background: 'rgba(16, 185, 129, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={20} color="inherit" />
                Creating account...
              </Box>
            ) : (
              'Create Account'
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
        Already have an account?{' '}
        <Link
          component={RouterLink}
          to="/login"
          sx={{
            fontWeight: 600,
            textDecoration: 'none',
            color: '#10B981',
            '&:hover': { 
              textDecoration: 'underline',
              color: '#34D399'
            },
          }}
        >
          Log in
        </Link>
      </Typography>
    </Box>
  );
}