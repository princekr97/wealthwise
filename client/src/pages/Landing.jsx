/**
 * Landing Page
 * Modern glassmorphic landing page with Lucide icons
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingUp,
  Wallet,
  FileText,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import logo from '../assets/images/khatabahi-logo.png';

export function Landing() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: Users,
      title: 'Group Expenses',
      description: 'Split bills and track shared expenses with friends',
      color: 'from-emerald-400 to-cyan-500'
    },
    {
      icon: Wallet,
      title: 'Debt Settlement',
      description: 'Simplify and settle debts automatically',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Portfolio Tracking',
      description: 'Monitor your investments in real-time',
      color: 'from-amber-400 to-orange-500'
    },
    {
      icon: FileText,
      title: 'Lending Records',
      description: 'Keep track of money you lend or borrow',
      color: 'from-blue-400 to-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden">
              <img src={logo} alt="KhataBahi" className="w-full h-full object-contain p-1.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                KhataBahi
              </h1>
              <p className="text-slate-400 text-xs">Hisaab-Kitaab Made Easy</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-2xl text-white text-sm font-semibold transition-all backdrop-blur-xl"
          >
            Sign up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-8 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-5 py-2 mb-6 backdrop-blur-xl">
            <Sparkles className="text-emerald-400" size={14} />
            <span className="text-emerald-400 font-medium text-xs">Smart Group Settlements are Live</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">
            <span className="text-white">Finance,</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Reimagined.
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-3xl mx-auto">
            Split expenses, settle debts, and track your net worth in a{' '}
            <span className="text-white font-semibold">unified, ad-free dashboard</span>{' '}
            designed for clarity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <button
              onClick={() => navigate('/register')}
              className="group px-7 py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 text-slate-900 font-bold text-base rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center"
            >
              Get Started Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-7 py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white text-base font-semibold rounded-2xl transition-all backdrop-blur-xl"
            >
              Log in
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-5 mb-12 text-slate-400 text-xs">
            <div className="flex items-center space-x-2">
              <Shield className="text-emerald-400" size={16} />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="text-cyan-400" size={16} />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="text-purple-400" size={16} />
              <span>100% Ad-Free</span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="text-slate-900" size={24} />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1 flex items-center">
                        {feature.title}
                        <CheckCircle2
                          className={`ml-2 text-emerald-400 transition-opacity ${hoveredFeature === index ? 'opacity-100' : 'opacity-0'
                            }`}
                          size={18}
                        />
                      </h3>
                      <p className="text-slate-400 text-xs">{feature.description}</p>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-5 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-500 text-xs mb-1.5">
            © 2026 KhataBahi. All rights reserved.
          </p>
          <p className="text-slate-600 text-[10px] flex items-center justify-center">
            <span className="mr-1">🎨</span> Designed &
            <span className="ml-1 mr-1">💻</span> Developed by
            <span className="ml-1 text-emerald-400 font-medium">Prince Gupta</span>
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}