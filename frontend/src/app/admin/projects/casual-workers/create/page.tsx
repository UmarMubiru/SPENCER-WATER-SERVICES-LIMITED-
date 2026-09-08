'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import CountryCodeSelector from '@/components/CountryCodeSelector';

function CreateCasualWorkerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    project: '',
    full_name: '',
    phone: '',
    next_of_kin: '',
    payment_type: 'piece_rate',
    rate: '',
  });
  const [countryCode, setCountryCode] = useState('256');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
    const projectId = searchParams.get('project');
    if (projectId) {
      setFormData(prev => ({ ...prev, project: projectId }));
    }
  }, [searchParams]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('project', formData.project);
      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('phone', `+${countryCode}${formData.phone}`);
      formDataToSend.append('next_of_kin', formData.next_of_kin);
      formDataToSend.append('payment_type', formData.payment_type);
      formDataToSend.append(
        formData.payment_type === 'piece_rate' ? 'piece_rate' : 'daily_rate',
        formData.rate,
      );

      const response = await fetch('http://127.0.0.1:8000/api/projects/casual_workers/', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Casual worker created successfully!');
        router.back();
      } else {
        const errorBody = await response.text();
        try {
          const errorData = JSON.parse(errorBody);
          setError(errorData.detail || 'Failed to create casual worker');
        } catch {
          setError(`Failed to create casual worker (server returned ${response.status}).`);
        }
      }
    } catch (err) {
      console.error('Error creating casual worker:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Create Casual Worker" subtitle="Add a new casual worker to a project" activePath="/admin/projects">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/admin/projects" className="inline-flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Casual Worker Information</h2>
              <p className="text-sm text-gray-600 mt-1">Fill in the details below to add a new casual worker</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
                  <select
                    value={formData.project}
                    onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.project_reference})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <div className="flex">
                    <CountryCodeSelector
                      value={countryCode}
                      onChange={setCountryCode}
                    />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      className="flex-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="700 123 456"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next of Kin *</label>
                  <input
                    type="text"
                    value={formData.next_of_kin}
                    onChange={(e) => setFormData(prev => ({ ...prev, next_of_kin: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter next of kin's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="piece_rate">Piece Rate (per completed piece)</option>
                    <option value="daily_rate">Daily Rate (per day)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.payment_type === 'piece_rate' ? 'Rate per Piece (UGX) *' : 'Daily Rate (UGX) *'}
                  </label>
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter payment rate"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Creating...' : 'Create Casual Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function CreateCasualWorkerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateCasualWorkerContent />
    </Suspense>
  );
}
