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
  VisibilityOff
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
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <PersonAddIcon sx={{ color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
            }}
          >
            Create your KhataBahi account
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          It only takes a minute. Start tracking your money smarter.
        </Typography>
      </Box>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <TextField
            {...register('name')}
            label="Full Name"
            type="text"
            fullWidth
            size="small"
            placeholder="Prince Gupta"
            error={!!errors.name}
            helperText={errors.name?.message}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
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
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
              },
            }}
          />

          <TextField
            {...register('phoneNumber')}
            label="Phone Number (Optional)"
            type="tel"
            fullWidth
            size="small"
            placeholder="10-digit mobile number"
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber?.message}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
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
            {!errors.password && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                }}
              >
                Use a mix of letters, numbers, and symbols for better security.
              </Typography>
            )}
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
        color="textSecondary"
        sx={{
          mt: { xs: 2.5, sm: 3 },
          textAlign: 'center',
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
        }}
      >
        Already have an account?{' '}
        <Link
          component={RouterLink}
          to="/login"
          color="primary"
          sx={{
            fontWeight: 600,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Log in
        </Link>
      </Typography>
    </Box>
  );
}