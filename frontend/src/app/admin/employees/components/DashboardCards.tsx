import React from 'react';
import { Users, UserCheck, AlertTriangle, UserX } from 'lucide-react';

interface DashboardCardsProps {
  stats: {
    total_employees: number;
    active_employees: number;
    contracts_expiring_soon: number;
    exited: number;
    new_this_month: number;
  };
}

export function DashboardCards({ stats }: DashboardCardsProps) {
  const cards = [
    {
      title: 'Total Employees',
      value: stats.total_employees,
      change: `+${stats.new_this_month} this month`,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Active Employees',
      value: stats.active_employees,
      change: `${Math.round((stats.active_employees / stats.total_employees) * 100)}% of total`,
      icon: UserCheck,
      color: 'green',
    },
    {
      title: 'Expiring Contracts',
      value: stats.contracts_expiring_soon,
      change: 'Next 30 days',
      icon: AlertTriangle,
      color: 'amber',
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
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
