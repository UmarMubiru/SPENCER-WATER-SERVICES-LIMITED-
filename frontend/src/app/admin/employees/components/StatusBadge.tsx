import React from 'react';

interface StatusBadgeProps {
  status?: string | number | null;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const normalizedStatus = String(status ?? 'Unknown');

  const getStatusConfig = (value: string) => {
    const s = value.toLowerCase();
    if (s === 'active' || s === 'administrator') {
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
      };
    }
    if (s === 'inactive' || s === 'exited' || s === 'suspended') {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
      };
    }
    if (s === 'on_leave' || s === 'technician' || s === 'human resource') {
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
      };
    }
    if (s === 'expiring' || s === 'expiring soon') {
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
      };
    }
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
    };
  };

  const config = getStatusConfig(normalizedStatus);

  return (
    <span
      className={`${sizeClasses[size]} ${config.bg} ${config.text} ${config.border} border rounded-full font-medium capitalize`}
    >
      {normalizedStatus.replace('_', ' ')}
    </span>
  );
}
