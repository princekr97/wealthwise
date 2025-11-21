/**
 * Layout Component
 *
 * Provides responsive shell with sidebar navigation and top bar.
 */

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CreditCard,
  Menu,
  Wallet,
  TrendingUp,
  PiggyBank,
  Target,
  Landmark,
  Settings,
  X
} from 'lucide-react';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/app/expenses', label: 'Expenses', icon: Wallet },
  { to: '/app/income', label: 'Income', icon: Landmark },
  { to: '/app/loans', label: 'Loans & EMIs', icon: CreditCard },
  { to: '/app/investments', label: 'Investments', icon: TrendingUp },
  { to: '/app/lending', label: 'Lending', icon: PiggyBank },
  { to: '/app/budget', label: 'Budget & Goals', icon: Target },
  { to: '/app/settings', label: 'Settings', icon: Settings }
];

export function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="px-5 py-4 flex items-center gap-2 border-b border-slate-800">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand to-brandBlue flex items-center justify-center text-slate-950 font-bold">
            W
          </div>
          <div>
            <div className="font-semibold text-sm">WealthWise</div>
            <div className="text-[11px] text-slate-500 -mt-0.5">Personal Finance Hub</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl transition-base ${
                  isActive
                    ? 'bg-slate-800/90 text-emerald-300 shadow-brand-soft border border-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500">
          <div>Financial Health • <span className="text-emerald-400 font-medium">72/100</span></div>
          <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-[72%] bg-gradient-to-r from-emerald-500 to-sky-500" />
          </div>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/95 border-r border-slate-800 transform transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand to-brandBlue flex items-center justify-center text-slate-950 font-bold">
              W
            </div>
            <div>
              <div className="font-semibold text-sm">WealthWise</div>
              <div className="text-[11px] text-slate-500 -mt-0.5">Your money cockpit</div>
            </div>
          </div>
          <button
            type="button"
            className="p-1 rounded-full bg-slate-900 hover:bg-slate-800 transition-base"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1 text-sm">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl transition-base ${
                  isActive
                    ? 'bg-slate-800/90 text-emerald-300 shadow-brand-soft border border-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 bg-slate-950/75 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="lg:hidden p-2 rounded-full bg-slate-900 hover:bg-slate-800 transition-base"
              onClick={() => setOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="text-xs text-slate-400 hidden sm:block">
              Welcome back, <span className="text-slate-100 font-medium">Investor</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right text-[11px]">
              <span className="text-slate-400">Today&apos;s snapshot</span>
              <span className="text-emerald-400 font-medium">You&apos;re on track 🎯</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-slate-950 text-xs flex items-center justify-center font-semibold">
              PG
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-slate-950/95">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 lg:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}