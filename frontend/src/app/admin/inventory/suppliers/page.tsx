'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  last_purchase_date?: string;
  last_purchase_price?: number;
  total_purchases: number;
  rating: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [suppliers, filters]);

  const applyFilters = () => {
    let filtered = [...suppliers];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(search) ||
        s.contact_person.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(s => 
        filters.status === 'active' ? s.is_active : !s.is_active
      );
    }
    
    setFilteredSuppliers(filtered);
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/suppliers/');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const handleWhatsApp = (whatsapp: string) => {
    window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const handleToggleActive = async (supplier: Supplier) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/suppliers/${supplier.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !supplier.is_active }),
      });
      
      if (response.ok) {
        fetchSuppliers();
      } else {
        alert('Error updating supplier');
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('Error updating supplier');
    }
  };

  return (
    <AdminLayout
      title="Suppliers Management"
      subtitle="Manage supplier contacts, pricing, and quotations"
      activePath="/admin/inventory/suppliers"
      onSearch={(q) => setFilters(prev => ({ ...prev, search: q }))}
    >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[
              { label: 'Total Suppliers', value: suppliers.length, color: 'blue' },
              { label: 'Active Suppliers', value: suppliers.filter(s => s.is_active).length, color: 'green' },
              { label: 'Inactive Suppliers', value: suppliers.filter(s => !s.is_active).length, color: 'gray' },
              { label: 'Recent Purchases', value: suppliers.filter(s => s.last_purchase_date).length, color: 'purple' },
            ].map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', valueColor: 'text-green-700' },
                gray: { bg: 'bg-gray-50', valueColor: 'text-gray-700' },
                purple: { bg: 'bg-purple-50', valueColor: 'text-purple-700' },
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses];
              
              return (
                <div key={index} className={`${colors.bg} rounded-xl p-6 border border-gray-200`}>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colors.valueColor}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Suppliers Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Suppliers</h2>
                <Link
                  href="/admin/inventory/suppliers/create"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Supplier
                </Link>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading suppliers...</div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No suppliers found matching your filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact Person</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Last Purchase</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Last Price</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{supplier.name}</p>
                            <p className="text-sm text-gray-500">Rating: {supplier.rating}/5</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700">{supplier.contact_person}</td>
                        <td className="py-4 px-6 text-gray-700">{supplier.email}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCall(supplier.phone)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Call"
                            >
                              📞 {supplier.phone}
                            </button>
                            {supplier.whatsapp && (
                              <button
                                onClick={() => handleWhatsApp(supplier.whatsapp)}
                                className="text-green-600 hover:text-green-800"
                                title="WhatsApp"
                              >
                                💬
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {supplier.last_purchase_date 
                            ? new Date(supplier.last_purchase_date).toLocaleDateString() 
                            : 'N/A'}
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">
                          {supplier.last_purchase_price 
                            ? `UGX ${supplier.last_purchase_price.toLocaleString()}` 
                            : 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {supplier.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(supplier)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEmail(supplier.email)}
                              className="text-green-600 hover:text-green-800 font-medium"
                              title="Send Email"
                            >
                              Email
                            </button>
                            <button
                              onClick={() => handleToggleActive(supplier)}
                              className="text-orange-600 hover:text-orange-800 font-medium"
                            >
                              {supplier.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

      {/* Supplier Details Modal */}
      {showDetailsModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Supplier Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Company Name</p>
                <p className="text-lg font-semibold text-gray-900">{selectedSupplier.name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Person</p>
                <p className="text-gray-700">{selectedSupplier.contact_person}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-700">{selectedSupplier.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-700">{selectedSupplier.phone}</p>
                </div>
              </div>
              
              {selectedSupplier.whatsapp && (
                <div>
                  <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                  <p className="text-gray-700">{selectedSupplier.whatsapp}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-700">{selectedSupplier.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Purchase</p>
                  <p className="text-gray-700">
                    {selectedSupplier.last_purchase_date 
                      ? new Date(selectedSupplier.last_purchase_date).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Price</p>
                  <p className="text-gray-700">
                    {selectedSupplier.last_purchase_price 
                      ? `UGX ${selectedSupplier.last_purchase_price.toLocaleString()}` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Purchases</p>
                  <p className="text-gray-700">{selectedSupplier.total_purchases}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p className="text-gray-700">{selectedSupplier.rating}/5</p>
                </div>
              </div>
              
              {selectedSupplier.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-gray-700">{selectedSupplier.notes}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleCall(selectedSupplier.phone)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📞 Call
                </button>
                {selectedSupplier.whatsapp && (
                  <button
                    onClick={() => handleWhatsApp(selectedSupplier.whatsapp)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💬 WhatsApp
                  </button>
                )}
                <button
                  onClick={() => handleEmail(selectedSupplier.email)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ✉️ Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
