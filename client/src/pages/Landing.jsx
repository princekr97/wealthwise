/**
 * Landing Page
 *
 * Gradient-themed, mobile-responsive minimal landing page.
 * Focuses on premium aesthetics and fluid design.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container, useMediaQuery, useTheme } from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';

export function Landing() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background Gradient Orbs - Adjusted for Mobile */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] sm:w-[800px] h-[500px] bg-emerald-500/10 blur-[100px] sm:blur-[120px] rounded-full opacity-40 pointer-events-none" />
      <div className="absolute top-[20%] right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/10 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none" />

      <Header />
      <main className="flex-grow flex flex-col justify-start pt-32 sm:justify-center sm:pt-0 relative z-10">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="absolute top-0 w-full z-50">
      <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 6 }, py: { xs: 2.5, sm: 6 } }}>
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Box sx={{
              height: { xs: 36, sm: 40 },
              width: { xs: 36, sm: 40 },
              minWidth: { xs: 36, sm: 40 },
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #3b82f6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <span className="font-extrabold text-white text-lg sm:text-xl tracking-tight">W</span>
            </Box>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white/90 leading-none sm:mb-1">
                WealthWise
              </span>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium hidden sm:block">
                Master your money, simplify your life.
              </p>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link to="/register">
              <Button
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.15)',
                  textTransform: 'none',
                  borderRadius: '50px',
                  px: { xs: 2, sm: 3 },
                  py: 0.75,
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  backdropFilter: 'blur(4px)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}

function HeroSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <section>
      <Container maxWidth="md" sx={{ textAlign: 'center', px: { xs: 3, sm: 0 } }}>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-xs font-semibold mb-6 sm:mb-8 backdrop-blur-sm mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Smart Group Settlements are Live
        </div>

        {/* Main Headline with Gradient */}
        <Typography variant="h1" sx={{
          fontSize: { xs: '2.75rem', sm: '4rem', md: '5.5rem' },
          fontWeight: 800,
          lineHeight: { xs: 1.1, md: 1.05 },
          letterSpacing: '-0.03em',
          mb: { xs: 3, md: 5 },
          px: { xs: 1, sm: 0 }
        }}>
          <span className="block text-white mb-1 sm:mb-2">Finance,</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 animate-gradient-x">
            Reimagined.
          </span>
        </Typography>

        {/* Subheadline */}
        <Typography sx={{
          fontSize: { xs: '1rem', sm: '1.25rem' },
          color: '#94A3B8',
          maxWidth: '560px',
          mx: 'auto',
          mb: { xs: 6, md: 8 },
          lineHeight: 1.6,
          px: { xs: 2, sm: 0 }
        }}>
          Split expenses, settle debts, and track your net worth in a <span className="text-white font-medium">unified, ad-free dashboard</span> designed for clarity.
        </Typography>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 sm:mb-24 w-full px-4 sm:px-0">
          <Link to="/register" className="w-full sm:w-auto">
            <Button
              endIcon={<ArrowForwardIcon />}
              fullWidth={isMobile}
              sx={{
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                color: 'white',
                py: 1.75,
                px: 5,
                borderRadius: '16px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px -4px rgba(16, 185, 129, 0.5)'
                },
                transition: 'all 0.2s',
                minWidth: { sm: '180px' }
              }}
            >
              Get Started Free
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button
              fullWidth={isMobile}
              sx={{
                fontSize: '1rem',
                color: '#94a3b8',
                py: 1.75,
                px: 5,
                borderRadius: '16px',
                fontWeight: 600,
                textTransform: 'none',
                border: '1px solid rgba(255,255,255,0.05)',
                '&:hover': {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Log in
            </Button>
          </Link>
        </div>

        {/* Feature List - Responsive Grid */}
        <div className="flex flex-col sm:flex-row justify-center items-start sm:items-center gap-y-4 gap-x-8 lg:gap-x-12 px-6 sm:px-0">
          {[
            'Group Expenses',
            'Debt Settlement',
            'Portfolio Tracking',
            'Lending Records'
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20">
                <CheckIcon sx={{ fontSize: 14, color: '#34D399' }} />
              </div>
              <span className="text-sm font-medium text-slate-400">{feature}</span>
            </div>
          ))}
        </div>

      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 text-center border-t border-slate-800/50 bg-[#0f172a] relative z-20">
      <div className="flex flex-col gap-3">
        <p className="text-slate-600 text-xs">
          🎨 Designed & 💻 Developed by <span className="text-emerald-500 hover:text-emerald-400 transition-colors cursor-default">Prince Gupta</span>
        </p>
      </div>
    </footer>
  );
}