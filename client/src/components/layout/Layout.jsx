/**
 * Layout Component
 * 
 * Main application shell with sidebar navigation and header.
 * Uses MUI components for consistency with the rest of the app.
 */

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, Drawer, IconButton, Typography, useTheme, useMediaQuery, alpha } from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Receipt as ExpensesIcon,
  AccountBalance as IncomeIcon,
  CreditCard as LoansIcon,
  TrendingUp as InvestmentsIcon,
  Handshake as LendingIcon,
  Flag as BudgetIcon,
  Settings as SettingsIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/app/groups', label: 'Groups', icon: GroupsIcon },
  { to: '/app/expenses', label: 'Expenses', icon: ExpensesIcon },
  { to: '/app/income', label: 'Income', icon: IncomeIcon },
  { to: '/app/loans', label: 'Loans & EMIs', icon: LoansIcon },
  { to: '/app/investments', label: 'Investments', icon: InvestmentsIcon },
  { to: '/app/lending', label: 'Lending', icon: LendingIcon },
  { to: '/app/budget', label: 'Budget & Goals', icon: BudgetIcon },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon }
];

const SIDEBAR_WIDTH = 260;

// Colors
const colors = {
  bgPrimary: '#0F172A',
  bgSidebar: '#0F172A',
  bgCard: '#1E293B',
  border: 'rgba(148, 163, 184, 0.15)',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#22C55E',
  primaryHover: 'rgba(34, 197, 94, 0.1)'
};

export function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const SidebarContent = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.bgSidebar,
        borderRight: `1px solid ${colors.border}`
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #22C55E 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.bgPrimary,
            fontWeight: 700,
            fontSize: '1rem'
          }}
        >
          W
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: colors.textPrimary }}>
            WealthWise
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, mt: -0.3 }}>
            Personal Finance Hub
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box component="nav" sx={{ flex: 1, py: 2, px: 1.5 }}>
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => isMobile && setMobileOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  mb: 0.5,
                  borderRadius: 2,
                  transition: 'all 0.15s ease',
                  bgcolor: isActive ? colors.primaryHover : 'transparent',
                  border: isActive ? `1px solid rgba(34, 197, 94, 0.3)` : '1px solid transparent',
                  color: isActive ? colors.primary : colors.textSecondary,
                  '&:hover': {
                    bgcolor: isActive ? colors.primaryHover : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? colors.primary : colors.textPrimary
                  }
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 500 }}>
                  {label}
                </Typography>
              </Box>
            </NavLink>
          );
        })}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${colors.border}` }}>
        <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mb: 0.5 }}>
          Financial Health
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: '72%',
                height: '100%',
                background: 'linear-gradient(90deg, #22C55E 0%, #3B82F6 100%)',
                borderRadius: 3
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.primary }}>
            72
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      // Midnight Ocean gradient applied to root container
      background: 'linear-gradient(120deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
      position: 'relative',
      // Add subtle overlay for readability
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)',
        pointerEvents: 'none',
        zIndex: 0
      }
    }}>
      {/* Desktop Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box sx={{ position: 'fixed', width: SIDEBAR_WIDTH, height: '100vh' }}>
          <SidebarContent />
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            bgcolor: colors.bgSidebar,
            border: 'none'
          }
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box
          component="header"
          sx={{
            height: 56,
            px: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: 'rgba(15, 23, 42, 0.5)', // Semi-transparent to show gradient
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Mobile menu button */}
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                display: { lg: 'none' },
                color: colors.textSecondary,
                '&:hover': { color: colors.textPrimary }
              }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <Typography
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontSize: '0.8rem',
                color: colors.textSecondary
              }}
            >
              Welcome Back, <span style={{ color: colors.textPrimary, fontWeight: 500 }}>Investor</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>
                Today's snapshot
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: colors.primary, fontWeight: 500 }}>
                You're on track 🎯
              </Typography>
            </Box>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22C55E 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.bgPrimary,
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              PG
            </Box>
          </Box>
        </Box>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: 'transparent'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}