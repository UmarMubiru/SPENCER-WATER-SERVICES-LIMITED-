'use client';

import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({
  src,
  alt = 'User Avatar',
  firstName = '',
  lastName = '',
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = () => {
    const fn = firstName || '';
    const ln = lastName || '';
    const first = fn.charAt(0).toUpperCase();
    const last = ln.charAt(0).toUpperCase();
    return first + last || '?';
  };

  const getBackgroundColor = () => {
    const fn = firstName || '';
    const ln = lastName || '';
    if (!fn && !ln) return 'bg-gray-300';
    
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-red-500',
    ];
    
    const code1 = fn ? fn.charCodeAt(0) : 0;
    const code2 = ln ? ln.charCodeAt(0) : 0;
    const index = (code1 + code2) % colors.length;
    return colors[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${getBackgroundColor()} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {getInitials()}
    </div>
  );
}
