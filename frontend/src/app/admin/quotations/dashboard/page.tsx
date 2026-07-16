'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

export default function QuotationsDashboardPage() {
  const quotations = [
    { id: 'QT-001', client: 'Kampala Estates', project: 'Water Supply System', amount: 'UGX 450M', status: 'Pending', date: '2026-07-10' },
    { id: 'QT-002', client: 'Bright Schools', project: 'Borehole Installation', amount: 'UGX 120M', status: 'Approved', date: '2026-07-08' },
    { id: 'QT-003', client: 'Green Valley Ltd', project: 'Pipeline Network', amount: 'UGX 890M', status: 'Draft', date: '2026-07-05' },
    { id: 'QT-004', client: 'City Hospital', project: 'Water Treatment', amount: 'UGX 650M', status: 'Review', date: '2026-07-03' },
  ];

  const stats = [
    { label: 'Total Quotations', value: '42', change: '+8 this month', color: 'blue' },
    { label: 'Pending', value: '18', change: '5 need follow-up', color: 'amber' },
    { label: 'Approved', value: '24', change: '12 accepted', color: 'green' },
    { label: 'Rejected', value: '4', change: '2 this week', color: 'red' },
  ];

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/quotations/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Quotations & Leads"
          subtitle="Manage quotations, leads, and proposal tracking"
          onSearch={(q) => console.log('Search quotations:', q)}
        />

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

          {/* Quotations Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Quotations</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  + New Quotation
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Project</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quote) => (
                  <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{quote.id}</td>
                    <td className="py-4 px-6 text-gray-700">{quote.client}</td>
                    <td className="py-4 px-6 text-gray-700">{quote.project}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{quote.amount}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quote.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        quote.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        quote.status === 'Review' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{quote.date}</td>
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
