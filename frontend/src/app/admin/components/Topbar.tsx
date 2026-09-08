import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
  notificationCount?: number;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function Topbar({ title, subtitle, onSearch, onMenuToggle, isMenuOpen }: TopbarProps) {
  const { user, logout, token, refreshUserData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleLogout = () => {
    localStorage.removeItem('profile_picture');
    logout();
  };

  useEffect(() => {
    setMounted(true);
    setProfilePicture(localStorage.getItem('profile_picture'));
  }, []);

  useEffect(() => {
    if (mounted && token) {
      void refreshUserData();
    }
  }, [mounted, token, refreshUserData]);

  useEffect(() => {
    if (token && mounted) {
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [token, mounted]);

  useEffect(() => {
    if (!token || !mounted) return;
    const refresh = window.setInterval(() => { fetchUnreadCount(); fetchNotifications(); }, 15000);
    return () => window.clearInterval(refresh);
  }, [token, mounted]);

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://127.0.0.1:8000/api/notifications/notifications/unread_count/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      // Silently fail - notifications are optional
      console.debug('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://127.0.0.1:8000/api/notifications/notifications/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const results = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        setNotifications(results.slice(0, 5));
      }
    } catch (error) {
      // Silently fail - notifications are optional
      console.debug('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/notifications/${notificationId}/mark_read/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/notifications/notifications/mark_all_read/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const firstName = user?.first_name || user?.username || 'User';
  const lastName = user?.last_name || '';
  const fullName = user?.full_name || `${firstName} ${lastName}`.trim();
  const userName = fullName;
  const userInitials = fullName.split(/\s+/).filter(Boolean).map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2) || 'U';
  const userDepartment = user?.department || 'No department assigned';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section - Menu Toggle + Title */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Title */}
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              title="Notifications"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center">No notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                        <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                        <p className="text-gray-400 text-xs mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date - Hidden on small screens */}
          <div className="text-sm text-gray-600 hidden lg:block">
            {currentDate}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-200">
            <Link href="/admin/profile" className="flex items-center gap-2 md:gap-3 hover:bg-gray-50 rounded-lg px-2 md:px-3 py-2 transition-colors cursor-pointer">
              {mounted && profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                  {mounted ? userInitials : 'U'}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 truncate">{mounted ? userName : 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{mounted ? userDepartment : 'Loading...'}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
