import React from 'react';
import { Users, UserCheck, Shield, UserX } from 'lucide-react';

interface UserDashboardCardsProps {
  stats: {
    total_users: number;
    active_users: number;
    administrators: number;
    inactive_users: number;
    new_this_month: number;
  };
}

export function UserDashboardCards({ stats }: UserDashboardCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      change: `+${stats.new_this_month} this month`,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Active Accounts',
      value: stats.active_users,
      change: `${Math.round((stats.active_users / stats.total_users) * 100)}% of total`,
      icon: UserCheck,
      color: 'green',
    },
    {
      title: 'Administrators',
      value: stats.administrators,
      change: `${Math.round((stats.administrators / stats.total_users) * 100)}% of total`,
      icon: Shield,
      color: 'purple',
    },
    {
      title: 'Inactive Accounts',
      value: stats.inactive_users,
      change: `${Math.round((stats.inactive_users / stats.total_users) * 100)}% of total`,
      icon: UserX,
      color: 'red',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-700',
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-700',
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-700',
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-700',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => {
        const colors = colorClasses[card.color as keyof typeof colorClasses];
        const Icon = card.icon;
        
        return (
          <div
            key={card.title}
            className={`${colors.bg} rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-3xl font-bold ${colors.valueColor} mb-1`}>
                  {card.value}
                </p>
                <p className="text-sm text-gray-500">{card.change}</p>
              </div>
              <div className={`${colors.iconBg} ${colors.iconColor} p-3 rounded-lg`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
