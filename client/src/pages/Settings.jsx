/**
 * Settings Page
 * 
 * User profile and app settings with consistent MUI styling.
 * Mobile-first responsive design.
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { User, Mail, Phone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';

import { toast } from 'sonner';
import { useThemeContext } from '../context/ThemeContext';
import { gradients, gradientCategories, getGradientsByCategory } from '../theme/gradients';

export default function Settings() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout, deleteAccount, fetchProfile } = useAuthStore();
  const { currentGradient, setGradient, mode, toggleMode } = useThemeContext();
  const [activeTab, setActiveTab] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('logout'); // 'logout' or 'delete'
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  // Fetch latest profile on mount
  React.useEffect(() => {
    fetchProfile();
  }, []);

  // Update profileData when user changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLogout = () => {
    setConfirmType('logout');
    setConfirmOpen(true);
  };

  const handleDeleteAccount = () => {
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
      setConfirmOpen(false); // Only close if failed, successful delete will redirect
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="⚙️ Settings"
        subtitle="Manage your account and preferences"
      />

      {/* Tabs - Modern Pill Style */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            p: 0.5,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            width: '100%'
          }}
        >
          {[
            { icon: <PersonIcon sx={{ fontSize: 18 }} />, label: 'Profile', index: 0 },
            { icon: <PaletteIcon sx={{ fontSize: 18 }} />, label: 'Appearance', index: 1 }
          ].map(({ icon, label, index }) => (
            <Box
              key={index}
              onClick={() => setActiveTab(index)}
              sx={{
                flex: 1,
                px: 2,
                py: 1.2,
                cursor: 'pointer',
                color: activeTab === index ? 'white' : 'rgba(255,255,255,0.6)',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: '10px',
                backgroundColor: activeTab === index ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                border: activeTab === index ? '1px solid rgba(20, 184, 166, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                whiteSpace: 'nowrap',
                '&:hover': {
                  color: 'white',
                  backgroundColor: activeTab === index ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              {icon}
              {label}
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Profile Tab */}
      {activeTab === 0 && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                Profile Information
              </Typography>

              <div className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors" size={20} />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${!!user?.email ? 'text-slate-500' : 'text-slate-400 group-focus-within:text-emerald-400'}`} size={20} />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!!user?.email}
                      placeholder={!user?.email ? "Add your email" : ""}
                      className={`w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none transition-all ${!!user?.email ? 'opacity-60 cursor-not-allowed' : 'focus:border-emerald-500/50 focus:bg-white/10'}`}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {user?.email ? "Email cannot be changed" : "Add your email (cannot be changed later)"}
                  </p>
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Phone Number</label>
                  <div className="relative group">
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${!!user?.phoneNumber ? 'text-slate-500' : 'text-slate-400 group-focus-within:text-emerald-400'}`} size={20} />
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                      disabled={!!user?.phoneNumber}
                      placeholder={!user?.phoneNumber ? "Add 10-digit phone" : ""}
                      className={`w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none transition-all ${!!user?.phoneNumber ? 'opacity-60 cursor-not-allowed' : 'focus:border-emerald-500/50 focus:bg-white/10'}`}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {user?.phoneNumber ? "Phone number cannot be changed" : "Add phone number (cannot be changed later)"}
                  </p>
                </div>

                {/* Save Button */}
                <button
                  onClick={async () => {
                    const updates = { name: profileData.name };
                    if (!user?.email && profileData.email) updates.email = profileData.email;
                    if (!user?.phoneNumber && profileData.phoneNumber) updates.phoneNumber = profileData.phoneNumber;

                    try {
                      await authService.updateProfile(updates);
                      await fetchProfile();
                      toast.success('Profile updated successfully');
                    } catch (error) {
                      toast.error('Failed to update profile');
                    }
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3.5 px-8 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Save Changes</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card sx={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}>
                  <Typography sx={{ fontSize: '1.2rem' }}>⚠️</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem' }, color: '#EF4444' }}>
                  Account Actions
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, fontSize: '0.85rem' }}>
                These actions are permanent and cannot be undone. Please proceed with caution.
              </Typography>

              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    borderColor: '#F59E0B',
                    color: '#F59E0B',
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#F59E0B',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Logout from Account
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<LogoutIcon sx={{ transform: 'rotate(180deg)' }} />}
                  onClick={handleDeleteAccount}
                  sx={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: '#fff',
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Delete Account Permanently
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}


      {/* Appearance Tab */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          {/* Theme Mode Toggle */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                Theme Mode
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box
                  onClick={() => mode === 'light' && toggleMode()}
                  sx={{
                    flex: 1,
                    p: 2.5,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: mode === 'dark' ? '#10B981' : 'rgba(255,255,255,0.1)',
                    background: mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    '&:hover': { borderColor: '#10B981' }
                  }}
                >
                  <Typography sx={{ fontSize: '2rem', mb: 1 }}>🌙</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Dark Mode</Typography>
                </Box>
                <Box
                  onClick={() => mode === 'dark' && toggleMode()}
                  sx={{
                    flex: 1,
                    p: 2.5,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: mode === 'light' ? '#10B981' : 'rgba(255,255,255,0.1)',
                    background: mode === 'light' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    '&:hover': { borderColor: '#10B981' }
                  }}
                >
                  <Typography sx={{ fontSize: '2rem', mb: 1 }}>☀️</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Light Mode</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Background Gradient */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                Background Theme
              </Typography>

              <Stack spacing={4}>
                {Object.keys(gradientCategories).map((category) => {
                  const categoryGradients = getGradientsByCategory(category);
                  if (categoryGradients.length === 0) return null;

                  return (
                    <Box key={category}>
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}
                      >
                        {gradientCategories[category]}
                      </Typography>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                          gap: 2,
                        }}
                      >
                        {categoryGradients.map(({ key, name, gradient, textColor }) => (
                          <Box
                            key={key}
                            onClick={() => {
                              setGradient(key);
                              toast.success(`Theme updated to ${name}`);
                            }}
                            sx={{
                              position: 'relative',
                              aspectRatio: '16/9',
                              borderRadius: 2,
                              background: gradient,
                              cursor: 'pointer',
                              overflow: 'hidden',
                              border: '2px solid',
                              borderColor: currentGradient === key ? '#10B981' : 'transparent',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                              },
                            }}
                          >
                            {currentGradient === key && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  bgcolor: '#10B981',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '0.875rem',
                                }}
                              >
                                ✓
                              </Box>
                            )}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 1.5,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'white',
                                  fontWeight: 600,
                                  display: 'block',
                                  lineHeight: 1.2,
                                }}
                              >
                                {name}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}

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
    </PageContainer>
  );
}

/**
 * NotificationItem - Individual notification setting row
 */
function NotificationItem({ title, description, defaultChecked }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1,
      }}
    >
      <Box>
        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {title}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          {description}
        </Typography>
      </Box>
      <Switch defaultChecked={defaultChecked} color="primary" />
    </Box>
  );
}

/**
 * ThemeOption - Theme selection button
 */
function ThemeOption({ icon, label, selected }) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: selected ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
        '&:hover': {
          borderColor: selected ? 'primary.main' : 'rgba(255,255,255,0.3)',
        },
      }}
    >
      <Typography sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 0.5 }}>{icon}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
        {label}
      </Typography>
    </Box>
  );
}
