/**
 * Settings Page
 * User profile and app settings
 */

import { useState } from 'react';
import { User, Bell, Palette, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: ''
  });

  const handleLogout = () => {
    setConfirmOpen(true);
  };

  const confirmLogout = () => {
    logout();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-indigo-100">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="inline mr-2" size={18} /> Profile
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bell className="inline mr-2" size={18} /> Notifications
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Palette className="inline mr-2" size={18} /> Appearance
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Danger Zone</h2>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Budget Alerts</h3>
                <p className="text-sm text-gray-600">Get notified when you exceed budget limits</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">EMI Reminders</h3>
                <p className="text-sm text-gray-600">Reminder for upcoming EMI payments</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Bill Notifications</h3>
                <p className="text-sm text-gray-600">Alerts for pending bills and due dates</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Weekly Summary</h3>
                <p className="text-sm text-gray-600">Get weekly expense and income summary</p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Appearance</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                <button className="p-4 border-2 border-indigo-500 rounded-lg bg-white text-center">
                  <div className="text-2xl mb-2">☀️</div>
                  <p className="text-sm font-medium">Light</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg bg-white text-center hover:border-indigo-500 transition">
                  <div className="text-2xl mb-2">🌙</div>
                  <p className="text-sm font-medium">Dark</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg bg-white text-center hover:border-indigo-500 transition">
                  <div className="text-2xl mb-2">⚙️</div>
                  <p className="text-sm font-medium">Auto</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        onConfirm={confirmLogout}
        confirmText="Logout"
        severity="warning"
      />
    </div>
  );
}
