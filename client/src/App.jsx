/**
 * App Component
 *
 * Defines application routes and global layout.
 * Uses standardized layout components for consistency.
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CircularProgress, Box } from '@mui/material';
import { Layout, AuthLayout } from './components/layout';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import PageLoader from './components/common/PageLoader.jsx';

// Lazy load heavy pages (code splitting for performance)
// Pages still fetch fresh data when mounted - no caching here
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Expenses = lazy(() => import('./pages/Expenses.jsx'));
const Income = lazy(() => import('./pages/Income.jsx'));
const Loans = lazy(() => import('./pages/Loans.jsx'));
const Investments = lazy(() => import('./pages/Investments.jsx'));
const Lending = lazy(() => import('./pages/Lending.jsx'));
const Budget = lazy(() => import('./pages/Budget.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Groups = lazy(() => import('./pages/Groups.jsx'));
const GroupDetails = lazy(() => import('./pages/GroupDetails.jsx'));
const GradientShowcase = lazy(() => import('./components/GradientShowcase.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx').then(m => ({ default: m.ResetPassword })));

// Premium loader now imported from PageLoader component


export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" duration={2000} />
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/reset-password/:token" element={<AuthLayout><ResetPassword /></AuthLayout>} />

        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="groups/:id" element={<GroupDetails />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="income" element={<Income />} />
                    <Route path="loans" element={<Loans />} />
                    <Route path="investments" element={<Investments />} />
                    <Route path="lending" element={<Lending />} />
                    <Route path="budget" element={<Budget />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="gradients" element={<GradientShowcase />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}