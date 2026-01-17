/**
 * App Component
 *
 * Defines application routes and global layout.
 * Uses standardized layout components for consistency.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout, AuthLayout } from './components/layout';
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
import { ResetPassword } from './pages/ResetPassword.jsx';
import Groups from './pages/Groups.jsx';
import GroupDetails from './pages/GroupDetails.jsx';
import GradientShowcase from './components/GradientShowcase.jsx';


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
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}