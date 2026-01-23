/**
 * Layout Component
 * 
 * Main application shell with sidebar navigation and header.
 * Modern fintech design with glassmorphic sidebar and Lucide icons.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, IconButton, Typography, useTheme, useMediaQuery, alpha, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Logout as LogoutIcon, DeleteForever as DeleteIcon } from '@mui/icons-material';
import {
  LayoutGrid,
  Users,
  Receipt,
  IndianRupee,
  CreditCard,
  TrendingUp,
  HandCoins,
  Target,
  Settings,
  Bell,
  Search,
  Sparkles,
  Menu as MenuIconLucide,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeContext } from '../../context/ThemeContext';
import { toast } from 'sonner';
import ConfirmDialog from '../common/ConfirmDialog';
// import ThemeToggle from '../common/ThemeToggle';
import logo from '../../assets/images/khatabahi-logo.png';
import { getMenuItems } from '../../config/menuConfig';

// Icon mapping - Lucide icons for modern fintech look
const iconMap = {
  Dashboard: LayoutGrid,
  Groups: Users,
  Receipt: Receipt,
  AccountBalance: IndianRupee,
  CreditCard: CreditCard,
  TrendingUp: TrendingUp,
  Handshake: HandCoins,
  Flag: Target,
  Settings: Settings
};

// Sidebar width
const SIDEBAR_WIDTH = 288; // Reduced by 10% from 320px

export function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('logout');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, deleteAccount } = useAuthStore();
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';
  const contentRef = useRef(null);

  // Auto-scroll to top on route change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const themeColors = {
    bgPrimary: isDark ? '#0F172A' : '#F8FAFC',
    bgSidebar: isDark ? 'rgba(15, 23, 42, 0.4)' : '#FFFFFF',
    bgHeader: isDark ? '#0F172A' : '#FFFFFF',
    bgCard: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? 'rgba(148, 163, 184, 0.15)' : '#E2E8F0',
    textPrimary: isDark ? '#F1F5F9' : '#1E293B',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    primary: '#22C55E',
    primaryHover: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.15)'
  };

  // Get menu items from config based on user role
  const navItems = useMemo(() => {
    const userRole = user?.role || 'user';
    return getMenuItems(userRole).map(item => ({
      ...item,
      icon: iconMap[item.icon] || LayoutGrid
    }));
  }, [user?.role]);

  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    setConfirmType('logout');
    setConfirmOpen(true);
  };

  const handleDeleteAccount = () => {
    handleMenuClose();
    setConfirmType('delete');
    setConfirmOpen(true);
  };

  const confirmLogout = () => {
    logout();
  };

  const confirmDeleteAccount = async () => {
    const res = await deleteAccount();
    if (res.success) {
      toast.success('Your account has been permanently deleted.');
    } else {
      toast.error(res.message || 'Failed to delete account');
      setConfirmOpen(false);
    }
  };

  const SidebarContent = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? 'rgba(7, 10, 18, 0.95)' : '#FFFFFF',
        backdropFilter: 'blur(32px)',
        borderRight: `1px solid ${themeColors.border}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Glows */}
      {isDark && (
        <>
          <Box sx={{
            position: 'absolute',
            top: -100,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 250,
            height: 250,
            bgcolor: 'rgba(16, 185, 129, 0.15)',
            filter: 'blur(80px)',
            borderRadius: 'full',
            pointerEvents: 'none'
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -80,
            left: 50,
            width: 200,
            height: 200,
            bgcolor: 'rgba(59, 130, 246, 0.1)',
            filter: 'blur(80px)',
            borderRadius: 'full',
            pointerEvents: 'none'
          }} />
        </>
      )}

      {/* Header Section */}
      <Box sx={{ p: 2.5, pt: 3, pb: 1 }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Logo Mark */}
            {/* <div className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-lg overflow-hidden">
              <img src={logo} alt="KhataBahi" className="w-full h-full object-contain p-2 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-50" />
            </div> */}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">eKhataBahi</h1>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-emerald-400/80">
                  Beta
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Hisaab‑Kitaab Made Easy</p>
            </div>
          </div>

          <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white">
            <Bell size={18} />
          </button>
        </div>
      </Box>

      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          flex: 1,
          py: 2,
          px: 1.5,
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 0 },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {navItems.map(({ to, label, icon: Icon, badge }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => isMobile && setMobileOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              <div className={`
                group relative flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all
                ${isActive
                  ? 'bg-emerald-400/10 ring-1 ring-emerald-400/25'
                  : 'hover:bg-white/5'}
              `}>
                <div className="flex items-center gap-2.5 z-10">
                  {/* Icon Box */}
                  <span className={`
                    grid h-8 w-8 place-items-center rounded-lg border transition-all
                    ${isActive
                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                      : 'border-white/5 bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10'}
                  `}>
                    <Icon size={16} />
                  </span>

                  {/* Labels */}
                  <div className="flex flex-col">
                    <span className={`
                      text-sm font-semibold transition-colors
                      ${isActive ? 'text-emerald-50' : 'text-slate-300 group-hover:text-white'}
                    `}>
                      {label}
                    </span>
                    <span className={`
                      text-[10px] font-medium transition-colors
                      ${isActive ? 'text-emerald-400/70' : 'text-slate-500 group-hover:text-slate-400'}
                    `}>
                      {isActive ? 'Currently open' : 'Tap to view'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 z-10">
                  {badge && (
                    <span className={`
                      inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight shadow-sm
                      ${badge === 'Live'
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400 animate-in fade-in zoom-in duration-500'
                        : 'border-white/10 bg-white/5 text-slate-400'}
                    `}>
                      {badge === 'Live' && (
                        <span className="flex h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      {badge}
                    </span>
                  )}
                  <span className={`
                    h-1.5 w-1.5 rounded-full transition-all duration-300
                    ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] scale-110' : 'bg-transparent'}
                  `} />
                </div>

                {/* Subtle active background glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/5 via-cyan-400/2 to-blue-500/5 pointer-events-none" />
                )}
              </div>
            </NavLink>
          );
        })}
      </Box>

      {/* Footer Note */}
      <div className="mt-auto p-4 border-t border-white/5">
        <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
          Track smarter • Settle faster
        </p>
      </div>
    </Box>
  );

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh', // Fixed height shell
      overflow: 'hidden', // Prevent shell-level scrolling
      bgcolor: 'transparent',
      position: 'relative',
    }}>
      {/* Desktop Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          position: 'relative',
          zIndex: 10
        }}
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          zIndex: 1200,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            bgcolor: 'transparent',
            border: 'none'
          }
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        position: 'relative',
        height: '100vh',
        bgcolor: themeColors.bgPrimary
      }}>
        {/* Fixed Header */}
        <Box
          component="header"
          sx={{
            height: 56,
            px: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${themeColors.border}`,
            bgcolor: themeColors.bgHeader,
            position: 'relative',
            zIndex: 100,
            flexShrink: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                display: { lg: 'none' },
                color: themeColors.textSecondary,
                '&:hover': { color: themeColors.textPrimary }
              }}
            >
              {mobileOpen ? <X size={24} /> : <MenuIconLucide size={24} />}
            </IconButton>
            <Typography
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontSize: '0.85rem',
                color: themeColors.textSecondary,
                fontWeight: 500
              }}
            >
              Welcome Back, <span style={{ color: themeColors.textPrimary, fontWeight: 600 }}>{user?.name?.split(' ')[0] || 'Investor'}</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* <ThemeToggle /> */}
            <Box
              onClick={handleMenuOpen}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22C55E 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F172A',
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            >
              {getUserInitials()}
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  bgcolor: isDark ? '#0f172a' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '12px',
                  boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
                  mt: 1
                }
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
                <ListItemIcon sx={{ minWidth: 'auto !important' }}>
                  <LogoutIcon fontSize="small" sx={{ color: '#FFA500' }} />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ sx: { color: isDark ? '#F1F5F9' : '#1E293B' } }}>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Scrollable Content Pane */}
        <Box
          ref={contentRef}
          sx={{
            flex: 1,
            overflowY: 'auto', // ONLY THIS AREA SCROLLS
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '10px' }
          }}
        >
          {/* Children / Page Content */}
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>

          {/* Footer naturally at end of scroll */}
          <Box
            component="footer"
            sx={{
              py: 4,
              mt: 2,
              textAlign: 'center',
              opacity: 0.7,
              flexShrink: 0
            }}
          >
            <Typography variant="caption" display="block" sx={{ color: themeColors.textSecondary, mb: 0.5, fontSize: '0.7rem' }}>
              &copy; {new Date().getFullYear()} eKhataBahi. All rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ color: themeColors.textSecondary, fontSize: '0.65rem' }}>
              🎨 Designed & 💻 Developed by{' '}
              <Box component="span" sx={{ color: themeColors.primary, fontWeight: 600, cursor: 'default' }}>
                Prince Gupta
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmType('logout'); }}
        title={confirmType === 'delete' ? "Delete Account" : "Logout"}
        message={
          confirmType === 'delete'
            ? "Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost."
            : "Are you sure you want to logout? You will need to login again to access your account."
        }
        onConfirm={confirmType === 'delete' ? confirmDeleteAccount : confirmLogout}
        confirmText={confirmType === 'delete' ? "Delete Forever" : "Logout"}
        severity={confirmType === 'delete' ? "error" : "warning"}
      />
    </Box>
  );
}
