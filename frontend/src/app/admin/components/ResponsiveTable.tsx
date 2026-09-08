'use client';

import React from 'react';
import { Eye, Archive } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  format?: (val: any) => string;
}

interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  className?: string;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  actions?: Action[];
}

export function ResponsiveTable({ columns, data, onRowClick, actions }: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.format ? column.format(row[column.key]) : row[column.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    {actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${action.className || 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
