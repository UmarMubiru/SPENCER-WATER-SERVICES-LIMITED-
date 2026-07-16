'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

export default function TendersDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const tenders = [
    { id: 'TND-001', title: 'Water Supply System - Municipal Council', status: 'Active', value: 'UGX 450M', deadline: '2026-08-15' },
    { id: 'TND-002', title: 'Borehole Drilling - Rural Schools', status: 'Pending', value: 'UGX 120M', deadline: '2026-08-20' },
    { id: 'TND-003', title: 'Pipeline Installation - Industrial Park', status: 'Review', value: 'UGX 890M', deadline: '2026-08-25' },
    { id: 'TND-004', title: 'Water Treatment Plant - Hospital', status: 'Active', value: 'UGX 650M', deadline: '2026-09-01' },
  ];

  const stats = [
    { label: 'Total Tenders', value: '18', change: '+3 this month', color: 'blue' },
    { label: 'Active Bids', value: '12', change: '6 in confirmation', color: 'green' },
    { label: 'Pending Review', value: '4', change: '2 urgent', color: 'amber' },
    { label: 'Won Contracts', value: '8', change: '2 this quarter', color: 'green' },
  ];

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/tenders/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Tender Management"
          subtitle="Manage tender opportunities, bids, and contract tracking"
          onSearch={(q) => setSearchQuery(q)}
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', valueColor: 'text-green-700' },
                amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', valueColor: 'text-amber-700' },
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

          {/* Tenders Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Active Tenders</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  + New Tender
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Title</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Value</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Deadline</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenders.map((tender) => (
                  <tr key={tender.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{tender.id}</td>
                    <td className="py-4 px-6 text-gray-700">{tender.title}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tender.status === 'Active' ? 'bg-green-100 text-green-700' :
                        tender.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {tender.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">{tender.value}</td>
                    <td className="py-4 px-6 text-gray-700">{tender.deadline}</td>
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
