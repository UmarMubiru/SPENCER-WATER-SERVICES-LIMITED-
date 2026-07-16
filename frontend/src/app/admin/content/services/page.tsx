'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/services/');
      if (response.ok) {
        const data = await response.json();
        setServices(data.sort((a: Service, b: Service) => a.display_order - b.display_order));
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${selectedService.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setShowEditModal(false);
        setSelectedService(null);
        setFormData({ name: '', slug: '', description: '', icon: '', is_active: true, display_order: 0 });
        fetchServices();
      } else {
        alert('Error updating service');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error updating service');
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${service.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !service.is_active }),
      });
      
      if (response.ok) {
        fetchServices();
      } else {
        alert('Error updating service status');
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      alert('Error updating service status');
    }
  };

  const handleReorder = async (serviceId: string, newOrder: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: newOrder }),
      });
      
      if (response.ok) {
        fetchServices();
      } else {
        alert('Error reordering service');
      }
    } catch (error) {
      console.error('Error reordering service:', error);
      alert('Error reordering service');
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      slug: service.slug,
      description: service.description,
      icon: service.icon || '',
      is_active: service.is_active,
      display_order: service.display_order,
    });
    setShowEditModal(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/content/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Services Catalogue"
          subtitle="Manage the 7 service lines offered by Spencer Water Services"
          onSearch={(q) => console.log('Search services:', q)}
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              { label: 'Total Services', value: services.length, color: 'blue' },
              { label: 'Active Services', value: services.filter(s => s.is_active).length, color: 'green' },
              { label: 'Inactive Services', value: services.filter(s => !s.is_active).length, color: 'gray' },
            ].map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', valueColor: 'text-green-700' },
                gray: { bg: 'bg-gray-50', valueColor: 'text-gray-700' },
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

          {/* Services List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Service Lines</h2>
                <p className="text-sm text-gray-600">Drag to reorder services on the website</p>
              </div>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No services found.</div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => index > 0 && handleReorder(service.id, index - 1)}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            ↑
                          </button>
                          <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                          <button
                            onClick={() => index < services.length - 1 && handleReorder(service.id, index + 1)}
                            disabled={index === services.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            ↓
                          </button>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {service.icon && (
                              <span className="text-2xl">{service.icon}</span>
                            )}
                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {service.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                          <p className="text-xs text-gray-500">Slug: /{service.slug}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(service)}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(service)}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              service.is_active 
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {service.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Service Modal */}
      {showEditModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Service</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateService}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g., 💧"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.is_active.toString()}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
