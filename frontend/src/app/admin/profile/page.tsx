'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
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
  }, []);

  const loadUserData = () => {
    if (typeof window === 'undefined') return;
    
    const firstName = localStorage.getItem('user_first_name') || '';
    const lastName = localStorage.getItem('user_last_name') || '';
    const email = localStorage.getItem('user_email') || '';
    const phone = localStorage.getItem('user_phone') || '';
    const bio = localStorage.getItem('user_bio') || '';
    const savedProfilePicture = localStorage.getItem('profile_picture');
    
    setFormData({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      bio: bio,
    });
    
    if (savedProfilePicture) {
      setProfilePicture(savedProfilePicture);
    }
    
    // Load saved settings
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
    
    // Save to localStorage
    localStorage.setItem('user_first_name', formData.first_name);
    localStorage.setItem('user_last_name', formData.last_name);
    localStorage.setItem('user_email', formData.email);
    localStorage.setItem('user_phone', formData.phone);
    localStorage.setItem('user_bio', formData.bio);
    
    // Update auth context if available
    setTimeout(() => {
      setLoading(false);
      alert('Profile updated successfully!');
    }, 500);
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
    
    // Simulate password change
    setTimeout(() => {
      setLoading(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      alert('Password changed successfully!');
    }, 500);
  };

  const handleNotificationSettingsChange = (key: string, value: boolean) => {
    const updated = { ...notificationSettings, [key]: value };
    setNotificationSettings(updated);
    localStorage.setItem('notification_settings', JSON.stringify(updated));
  };

  const handleAppearanceSettingsChange = (key: string, value: string) => {
    const updated = { ...appearanceSettings, [key]: value };
    setAppearanceSettings(updated);
    localStorage.setItem('appearance_settings', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const getUserInitials = () => {
    const firstName = formData.first_name || 'Admin';
    const lastName = formData.last_name || 'User';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/profile" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Profile Settings"
          subtitle="Manage your account settings and preferences"
          onSearch={(q) => console.log('Search:', q)}
        />

        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Tabs */}
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

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="max-w-2xl">
                  {/* Profile Picture */}
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

                  {/* Profile Form */}
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
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
                        <input
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
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
      </div>
    </div>
  );
}
