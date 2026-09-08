'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

export default function SettingsDashboardPage() {
  const [activeTab, setActiveTab] = useState('general');

  const settingsSections = [
    { id: 'general', name: 'General Settings', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' },
    { id: 'billing', name: 'Billing', icon: '💳' },
    { id: 'users', name: 'User Management', icon: '👥' },
  ];

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/settings/dashboard" />
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Settings"
            subtitle="Configure your account and system preferences"
            onSearch={(q) => console.log('Search settings:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
              <div className="space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="font-medium">{section.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {settingsSections.find(s => s.id === activeTab)?.name}
                </h2>

                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        defaultValue="Spencer Water Services Ltd"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue="info@sws.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue="+256 700 000 000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                        <option>Africa/Kampala (UTC+3)</option>
                        <option>Africa/Nairobi (UTC+3)</option>
                        <option>UTC (UTC+0)</option>
                      </select>
                    </div>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">Last password change: 30 days ago</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Update Password
                    </button>
                  </div>
                )}

                {activeTab !== 'general' && activeTab !== 'security' && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Settings section under development</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
