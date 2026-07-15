'use client';

import React, { useState } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import Link from 'next/link';

export default function AddProjectPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    client_name: '',
    location: '',
    completion_date: '',
    project_type: '',
    cover_image: '' as string | File,
    images: [] as (string | File)[],
    is_featured: false,
    is_active: true,
    display_order: 0,
  });
  
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, cover_image: file });
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...formData.images, ...files];
      const newPreviews = [...additionalImagePreviews, ...files.map(file => URL.createObjectURL(file))];
      setFormData({ ...formData, images: newImages });
      setAdditionalImagePreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = additionalImagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setAdditionalImagePreviews(newPreviews);
  };

  const handleRemoveCoverImage = () => {
    setFormData({ ...formData, cover_image: '' });
    setCoverImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('client_name', formData.client_name);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('completion_date', formData.completion_date);
      formDataToSend.append('project_type', formData.project_type);
      formDataToSend.append('is_featured', formData.is_featured.toString());
      formDataToSend.append('is_active', formData.is_active.toString());
      formDataToSend.append('display_order', formData.display_order.toString());
      
      if (formData.cover_image instanceof File) {
        formDataToSend.append('cover_image', formData.cover_image);
      }
      
      formData.images.forEach((image) => {
        if (image instanceof File) {
          formDataToSend.append('images', image);
        }
      });
      
      const response = await fetch('http://127.0.0.1:8000/api/content/portfolio/', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (response.ok) {
        alert('Project created successfully!');
        window.location.href = '/admin/content/portfolio';
      } else {
        alert('Error creating project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project');
    }
  };

  return (
    <AdminLayout
      title="Add New Project"
      subtitle="Create a new portfolio project"
      activePath="/admin/content/portfolio"
      onSearch={() => {}}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/admin/content/portfolio"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          ← Back to Portfolio
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Project Information</h2>
            <p className="text-blue-100 text-sm">Fill in the details below to add a new portfolio project</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    placeholder="Enter project title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    placeholder="project-url-slug"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    placeholder="Enter project description"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Project Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name *</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      required
                      placeholder="Client company name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      placeholder="Project location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Completion Date *</label>
                    <input
                      type="date"
                      value={formData.completion_date}
                      onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Project Type *</label>
                    <input
                      type="text"
                      value={formData.project_type}
                      onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                      required
                      placeholder="e.g., Water Supply, Installation"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Images</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  {coverImagePreview && (
                    <div className="mt-2 relative">
                      <img src={coverImagePreview} alt="Cover preview" className="w-full h-48 object-cover rounded border border-gray-200" />
                      <button
                        type="button"
                        onClick={handleRemoveCoverImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  {additionalImagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {additionalImagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <img src={preview} alt={`Preview ${idx}`} className="w-20 h-20 object-cover rounded border border-gray-200" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured Project</span>
                    </label>
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <Link
                href="/admin/content/portfolio"
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
