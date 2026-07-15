import React from 'react';
import { Eye, Edit, MoreVertical } from 'lucide-react';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
import { Employee } from '../types/employee';

interface EmployeeTableProps {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
}

export function EmployeeTable({ employees, onView, onEdit }: EmployeeTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Employee ID</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Employee</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Position</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Department</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Joined Date</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">{employee.employee_id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={employee.full_name} src={employee.profile_picture} size="md" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{employee.full_name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">{employee.job_title_name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">{employee.department_name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={employee.status} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">
                      {new Date(employee.joining_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(employee)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => onEdit(employee)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} className="text-gray-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="More options"
                      >
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
