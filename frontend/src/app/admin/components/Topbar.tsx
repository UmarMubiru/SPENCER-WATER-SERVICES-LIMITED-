import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
  notificationCount?: number;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function Topbar({ title, subtitle, onSearch, onMenuToggle, isMenuOpen }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userInitials, setUserInitials] = useState('AU');
  const [userName, setUserName] = useState('Admin User');
  const [userRole, setUserRole] = useState('Administrator');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get user data from localStorage only on client side
    const firstName = localStorage.getItem('user_first_name') || 'Admin';
    const lastName = localStorage.getItem('user_last_name') || 'User';
    setUserInitials(`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase());
    setUserName(`${firstName} ${lastName}`);
    setUserRole(localStorage.getItem('user_role') || 'Administrator');
    setProfilePicture(localStorage.getItem('profile_picture'));
  }, []);

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
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
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
          {/* Search - Hidden on very small screens */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </form>

          {/* Date - Hidden on small screens */}
          <div className="text-sm text-gray-600 hidden lg:block">
            {currentDate}
          </div>

          {/* User Profile */}
          <Link href="/admin/profile" className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-2 md:px-3 py-2 transition-colors cursor-pointer">
            {mounted && profilePicture ? (
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                {mounted ? userInitials : 'AU'}
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 truncate">{mounted ? userName : 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate">{mounted ? userRole : 'Administrator'}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
