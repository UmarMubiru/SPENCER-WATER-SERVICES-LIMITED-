'use client';

import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';

export default function LeadsDashboardPage() {
  const leads = [
    { id: 'LD-001', name: 'Kampala City Council', contact: 'John Smith', status: 'Hot', source: 'Website', value: 'UGX 450M', date: '2026-07-10' },
    { id: 'LD-002', name: 'Ministry of Water', contact: 'Sarah Johnson', status: 'Warm', source: 'Referral', value: 'UGX 890M', date: '2026-07-08' },
    { id: 'LD-003', name: 'Private Schools Association', contact: 'Michael Brown', status: 'Cold', source: 'Cold Call', value: 'UGX 120M', date: '2026-07-05' },
    { id: 'LD-004', name: 'Industrial Park Developers', contact: 'Emily Davis', status: 'Hot', source: 'Trade Show', value: 'UGX 650M', date: '2026-07-03' },
  ];

  const stats = [
    { label: 'Total Leads', value: '184', change: '+18 this month', color: 'blue' },
    { label: 'Hot Leads', value: '42', change: '8 urgent', color: 'red' },
    { label: 'Warm Leads', value: '76', change: '12 follow-ups', color: 'amber' },
    { label: 'Converted', value: '66', change: '36% conversion', color: 'green' },
  ];

  return (
    <AdminLayout
      title="Leads Management"
      subtitle="Track and manage sales leads and opportunities"
      activePath="/admin/leads/dashboard"
    >
      <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', valueColor: 'text-green-700' },
                amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', valueColor: 'text-amber-700' },
                red: { bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700' },
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

          {/* Leads Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Active Leads</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  + New Lead
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Company</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Source</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Value</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{lead.id}</td>
                    <td className="py-4 px-6 text-gray-700">{lead.name}</td>
                    <td className="py-4 px-6 text-gray-700">{lead.contact}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'Hot' ? 'bg-red-100 text-red-700' :
                        lead.status === 'Warm' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{lead.source}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{lead.value}</td>
                    <td className="py-4 px-6 text-gray-700">{lead.date}</td>
                    <td className="py-4 px-6">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </AdminLayout>
  );
}
