'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  category: string;
  quantity: number;
  reorder_level: number;
  unit: string;
  unit_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function InventoryDashboardPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Items', value: '0', change: 'Loading...', color: 'blue' },
    { label: 'In Stock', value: '0', change: 'Loading...', color: 'green' },
    { label: 'Low Stock', value: '0', change: 'Loading...', color: 'red' },
    { label: 'Categories', value: '0', change: 'Loading...', color: 'blue' },
  ]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, filters]);

  const applyFilters = () => {
    let filtered = [...inventory];
    
    if (filters.status) {
      filtered = filtered.filter(item => {
        if (filters.status === 'low_stock') return item.quantity <= item.reorder_level;
        if (filters.status === 'in_stock') return item.quantity > item.reorder_level;
        return true;
      });
    }
    
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(item => new Date(item.created_at) >= new Date(filters.dateFrom));
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(item => new Date(item.created_at) <= new Date(filters.dateTo));
    }
    
    setFilteredInventory(filtered);
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/items/');
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
        
        // Calculate stats
        const total = data.length;
        const inStock = data.filter((item: InventoryItem) => item.quantity > item.reorder_level).length;
        const lowStock = data.filter((item: InventoryItem) => item.quantity <= item.reorder_level).length;
        const categories = [...new Set(data.map((item: InventoryItem) => item.category))].length;
        
        setStats([
          { label: 'Total Items', value: total.toString(), change: `${total} items tracked`, color: 'blue' },
          { label: 'In Stock', value: inStock.toString(), change: 'Above reorder level', color: 'green' },
          { label: 'Low Stock', value: lowStock.toString(), change: 'Needs attention', color: 'red' },
          { label: 'Categories', value: categories.toString(), change: 'Product categories', color: 'blue' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/items/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchInventory(); // Refresh the list
      } else {
        alert('Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/inventory/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Inventory Management"
          subtitle="Track stock levels, suppliers, and purchase orders"
          onSearch={(q) => console.log('Search inventory:', q)}
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', valueColor: 'text-green-700' },
                red: { bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700' },
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses];
              
              return (
                <div 
                  key={index} 
                  className={`${colors.bg} rounded-xl p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow`}
                  onClick={() => {
                    // Click handler for cards
                    if (stat.label === 'Low Stock') {
                      setFilters(prev => ({ ...prev, status: 'low_stock' }));
                    } else if (stat.label === 'In Stock') {
                      setFilters(prev => ({ ...prev, status: 'in_stock' }));
                    } else {
                      // Reset filters for other cards
                      setFilters({ status: '', category: '', dateFrom: '', dateTo: '' });
                    }
                  }}
                >
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colors.valueColor} mb-1`}>{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
              );
            })}
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Inventory Items</h2>
                <div className="flex gap-3">
                  <Link href="/admin/inventory/movements" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Stock Movements
                  </Link>
                  <Link href="/admin/inventory/suppliers" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Suppliers
                  </Link>
                  <Link href="/admin/inventory/quotations" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    Quotations
                  </Link>
                  <Link href="/admin/inventory/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    + Add Item
                  </Link>
                </div>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {[...new Set(inventory.map(item => item.category))].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
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
              <div className="p-6 text-center text-gray-500">Loading inventory...</div>
            ) : filteredInventory.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No inventory items found matching your filters.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Code</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Unit</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Reorder Level</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-gray-900">{item.item_code}</td>
                      <td className="py-4 px-6 text-gray-700">{item.name}</td>
                      <td className="py-4 px-6 text-gray-700">{item.category}</td>
                      <td className="py-4 px-6 font-medium text-gray-900">{item.quantity}</td>
                      <td className="py-4 px-6 text-gray-700">{item.unit}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.quantity <= item.reorder_level ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {item.quantity <= item.reorder_level ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{item.reorder_level}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-3">
                          <Link href={`/admin/inventory/details/${item.id}`} className="text-blue-600 hover:text-blue-800 font-medium">View</Link>
                          <Link href={`/admin/inventory/edit/${item.id}`} className="text-green-600 hover:text-green-800 font-medium">Edit</Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
