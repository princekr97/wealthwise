/**
 * Layout Component
 * 
 * Main application shell with sidebar navigation and header.
 * Uses MUI components for consistency with the rest of the app.
 */

import React, { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, IconButton, Typography, useTheme, useMediaQuery, alpha, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Logout as LogoutIcon, DeleteForever as DeleteIcon } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import ConfirmDialog from '../common/ConfirmDialog';
import logo from '../../assets/images/khatabahi-logo.png';
import { getMenuItems } from '../../config/menuConfig';
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

// Icon mapping
const iconMap = {
  Dashboard: DashboardIcon,
  Groups: GroupsIcon,
  Receipt: ExpensesIcon,
  AccountBalance: IncomeIcon,
  CreditCard: LoansIcon,
  TrendingUp: InvestmentsIcon,
  Handshake: LendingIcon,
  Flag: BudgetIcon,
  Settings: SettingsIcon
};

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('logout');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, deleteAccount } = useAuthStore();

  // Get menu items from config based on user role
  const navItems = useMemo(() => {
    const userRole = user?.role || 'user';
    return getMenuItems(userRole).map(item => ({
      ...item,
      icon: iconMap[item.icon] || DashboardIcon
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
        bgcolor: 'rgba(15, 23, 42, 0.4)', // Glassy sidebar
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${colors.border}`
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center', // Changed to center for horizontal alignment
          justifyContent: 'flex-start',
          borderBottom: `1px solid ${colors.border}`,
          height: '64px',
          gap: 1.5 // Space between logo and text
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="KhataBahi Logo"
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            // Subtle glow effect
            filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))'
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            sx={{
              fontSize: '1.4rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #22C55E 0%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}
          >
            KhataBahi
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6rem',
              color: colors.textSecondary,
              fontWeight: 500,
              letterSpacing: '0.5px',
              lineHeight: 1,
              mt: 0.25
            }}
          >
            Hisaab-Kitaab Made Easy
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
      minHeight: '-webkit-fill-available',
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
            bgcolor: 'transparent', // Make drawer paper transparent to show SidebarContent's glass
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
            bgcolor: '#0F172A', // Solid background for best performance
            // _removed_ backdropFilter for performance
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
                fontSize: '0.85rem',
                color: colors.textSecondary,
                fontWeight: 500
              }}
            >
              Welcome Back, <span style={{ color: colors.textPrimary, fontWeight: 600 }}>{user?.name?.split(' ')[0] || 'Investor'}</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, lineHeight: 1.2 }}>
                  Today's snapshot
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: colors.primary, fontWeight: 600, lineHeight: 1.2 }}>
                  You're on track 🎯
                </Typography>
              </Box>
            </Box>
            <Box
              onClick={handleMenuOpen}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22C55E 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F172A',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 6px 16px rgba(34, 197, 94, 0.4)'
                }
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
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    bgcolor: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    overflow: 'visible',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: '#1E293B',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
              sx={{
                '& .MuiMenuItem-root': {
                  color: '#F1F5F9',
                  py: 1.5,
                  px: 2,
                  fontSize: '0.9rem',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                  }
                },
                '& .MuiListItemIcon-root': {
                  minWidth: 36
                }
              }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: '#FFA500' }} />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}
        >
          {children}

          {/* Global App Footer */}
          <Box component="footer" sx={{ py: 3, textAlign: 'center', mt: 'auto', opacity: 0.7 }}>
            <Typography variant="caption" display="block" sx={{ color: colors.textSecondary, mb: 0.5 }}>
              &copy; {new Date().getFullYear()} KhataBahi. All rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              🎨 Designed & 💻 Developed by{' '}
              <Box component="span" sx={{ color: colors.primary, fontWeight: 600, cursor: 'default' }}>
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