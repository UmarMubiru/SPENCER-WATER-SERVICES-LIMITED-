'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../../../lib/api';
import Link from 'next/link';

interface StockMovement {
  id: string;
  item_id: string;
  item_name: string;
  item_code: string;
  movement_type: 'INITIAL' | 'PURCHASE' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT';
  quantity: number;
  balance_before: number;
  balance_after: number;
  reference_type: string;
  reference: string;
  performed_by: string;
  performed_by_name: string;
  timestamp: string;
  notes?: string;
}

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    movement_type: '',
    item_id: '',
    dateFrom: '',
    dateTo: '',
  });
  const [items, setItems] = useState<Array<{ id: string; name: string; item_code: string; quantity: number }>>([]);

  useEffect(() => {
    fetchMovements();
    fetchItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, filters]);

  const applyFilters = () => {
    let filtered = [...movements];
    
    if (filters.movement_type) {
      filtered = filtered.filter(m => m.movement_type === filters.movement_type);
    }
    
    if (filters.item_id) {
      filtered = filtered.filter(m => m.item_id === filters.item_id);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(m => new Date(m.timestamp) >= new Date(filters.dateFrom));
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(m => new Date(m.timestamp) <= new Date(filters.dateTo));
    }
    
    setFilteredMovements(filtered);
  };

  const fetchMovements = async () => {
    try {
      const response = await api.get('/inventory/stock-movements/');
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get('/inventory/items/');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const getMovementTypeColor = (type: string) => {
    const colors = {
      INITIAL: 'bg-blue-100 text-blue-700',
      PURCHASE: 'bg-green-100 text-green-700',
      ISSUE: 'bg-orange-100 text-orange-700',
      RETURN: 'bg-purple-100 text-purple-700',
      ADJUSTMENT: 'bg-gray-100 text-gray-700',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getMovementTypeLabel = (type: string) => {
    const labels = {
      INITIAL: 'Initial Stock',
      PURCHASE: 'Purchase',
      ISSUE: 'Issue',
      RETURN: 'Return',
      ADJUSTMENT: 'Adjustment',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <AdminLayout
      title="Stock Movements"
      subtitle="Track all inventory movements and transactions"
      activePath="/admin/inventory/movements"
      onSearch={(q) => console.log('Search movements:', q)}
    >
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          {[
            { label: 'Total Movements', value: movements.length, color: 'blue' },
            { label: 'Initial Stock', value: movements.filter(m => m.movement_type === 'INITIAL').length, color: 'blue' },
            { label: 'Purchases', value: movements.filter(m => m.movement_type === 'PURCHASE').length, color: 'green' },
            { label: 'Issues', value: movements.filter(m => m.movement_type === 'ISSUE').length, color: 'orange' },
            { label: 'Returns', value: movements.filter(m => m.movement_type === 'RETURN').length, color: 'purple' },
          ].map((stat, index) => {
            const colorClasses = {
              blue: { bg: 'bg-blue-50', valueColor: 'text-blue-700' },
              green: { bg: 'bg-green-50', valueColor: 'text-green-700' },
              orange: { bg: 'bg-orange-50', valueColor: 'text-orange-700' },
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

        {/* Movements Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Stock Movements</h2>
                <Link
                  href="/admin/inventory/movements/create"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Movement
                </Link>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type</label>
                  <select
                    value={filters.movement_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, movement_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="INITIAL">Initial Stock</option>
                    <option value="PURCHASE">Purchase</option>
                    <option value="ISSUE">Issue</option>
                    <option value="RETURN">Return</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                  <select
                    value={filters.item_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, item_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Items</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.item_code} - {item.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading movements...</div>
            ) : filteredMovements.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No movements found matching your filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Item</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Quantity</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Balance Before</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Balance After</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Reference</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.map((movement) => (
                      <tr key={movement.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6 text-gray-700">
                          {new Date(movement.timestamp).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{movement.item_name}</p>
                            <p className="text-sm text-gray-500">{movement.item_code}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(movement.movement_type)}`}>
                            {getMovementTypeLabel(movement.movement_type)}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </td>
                        <td className="py-4 px-6 text-gray-700">{movement.balance_before}</td>
                        <td className="py-4 px-6 font-medium text-gray-900">{movement.balance_after}</td>
                        <td className="py-4 px-6 text-gray-700">
                          <div>
                            <p className="text-sm">{movement.reference_type}</p>
                            <p className="text-xs text-gray-500">{movement.reference}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700">{movement.performed_by_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>
    </AdminLayout>
  );
}
