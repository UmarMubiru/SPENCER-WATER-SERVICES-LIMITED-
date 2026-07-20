'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { useRouter } from 'next/navigation';

interface Document {
  file: File;
  document_type: string;
  caption: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    service_line: 'borehole_drilling',
    scope_description: '',
    site_location: '',
    contract_value: '',
    planned_start_date: '',
    planned_end_date: '',
    status: 'not_started',
    completion_percentage: 0,
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const serviceOptions = [
    { value: 'borehole_drilling', label: 'Borehole Drilling' },
    { value: 'solar_pump_installation', label: 'Solar Pump Installation' },
    { value: 'solar_power_taps', label: 'Solar Power Taps' },
    { value: 'water_pipe_laying', label: 'Water Pipe Laying' },
    { value: 'water_treatment', label: 'Water Treatment' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  const statusOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const documentTypeOptions = [
    { value: 'project_image', label: 'Project Image' },
    { value: 'project_documents', label: 'Project Documents' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Add project fields
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        formDataToSend.append(key, String(value));
      });
      
      // Add documents
      documents.forEach((doc, index) => {
        formDataToSend.append(`documents[${index}].file`, doc.file);
        formDataToSend.append(`documents[${index}].document_type`, doc.document_type);
        formDataToSend.append(`documents[${index}].caption`, doc.caption);
      });

      const response = await fetch('http://127.0.0.1:8000/api/projects/', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Project created successfully!\nReference: ${data.project_reference}`);
        router.push('/admin/projects/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create project');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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

  const handleDocumentChange = (index: number, field: keyof Document, value: string) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index] = { ...updatedDocuments[index], [field]: value };
    setDocuments(updatedDocuments);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, JPG, JPEG, and PNG files are allowed.');
        return;
      }
      
      const updatedDocuments = [...documents];
      updatedDocuments[index] = { ...updatedDocuments[index], file };
      setDocuments(updatedDocuments);
    }
  };

  const addDocument = () => {
    setDocuments([...documents, { file: null as any, document_type: 'other', caption: '' }]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/projects/create" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Create New Project"
          subtitle="Fill in the details to create a new project"
          onSearch={(q) => console.log('Search:', q)}
        />

        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Project Information</h2>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 mb-4 mx-6 mt-6 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter project name"
                  />
                </div>

                {/* Service Line */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Line *
                  </label>
                  <select
                    name="service_line"
                    value={formData.service_line}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {serviceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Site Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Location
                  </label>
                  <input
                    type="text"
                    name="site_location"
                    value={formData.site_location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter site location"
                  />
                </div>

                {/* Contract Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Value (UGX)
                  </label>
                  <input
                    type="number"
                    name="contract_value"
                    value={formData.contract_value}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                {/* Planned Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planned Start Date
                  </label>
                  <input
                    type="date"
                    name="planned_start_date"
                    value={formData.planned_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Planned End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planned End Date
                  </label>
                  <input
                    type="date"
                    name="planned_end_date"
                    value={formData.planned_end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Completion Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="completion_percentage"
                    value={formData.completion_percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Scope Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scope Description
                </label>
                <textarea
                  name="scope_description"
                  value={formData.scope_description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Describe the project scope and objectives..."
                />
              </div>

              {/* Documents Section */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                  <button
                    type="button"
                    onClick={addDocument}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    + Add Document
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    No documents added. Click "Add Document" to upload files.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                              <select
                                value={doc.document_type}
                                onChange={(e) => handleDocumentChange(index, 'document_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {documentTypeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                              <div className="relative">
                                <input
                                  type="file"
                                  id={`file-${index}`}
                                  onChange={(e) => handleFileChange(index, e)}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => document.getElementById(`file-${index}`)?.click()}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  {doc.file ? doc.file.name : 'Choose a file'}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                              <input
                                type="text"
                                value={doc.caption}
                                onChange={(e) => handleDocumentChange(index, 'caption', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Document description..."
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="ml-4 text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        {doc.file && (
                          <p className="text-sm text-gray-600">
                            Selected: {doc.file.name} ({(doc.file.size / 1024).toFixed(2)} KB)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/projects/dashboard')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
