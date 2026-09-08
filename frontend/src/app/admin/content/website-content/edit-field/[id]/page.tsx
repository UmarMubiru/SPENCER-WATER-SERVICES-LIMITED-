'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { AdminLayout } from '../../../../components/AdminLayout';

interface PageField {
  id: number;
  page: string;
  key: string;
  label: string;
  field_type: string;
  value: string;
  display_order: number;
  updated_at: string;
}

export default function EditFieldPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const [field, setField] = useState<PageField | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldId = params.id as string;

  useEffect(() => {
    loadField();
  }, [fieldId]);

  const loadField = async () => {
    if (!token) {
      console.error('No token available');
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    console.log('Loading field with ID:', fieldId);
    console.log('Token available:', !!token);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/core-pages/page-fields/${fieldId}/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Field data loaded:', data);
        setField(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to load field:', errorText);
        setError(`Failed to load field (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Error loading field:', err);
      setError('Error loading field. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!field || !token) return;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/core-pages/page-fields/${fieldId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(field),
      });

      if (response.ok) {
        const data = await response.json();
        setField(data);
        router.back();
      } else {
        setError('Failed to save field');
      }
    } catch (err) {
      setError('Error saving field');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Edit Field"
        subtitle="Loading..."
        activePath="/admin/content/website-content"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading field...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !field) {
    return (
      <AdminLayout
        title="Edit Field"
        subtitle="Error loading field"
        activePath="/admin/content/website-content"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          {error || 'Field not found'}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Edit Field"
      subtitle={`Editing: ${field.label}`}
      activePath="/admin/content/website-content"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Field</h1>
            <p className="text-sm text-gray-500">{field.label}</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="border-b border-blue-100 p-6 bg-blue-50">
            <h2 className="text-xl font-semibold text-blue-900">Field Details</h2>
            <p className="text-sm text-blue-400 mt-1">Edit the field properties and content below</p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Key</label>
                <input
                  type="text"
                  value={field.key}
                  disabled
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-blue-50 text-blue-600 cursor-not-allowed"
                />
                <p className="text-xs text-blue-400 mt-1">Unique identifier (cannot be changed)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Page</label>
                <input
                  type="text"
                  value={field.page}
                  disabled
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-blue-50 text-blue-600 cursor-not-allowed"
                />
                <p className="text-xs text-blue-400 mt-1">Page this field belongs to</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Label</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => setField({ ...field, label: e.target.value })}
                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. Hero Headline"
              />
              <p className="text-xs text-blue-400 mt-1">Human-readable name shown in admin</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Field Type</label>
              <select
                value={field.field_type}
                onChange={(e) => setField({ ...field, field_type: e.target.value })}
                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="text">Short Text</option>
                <option value="richtext">Paragraph</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Value</label>
              {field.field_type === 'richtext' ? (
                <textarea
                  value={field.value}
                  onChange={(e) => setField({ ...field, value: e.target.value })}
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows={6}
                  placeholder="Enter paragraph content..."
                />
              ) : (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => setField({ ...field, value: e.target.value })}
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter text value..."
                />
              )}
              <p className="text-xs text-blue-400 mt-1">The actual content displayed on the website</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Display Order</label>
              <input
                type="number"
                value={field.display_order}
                onChange={(e) => setField({ ...field, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-blue-400 mt-1">Lower numbers appear first in the list</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-blue-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-blue-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Field Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Field Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-400">Field ID:</span>
              <span className="ml-2 text-blue-700">{field.id}</span>
            </div>
            <div>
              <span className="text-blue-400">Last Updated:</span>
              <span className="ml-2 text-blue-700">
                {new Date(field.updated_at).toLocaleDateString()} at {new Date(field.updated_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
