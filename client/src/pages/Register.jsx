/**
 * Register Page
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();

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
      toast.success('Account created. Welcome to WealthWise!');
      navigate('/app/dashboard', { replace: true });
    } else {
      toast.error(res.message || 'Unable to register');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
            <UserPlus size={20} className="text-emerald-400" />
            Create your WealthWise account
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            It only takes a minute. Start tracking your money smarter.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1 text-sm">
          <label htmlFor="name" className="text-slate-200">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Prince Gupta"
          />
          {errors.name && (
            <p className="text-[11px] text-rose-400 mt-0.5">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <label htmlFor="email" className="text-slate-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-[11px] text-rose-400 mt-0.5">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <label htmlFor="password" className="text-slate-200">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="At least 6 characters"
          />
          {errors.password && (
            <p className="text-[11px] text-rose-400 mt-0.5">{errors.password.message}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-0.5">
            Use a mix of letters, numbers, and symbols for better security.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 bg-gradient-to-r from-brand to-brandBlue text-slate-950 text-sm font-semibold shadow-brand-soft hover:shadow-brand-blue transition-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-400 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}