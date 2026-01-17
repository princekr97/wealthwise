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
import { useAuthStore } from '../store/authStore';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';

import { toast } from 'sonner';
import { useThemeContext } from '../context/ThemeContext';
import { gradients, gradientCategories, getGradientsByCategory } from '../theme/gradients';

export default function Settings() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout, deleteAccount } = useAuthStore();
  const { currentGradient, setGradient } = useThemeContext();
  const [activeTab, setActiveTab] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('logout'); // 'logout' or 'delete'
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

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

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            '& .MuiTab-root': {
              minHeight: { xs: 48, sm: 56 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        >
          <Tab icon={<PaletteIcon />} label="Appearance" iconPosition="start" />
          <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
          <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
        </Tabs>
      </Card>

      {/* Profile Tab */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                Profile Information
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  label="Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  fullWidth
                  size="small"
                />

                <TextField
                  label="Email"
                  value={profileData.email}
                  disabled
                  fullWidth
                  size="small"
                  helperText="Email cannot be changed"
                />

                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: 120 }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' }, color: 'error.main' }}>
                Danger Zone
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<LogoutIcon sx={{ transform: 'rotate(180deg)' }} />}
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Notifications Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
              Notification Preferences
            </Typography>

            <Stack spacing={2} divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}>
              <NotificationItem
                title="Budget Alerts"
                description="Get notified when you exceed budget limits"
                defaultChecked
              />
              <NotificationItem
                title="EMI Reminders"
                description="Reminder for upcoming EMI payments"
                defaultChecked
              />
              <NotificationItem
                title="Bill Notifications"
                description="Alerts for pending bills and due dates"
                defaultChecked
              />
              <NotificationItem
                title="Weekly Summary"
                description="Get weekly expense and income summary"
                defaultChecked={false}
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Appearance Tab */}
      {activeTab === 0 && (
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
