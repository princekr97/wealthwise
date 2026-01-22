import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import {
  Box,
  CircularProgress,
  IconButton
} from '@mui/material';

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
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex p-2 bg-white/5 border-b border-white/5">
        <button
          onClick={() => navigate('/login')}
          className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-slate-400 hover:text-white"
        >
          Login
        </button>
        <button
          className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-emerald-500 to-purple-600 text-white shadow-lg"
        >
          Sign Up
        </button>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <UserPlus className="text-emerald-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
          </div>
          <p className="text-slate-400 text-sm">Join KhataBahi and start managing money smarter 🚀</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
            <div className="relative group">
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.name ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-emerald-400'}`} size={20} />
              <input
                {...register('name')}
                type="text"
                placeholder="Prince Gupta"
                className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 transition-all ${errors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500/50'}`}
              />
            </div>
            {errors.name && <p className="mt-1.5 text-xs text-rose-500 items-center flex gap-1"><span className="w-1 h-1 rounded-full bg-rose-500" /> {errors.name.message}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-emerald-400'}`} size={20} />
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 transition-all ${errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500/50'}`}
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-rose-500 items-center flex gap-1"><span className="w-1 h-1 rounded-full bg-rose-500" /> {errors.email.message}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Phone Number</label>
            <div className="relative group">
              <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.phoneNumber ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-emerald-400'}`} size={20} />
              <input
                {...register('phoneNumber')}
                type="tel"
                placeholder="10-digit mobile number"
                className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 transition-all ${errors.phoneNumber ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500/50'}`}
              />
            </div>
            <p className={`mt-1.5 text-xs flex items-center gap-1 ${errors.phoneNumber ? 'text-rose-500' : 'text-slate-500'}`}>
              {errors.phoneNumber ? (
                <><span className="w-1 h-1 rounded-full bg-rose-500" /> {errors.phoneNumber.message}</>
              ) : (
                "Required for group member syncing"
              )}
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-emerald-400'}`} size={20} />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 transition-all ${errors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500/50'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className={`mt-1.5 text-xs flex items-center gap-1 ${errors.password ? 'text-rose-500' : 'text-slate-500'}`}>
              {errors.password ? (
                <><span className="w-1 h-1 rounded-full bg-rose-500" /> {errors.password.message}</>
              ) : (
                <><CheckCircle2 size={12} className="text-emerald-400" /> Min 8 chars with uppercase, lowercase, number & special character</>
              )}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-purple-600 text-white font-bold py-4 rounded-2xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Creating Account...</span>
              </Box>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors underline decoration-emerald-500/30 underline-offset-4"
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}