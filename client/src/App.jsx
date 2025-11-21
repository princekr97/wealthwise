/**
 * App Component
 *
 * Defines application routes and global layout.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout.jsx';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import Income from './pages/Income.jsx';
import Loans from './pages/Loans.jsx';
import Investments from './pages/Investments.jsx';
import Lending from './pages/Lending.jsx';
import Budget from './pages/Budget.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="income" element={<Income />} />
                  <Route path="loans" element={<Loans />} />
                  <Route path="investments" element={<Investments />} />
                  <Route path="lending" element={<Lending />} />
                  <Route path="budget" element={<Budget />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen brand-hero-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-card rounded-2xl shadow-brand-blue p-8">
        {children}
      </div>
    </div>
  );
}