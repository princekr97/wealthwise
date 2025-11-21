/**
 * Login Page
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

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
      toast.success('Welcome back!');
      const redirectTo = location.state?.from?.pathname || '/app/dashboard';
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(res.message || 'Unable to login');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
            <LogIn size={20} className="text-emerald-400" />
            Welcome back
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log in to see your dashboard and continue where you left off.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-[11px] text-rose-400 mt-0.5">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            Remember me
          </label>
          <button type="button" className="hover:text-emerald-300 transition-base">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 bg-gradient-to-r from-brand to-brandBlue text-slate-950 text-sm font-semibold shadow-brand-soft hover:shadow-brand-blue transition-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-400 text-center">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}