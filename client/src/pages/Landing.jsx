/**
 * Landing Page
 *
 * Public marketing page for WealthWise with interactive hero and theme.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, PiggyBank, ShieldCheck } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen brand-hero-bg text-slate-100 flex flex-col">
      <header className="flex items-center justify-between px-6 lg:px-10 py-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand to-brandBlue shadow-brand-soft flex items-center justify-center">
            <span className="font-black text-slate-950 text-lg">W</span>
          </div>
          <div>
            <div className="font-semibold tracking-tight">WealthWise</div>
            <div className="text-xs text-slate-400 -mt-1">
              Master Your Money, Shape Your Future
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <a href="#features" className="hover:text-white transition-base">
            Features
          </a>
          <a href="#security" className="hover:text-white transition-base">
            Security
          </a>
          <a href="#insights" className="hover:text-white transition-base">
            Insights
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-slate-300 hover:text-white transition-base"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-brand to-brandBlue shadow-brand-soft text-slate-950 font-semibold hover:shadow-brand-blue transition-base flex items-center gap-2"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center gap-8 lg:gap-14 px-6 lg:px-12 pb-10 pt-4">
        {/* Hero text */}
        <section className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-900/60 px-3 py-1 text-xs text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live overview of your financial health
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
            Take control of your{' '}
            <span className="bg-gradient-to-r from-brand to-brandBlue bg-clip-text text-transparent">
              money
            </span>
            , one smart insight at a time.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl">
            Track expenses, income, loans, EMIs, investments, and personal lending in a single
            interactive dashboard. Visual analytics help you make better money decisions every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 bg-gradient-to-r from-brand to-brandBlue text-slate-950 font-semibold shadow-brand-soft hover:shadow-brand-blue transition-base"
            >
              Start Free Today
              <ArrowRight size={18} />
            </Link>
            <a
              href="#insights"
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 bg-slate-900/60 border border-slate-700 text-slate-100 text-sm hover:bg-slate-900 transition-base"
            >
              View Live Insights
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 max-w-md text-xs sm:text-sm">
            <StatPill label="Savings Rate" value="38%" status="up" />
            <StatPill label="Debt Ratio" value="25%" status="ok" />
            <StatPill label="Emergency Fund" value="4 months" status="warn" />
          </div>
        </section>

        {/* Hero visual - faux dashboard */}
        <section
          id="insights"
          className="w-full lg:w-1/2 mt-4 lg:mt-0 flex justify-center"
        >
          <div className="relative max-w-xl w-full">
            <div className="absolute -top-10 -left-8 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-sky-500/25 blur-3xl" />

            <div className="glass-card rounded-3xl shadow-brand-blue overflow-hidden border border-slate-700/70">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/70 bg-slate-900/70">
                <div className="text-xs text-slate-400">Financial Overview</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <BarChart3 size={14} /> Live
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Summary cards mock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <MiniCard title="Income" amount="₹85,000" change="+5%" accent="emerald" />
                  <MiniCard title="Expenses" amount="₹52,000" change="-3%" accent="rose" />
                  <MiniCard title="Savings" amount="₹33,000" change="+12%" accent="sky" />
                  <MiniCard title="EMI Due" amount="₹15,000" change="3 loans" accent="amber" />
                </div>

                {/* Faux charts using gradients and shapes (later replaced by real Recharts in app) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-300">Expense Breakdown</span>
                      <span className="text-emerald-400">This Month</span>
                    </div>
                    <div className="relative h-28 flex items-center justify-center">
                      <div className="h-20 w-20 rounded-full border-[10px] border-emerald-400/80 border-t-transparent border-r-sky-400/80 border-b-rose-400/80 rotate-45 shadow-brand-soft" />
                      <div className="absolute text-center">
                        <div className="text-[10px] text-slate-400">Total Spend</div>
                        <div className="text-sm font-semibold">₹52K</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-300">Income vs Expense</span>
                      <span className="text-slate-400">Last 6 months</span>
                    </div>
                    <div className="h-28 flex items-end gap-1 overflow-hidden">
                      {[60, 75, 70, 85, 90, 80].map((h, idx) => (
                        <div
                          // eslint-disable-next-line react/no-array-index-key
                          key={idx}
                          className="flex-1 flex flex-col justify-end gap-1"
                        >
                          <div
                            className="rounded-t-full bg-gradient-to-t from-sky-500 to-emerald-400"
                            style={{ height: `${h}%` }}
                          />
                          <div className="h-1 rounded-full bg-slate-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Security highlight */}
                <div
                  id="security"
                  className="mt-2 flex items-center gap-3 text-xs bg-slate-900/70 border border-emerald-500/40 rounded-2xl px-3 py-2"
                >
                  <div className="h-7 w-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-100">Bank‑grade security</div>
                    <div className="text-[11px] text-slate-400">
                      Your data is encrypted in transit and at rest. Only you control your money
                      story.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating PiggyBank badge */}
            <div className="absolute -bottom-4 left-6 hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3 py-2 text-xs shadow-lg">
              <PiggyBank size={16} className="text-emerald-400" />
              <div>
                <div className="font-medium">Goal: House Down Payment</div>
                <div className="text-[11px] text-slate-400">₹6.5L / ₹10L • 65% complete</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
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
        className={`mt-1 inline-flex items-center text-[10px] px-2 py-1 rounded-full bg-gradient-to-r ${
          accentMap[accent]
        }`}
      >
        {change}
      </div>
    </div>
  );
}