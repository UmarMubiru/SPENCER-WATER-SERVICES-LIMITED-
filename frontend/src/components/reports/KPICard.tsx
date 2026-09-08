import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  changeLabel?: string;
  sparkline?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel = 'vs last period',
  sparkline,
  icon,
  className = '' 
}: KPICardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return 'text-gray-500';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>
                {change > 0 ? '+' : ''}{change}% {changeLabel}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 bg-gray-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      {sparkline && (
        <div className="mt-4 h-16">
          {sparkline}
        </div>
      )}
    </div>
  );
}
