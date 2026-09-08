'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateTemporaryEmployeePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    skills: '',
    hourly_rate: '',
    currency: 'UGX',
    department: '',
    joining_date: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/departments/');
      if (response.ok) {
        const data = await response.json();
        setDepartments(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (fetchError) {
      console.error('Error fetching departments:', fetchError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        department: formData.department,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      };

      const response = await fetch('http://127.0.0.1:8000/api/temporary-employees/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Temporary employee created successfully!');
        window.location.href = '/admin/employees/casual';
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create employee');
      }
    } catch (error) {
      setError('Failed to create employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AdminLayout title="Create Temporary Employee" subtitle="Add a new temporary staff member" activePath="/admin/employees/temporary">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID *</label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="TEMP-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="+256 700 123 456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone</label>
                  <input
                    type="text"
                    name="emergency_phone"
                    value={formData.emergency_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="+256 700 123 456"
                  />
                </div>
              </div>
            </div>

            {/* Skills and Rate */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills and Rate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Plumbing, Electrical, Site Supervision (comma-separated)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="15000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="UGX">UGX</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Department Allocation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Allocation</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employment Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="active">Active (Available for Assignment)</option>
                    <option value="assigned">Assigned (Currently on Project)</option>
                    <option value="not_active">Not Active</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link
                href="/admin/employees/casual"
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {loading ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
