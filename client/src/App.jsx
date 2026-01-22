/**
 * App Component
 *
 * Defines application routes and global layout.
 * Uses standardized layout components for consistency.
 */

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CircularProgress, Box } from '@mui/material';
import { Layout, AuthLayout } from './components/layout';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import PageLoader from './components/common/PageLoader.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import ConnectionErrorDialog from './components/common/ConnectionErrorDialog.jsx';
import { CONNECTION_ERROR_EVENT } from './services/api.js';

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

import { useThemeContext } from './context/ThemeContext.jsx';

export default function App() {
  const { mode } = useThemeContext();
  const [showConnectionError, setShowConnectionError] = useState(false);

  // Listen for connection error events from API interceptor
  useEffect(() => {
    const handleConnectionError = () => {
      setShowConnectionError(true);
    };

    window.addEventListener(CONNECTION_ERROR_EVENT, handleConnectionError);
    return () => window.removeEventListener(CONNECTION_ERROR_EVENT, handleConnectionError);
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <ErrorBoundary>
      <Toaster
        position="top-center"
        duration={3000}
        theme={mode}
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            color: '#fff',
            padding: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          className: 'modern-toast',
          success: {
            style: {
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          warning: {
            style: {
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            },
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#fff',
            },
          },
          info: {
            style: {
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            },
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
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

      {/* Global Connection Error Dialog */}
      <ConnectionErrorDialog
        open={showConnectionError}
        onReload={handleReload}
      />
    </ErrorBoundary>
  );
}