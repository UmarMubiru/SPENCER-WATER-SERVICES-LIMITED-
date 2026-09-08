'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Topbar } from '../../../components/Topbar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProjectDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    document_type: 'site_photo',
    caption: '',
    file: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        setProjectId(id);
        setLoading(false);
      } catch (err) {
        setError('Failed to initialize form');
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('project', projectId);
      formDataToSend.append('document_type', formData.document_type);
      formDataToSend.append('caption', formData.caption);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      console.log('Uploading document with data:', {
        project: projectId,
        document_type: formData.document_type,
        caption: formData.caption,
        hasFile: !!formData.file,
        fileName: formData.file?.name
      });

      const response = await fetch('http://127.0.0.1:8000/api/projects/documents/', {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        router.push(`/admin/projects/details/${projectId}`);
      } else {
        setError(responseData.detail || JSON.stringify(responseData) || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0],
      });
    }
  };

  const documentTypeOptions = [
    { value: 'site_photo', label: 'Site Photo' },
    { value: 'completion_report', label: 'Completion Report' },
    { value: 'client_signoff', label: 'Client Sign-off' },
    { value: 'other', label: 'Other' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/projects" />
        <div className="flex-1 ml-64">
          <Topbar title="Upload Document" subtitle="Add a document to the project" onSearch={(q) => console.log('Search:', q)} />
          <div className="p-6">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/projects" />
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Upload Document"
            subtitle="Add a document to the project"
            onSearch={(q) => console.log('Search:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Document Information</h2>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {documentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                <input
                  type="text"
                  name="caption"
                  value={formData.caption}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {formData.file && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {formData.file.name}</p>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Link
                  href={`/admin/projects/details/${projectId}`}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
