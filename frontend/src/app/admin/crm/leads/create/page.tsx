'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import Link from 'next/link';

interface Employee {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

const SERVICE_CHOICES = [
  { id: 'borehole_drilling', label: 'Borehole Drilling' },
  { id: 'solar_pump_installation', label: 'Solar Pump Installation' },
  { id: 'water_treatment', label: 'Water Treatment' },
  { id: 'pipeline_extension', label: 'Pipeline Extension' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'water_storage', label: 'Water Storage' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'other', label: 'Other' },
];

const BUDGET_CHOICES = [
  { id: 'under_10m', label: 'Under 10M' },
  { id: '10_50m', label: '10–50M' },
  { id: '50_100m', label: '50–100M' },
  { id: '100m_plus', label: '100M+' },
  { id: 'not_sure', label: 'Not Sure' },
];

const TIMELINE_CHOICES = [
  { id: 'urgent', label: 'Urgent' },
  { id: '1_month', label: '1 Month' },
  { id: '3_months', label: '3 Months' },
  { id: 'flexible', label: 'Flexible' },
];

const SOURCE_CHOICES = [
  { id: 'website', label: 'Website' },
  { id: 'referral', label: 'Referral' },
  { id: 'social_media', label: 'Social Media' },
  { id: 'advertisement', label: 'Advertisement' },
  { id: 'other', label: 'Other' },
];

export default function CreateLeadPage() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    company: '',
    phone: '',
    email: '',
    preferred_contact: '',
    district: '',
    subcounty: '',
    village: '',
    address: '',
    gps: '',
    service: 'borehole_drilling',
    description: '',
    budget_range: '',
    timeline: '',
    source: 'website',
    assigned_to: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/employees/');
      if (response.ok) {
        const data = await response.json();
        setEmployees(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/quotations/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/admin/crm/leads/${data.id}`;
      } else {
        const error = await response.json();
        alert('Error creating lead: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Error creating lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Create Lead"
      subtitle="Add new lead to the system"
      activePath="/admin/crm/leads"
      onSearch={() => {}}
    >
      <div className="p-6">
        {/* Back Button */}
        <Link
          href="/admin/crm/leads"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          ← Back to Leads
        </Link>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lead Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">Customer Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+256..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact</label>
                <input
                  type="text"
                  name="preferred_contact"
                  value={formData.preferred_contact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Phone, Email, WhatsApp, etc."
                />
              </div>

              {/* Location Information */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">Project Location</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter district"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub County</label>
                <input
                  type="text"
                  name="subcounty"
                  value={formData.subcounty}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter sub county"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter village"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPS Coordinates</label>
                <input
                  type="text"
                  name="gps"
                  value={formData.gps}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Lat, Long"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Physical Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full physical address"
                />
              </div>

              {/* Service Details */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">Service Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service *</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SERVICE_CHOICES.map(choice => (
                    <option key={choice.id} value={choice.id}>{choice.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                <select
                  name="budget_range"
                  value={formData.budget_range}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select budget range</option>
                  {BUDGET_CHOICES.map(choice => (
                    <option key={choice.id} value={choice.id}>{choice.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select timeline</option>
                  {TIMELINE_CHOICES.map(choice => (
                    <option key={choice.id} value={choice.id}>{choice.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source *</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SOURCE_CHOICES.map(choice => (
                    <option key={choice.id} value={choice.id}>{choice.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the customer's requirements"
                />
              </div>

              {/* Assignment */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">Assignment</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                <select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select employee to assign</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name && employee.last_name 
                        ? `${employee.first_name} ${employee.last_name}` 
                        : employee.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end gap-3">
              <Link
                href="/admin/crm/leads"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? 'Creating...' : 'Create Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
