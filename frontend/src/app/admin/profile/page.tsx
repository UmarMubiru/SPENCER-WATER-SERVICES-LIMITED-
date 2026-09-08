'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  const { user, token, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    project_updates: true,
    inventory_alerts: true,
    employee_changes: false,
  });
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'en',
  });

  useEffect(() => {
    loadUserData();
  }, [token]);

  const loadUserData = async () => {
    if (typeof window === 'undefined') return;
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const savedProfilePicture = localStorage.getItem('profile_picture');
    
    setFormData({
      full_name: [savedUser.first_name, savedUser.last_name].filter(Boolean).join(' ') || savedUser.username || '',
      email: savedUser.email || '',
      phone: '',
      bio: '',
    });

    if (token) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/users/me/', { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) {
          const profile = await response.json();
          setFormData({ full_name: profile.full_name || profile.username, email: profile.email || '', phone: profile.phone || '', bio: '' });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }

      // Load notification preferences from backend
      try {
        const prefResponse = await fetch('http://127.0.0.1:8000/api/notifications/preferences/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (prefResponse.ok) {
          const data = await prefResponse.json();
          const results = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
          if (results.length > 0) {
            const pref = results[0];
            setNotificationSettings({
              email_notifications: pref.email_notifications,
              push_notifications: pref.push_notifications,
              project_updates: pref.in_app_projects,
              inventory_alerts: pref.in_app_inventory,
              employee_changes: pref.in_app_leads,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    }
    
    if (savedProfilePicture) {
      setProfilePicture(savedProfilePicture);
    }
    
    // Load saved settings as fallback
    const savedNotifications = localStorage.getItem('notification_settings');
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications));
    }
    
    const savedAppearance = localStorage.getItem('appearance_settings');
    if (savedAppearance) {
      setAppearanceSettings(JSON.parse(savedAppearance));
    }
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePicture(base64String);
        localStorage.setItem('profile_picture', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureRemove = () => {
    setProfilePicture(null);
    localStorage.removeItem('profile_picture');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: formData.full_name, email: formData.email, phone: formData.phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update your profile.');
      const [first_name = '', ...rest] = formData.full_name.trim().split(/\s+/);
      updateUser({ first_name, last_name: rest.join(' '), email: formData.email });
      alert('Profile updated successfully.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not update your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/me/change-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwordData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not change your password.');
      setLoading(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      alert('Password changed successfully.');
    } catch (error) {
      setLoading(false);
      alert(error instanceof Error ? error.message : 'Could not change your password.');
    }
  };

  const handleNotificationSettingsChange = async (key: string, value: boolean) => {
    const updated = { ...notificationSettings, [key]: value };
    setNotificationSettings(updated);

    // Save to backend
    try {
      const response = await fetch('http://127.0.0.1:8000/api/notifications/preferences/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });
      if (response.ok) {
        localStorage.setItem('notification_settings', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  const handleAppearanceSettingsChange = (key: string, value: string) => {
    const updated = { ...appearanceSettings, [key]: value };
    setAppearanceSettings(updated);
    localStorage.setItem('appearance_settings', JSON.stringify(updated));
  };

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = () => {
    return formData.full_name.split(/\s+/).filter(Boolean).map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase() || 'U';
  };

  return (
    <AdminLayout
      title="Profile Settings"
      subtitle="Manage your account settings and preferences"
      activePath="/admin/profile"
    >
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              {[
                { id: 'profile', label: 'Profile' },
                { id: 'security', label: 'Security' },
                { id: 'notifications', label: 'Notifications' },
                { id: 'appearance', label: 'Appearance' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <div className="flex items-center gap-6 mb-8">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {getUserInitials()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-500 mb-3">JPG, PNG or GIF. Max size 2MB</p>
                    <div className="flex gap-2">
                      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                        Upload New
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                        />
                      </label>
                      {profilePicture && (
                        <button
                          onClick={handleProfilePictureRemove}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">This shows your registered name. You can correct it here if it was misspelled.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'push_notifications', label: 'Push Notifications', description: 'Receive push notifications in browser' },
                    { key: 'project_updates', label: 'Project Updates', description: 'Get notified about project changes' },
                    { key: 'inventory_alerts', label: 'Inventory Alerts', description: 'Get notified about low stock items' },
                    { key: 'employee_changes', label: 'Employee Changes', description: 'Get notified about employee updates' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{setting.label}</h4>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                          onChange={(e) => handleNotificationSettingsChange(setting.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select
                      value={appearanceSettings.theme}
                      onChange={(e) => handleAppearanceSettingsChange('theme', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={appearanceSettings.language}
                      onChange={(e) => handleAppearanceSettingsChange('language', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
