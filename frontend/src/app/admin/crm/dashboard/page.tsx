'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import Link from 'next/link';

export default function CRMDashboardPage() {
  const customers = [
    { id: 'CRM-001', name: 'Kampala City Council', type: 'Government', status: 'Active', projects: 5, value: 'UGX 1.2B', lastContact: '2026-07-10' },
    { id: 'CRM-002', name: 'Bright Schools', type: 'Education', status: 'Active', projects: 3, value: 'UGX 450M', lastContact: '2026-07-08' },
    { id: 'CRM-003', name: 'Green Valley Ltd', type: 'Commercial', status: 'Inactive', projects: 2, value: 'UGX 890M', lastContact: '2026-06-15' },
    { id: 'CRM-004', name: 'City Hospital', type: 'Healthcare', status: 'Active', projects: 4, value: 'UGX 650M', lastContact: '2026-07-05' },
  ];

  const stats = [
    { label: 'Total Customers', value: '76', change: '+12 this month', color: 'blue' },
    { label: 'Active Leads', value: '24', change: '8 in pipeline', color: 'green' },
    { label: 'Pending Quotes', value: '12', change: 'Awaiting response', color: 'amber' },
    { label: 'Total Value', value: 'UGX 8.5B', change: '+UGX 1.2B', color: 'purple' },
  ];

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/crm/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="CRM"
          subtitle="Customer relationship management and tracking"
          onSearch={(q) => console.log('Search CRM:', q)}
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', valueColor: 'text-green-700' },
                amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', valueColor: 'text-amber-700' },
                purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', valueColor: 'text-purple-700' },
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses];
              
              return (
                <div key={index} className={`${colors.bg} rounded-xl p-6 border border-gray-200`}>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colors.valueColor} mb-1`}>{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Link href="/admin/crm/leads" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Leads Pipeline</h3>
                  <p className="text-sm text-gray-600">Manage sales pipeline</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/crm/quotations" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quotations</h3>
                  <p className="text-sm text-gray-600">Create and manage quotes</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/crm/dashboard" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Customers</h3>
                  <p className="text-sm text-gray-600">View customer directory</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Customer Directory</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  + Add Customer
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Projects</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Total Value</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Last Contact</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{customer.id}</td>
                    <td className="py-4 px-6 text-gray-700">{customer.name}</td>
                    <td className="py-4 px-6 text-gray-700">{customer.type}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{customer.projects}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{customer.value}</td>
                    <td className="py-4 px-6 text-gray-700">{customer.lastContact}</td>
                    <td className="py-4 px-6">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
