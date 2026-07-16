import React from 'react';
import { UserPlus, FileText, AlertTriangle, BarChart } from 'lucide-react';

interface QuickActionsProps {
  onAddEmployee: () => void;
  onImportEmployees: () => void;
  onContractAlerts: () => void;
  onGenerateReport: () => void;
}

export function QuickActions({
  onAddEmployee,
  onImportEmployees,
  onContractAlerts,
  onGenerateReport,
}: QuickActionsProps) {
  const actions = [
    {
      icon: UserPlus,
      label: 'Add New Employee',
      onClick: onAddEmployee,
      color: 'blue',
    },
    {
      icon: FileText,
      label: 'Import Employees',
      onClick: onImportEmployees,
      color: 'green',
    },
    {
      icon: AlertTriangle,
      label: 'Contract Alerts',
      onClick: onContractAlerts,
      color: 'amber',
    },
    {
      icon: BarChart,
      label: 'Generate Report',
      onClick: onGenerateReport,
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'hover:bg-blue-50 text-blue-600',
    green: 'hover:bg-green-50 text-green-600',
    amber: 'hover:bg-amber-50 text-amber-600',
    purple: 'hover:bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const colors = colorClasses[action.color as keyof typeof colorClasses];
          
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${colors}`}
            >
              <Icon size={20} />
              <span className="font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
