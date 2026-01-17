/**
 * Landing Page
 *
 * Public marketing page for WealthWise with interactive hero and theme.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import {
  TrendingUp as ArrowRight,
  BarChart as BarChart3,
  AccountBalanceWallet as PiggyBank,
  Shield as ShieldCheck
} from '@mui/icons-material';

export function Landing() {
  return (
    <div className="min-h-screen brand-hero-bg text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col lg:flex-row items-center gap-8 lg:gap-14 px-6 lg:px-12 pb-10 pt-4">
        <HeroSection />
        <DashboardMock />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between px-6 lg:px-10 py-6">
      <div className="flex items-center gap-3">
        <Box sx={{
          height: 44, width: 44, borderRadius: '14px',
          background: 'linear-gradient(135deg, #10B981 0%, #3b82f6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
        }}>
          <span className="font-black text-white text-xl">W</span>
        </Box>
        <div>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: 'white' }}>WealthWise</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Smart Money Management</Typography>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <a href="#features" className="hover:text-white transition-all duration-300">Features</a>
        <a href="#security" className="hover:text-white transition-all duration-300">Security</a>
        <a href="#insights" className="hover:text-white transition-all duration-300">Insights</a>
      </nav>

      <div className="flex items-center gap-5">
        <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Log in</Link>
        <Link to="/register" className="group relative text-sm px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold overflow-hidden transition-all hover:scale-105 active:scale-95">
          Get Started
        </Link>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="w-full lg:w-1/2 space-y-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        Live Financial Insights
      </div>

      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white">
        Take control of your{' '}
        <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
          money
        </span>.
      </h1>

      <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
        Track expenses, investments, and group bills in one place. WealthWise transforms your transaction history into actionable financial intelligence.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transform transition hover:-translate-y-0.5">
          Start for free
        </Link>
        <a href="#insights" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold backdrop-blur-sm hover:bg-white/10 transition-all">
          Explore Insights
        </a>
      </div>

      <div className="grid grid-cols-3 gap-6 pt-6 max-w-lg">
        <StatPill label="Savings" value="38%" status="up" />
        <StatPill label="Debt" value="25%" status="ok" />
        <StatPill label="Score" value="780" status="up" />
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <section id="insights" className="w-full lg:w-1/2 flex justify-center relative">
      <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full translate-x-1/4" />
      <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full -translate-x-1/4" />

      <div className="relative w-full max-w-lg glass-card rounded-[32px] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Real-time Dashboard</div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <MiniCard title="Total Balance" amount="₹2,45,000" change="+12.5%" accent="emerald" />
            <MiniCard title="Expenses" amount="₹48,200" change="-4.2%" accent="rose" />
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300">Monthly Spending</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <div className="h-32 flex items-end gap-2">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-600/20 to-emerald-400/80" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * StatPill shows a tiny stat with status color.
 */
function StatPill({ label, value, status }) {
  const colorMap = {
    up: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40',
    ok: 'text-sky-400 bg-sky-500/10 border-sky-500/40',
    warn: 'text-amber-400 bg-amber-500/10 border-amber-500/40'
  };

  return (
    <div
      className={`rounded-2xl border px-3 py-2 ${colorMap[status]} text-[11px] sm:text-xs flex flex-col gap-0.5`}
    >
      <span className="uppercase tracking-wide">{label}</span>
      <span className="font-semibold text-sm sm:text-base text-slate-50">{value}</span>
    </div>
  );
}

/**
 * MiniCard represents the four summary cards in the hero dashboard mock.
 */
function MiniCard({ title, amount, change, accent }) {
  const accentMap = {
    emerald: 'from-emerald-500/25 to-emerald-500/5 text-emerald-300',
    rose: 'from-rose-500/25 to-rose-500/5 text-rose-300',
    sky: 'from-sky-500/25 to-sky-500/5 text-sky-300',
    amber: 'from-amber-500/25 to-amber-500/5 text-amber-300'
  };

  return (
    <div className="rounded-2xl bg-slate-900/65 border border-slate-700/70 p-3 flex flex-col gap-1">
      <div className="text-[11px] text-slate-400">{title}</div>
      <div className="text-sm font-semibold text-slate-50">{amount}</div>
      <div
        className={`mt-1 inline-flex items-center text-[10px] px-2 py-1 rounded-full bg-gradient-to-r ${accentMap[accent]
          }`}
      >
        {change}
      </div>
    </div>
  );
}