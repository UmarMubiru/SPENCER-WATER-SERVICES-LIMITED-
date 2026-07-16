'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';

interface WebsiteImage {
  id: string;
  page_type: string;
  section_name: string;
  section_type: string;
  section_order: number;
  content: string;
  image: string | null;
  image_url: string | null;
  image_source: string;
  alt_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PAGE_TYPES = [
  { value: 'HOME', label: 'Home' },
  { value: 'ABOUT_US', label: 'About Us' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'CONTACT', label: 'Contact' },
  { value: 'PROJECTS', label: 'Projects' },
  { value: 'BLOG', label: 'Blog' },
  { value: 'QUOTATIONS', label: 'Quotations' },
];

const SECTION_TYPES_BY_PAGE: Record<string, Array<{value: string, label: string}>> = {
  HOME: [
    { value: 'HERO', label: 'Hero Section' },
    { value: 'FEATURE', label: 'Feature Section' },
    { value: 'BACKGROUND', label: 'Background' },
    { value: 'BANNER', label: 'Banner' },
  ],
  ABOUT_US: [
    { value: 'HERO', label: 'Hero Section' },
    { value: 'FEATURE', label: 'Feature Section' },
    { value: 'BACKGROUND', label: 'Background' },
    { value: 'TEAM', label: 'Team Section' },
    { value: 'VALUES', label: 'Values Section' },
  ],
  SERVICES: [
    { value: 'HERO', label: 'Hero Section' },
    { value: 'FEATURE', label: 'Feature Section' },
    { value: 'BACKGROUND', label: 'Background' },
    { value: 'SERVICE_ICON', label: 'Service Icon' },
  ],
  CONTACT: [
    { value: 'HERO', label: 'Hero Section' },
    { value: 'BACKGROUND', label: 'Background' },
    { value: 'MAP', label: 'Map Section' },
    { value: 'CONTACT_INFO', label: 'Contact Info' },
  ],
  PROJECTS: [
    { value: 'HERO', label: 'Hero Section' },
    { value: 'GALLERY', label: 'Gallery' },
    { value: 'THUMBNAIL', label: 'Thumbnail' },
    { value: 'FEATURE', label: 'Feature Section' },
  ],
  BLOG: [
    { value: 'HERO', label: 'Hero Section' },
    { value: 'THUMBNAIL', label: 'Thumbnail' },
    { value: 'FEATURE', label: 'Feature Section' },
    { value: 'BACKGROUND', label: 'Background' },
  ],
  QUOTATIONS: [
    { value: 'HERO', label: 'Hero Section' },
    { value: 'BACKGROUND', label: 'Background' },
    { value: 'FEATURE', label: 'Feature Section' },
  ],
};

export default function WebsiteImagesPage() {
  const [images, setImages] = useState<WebsiteImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<WebsiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<WebsiteImage | null>(null);
  const [filters, setFilters] = useState({
    page_type: '',
    section_type: '',
  });
  
  const [formData, setFormData] = useState({
    page_type: 'HOME',
    section_name: '',
    section_type: 'HERO',
    section_order: 0,
    content: '',
    image: null as File | null,
    image_url: '',
    alt_text: '',
    is_active: true,
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [images, filters]);

  const applyFilters = () => {
    let filtered = [...images];
    
    if (filters.page_type) {
      filtered = filtered.filter(img => img.page_type === filters.page_type);
    }
    
    if (filters.section_type) {
      filtered = filtered.filter(img => img.section_type === filters.section_type);
    }
    
    setFilteredImages(filtered);
  };

  const fetchImages = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/website-images/');
      if (response.ok) {
        const data = await response.json();
        setImages(Array.isArray(data) ? data : []);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('page_type', formData.page_type);
      formDataToSend.append('section_name', formData.section_name);
      formDataToSend.append('section_type', formData.section_type);
      formDataToSend.append('section_order', formData.section_order.toString());
      formDataToSend.append('content', formData.content);
      formDataToSend.append('alt_text', formData.alt_text);
      formDataToSend.append('is_active', formData.is_active.toString());
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      if (formData.image_url) {
        formDataToSend.append('image_url', formData.image_url);
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/website-images/', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchImages();
      } else {
        alert('Error creating website image');
      }
    } catch (error) {
      console.error('Error creating website image:', error);
      alert('Error creating website image');
    }
  };

  const handleUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('page_type', formData.page_type);
      formDataToSend.append('section_name', formData.section_name);
      formDataToSend.append('section_type', formData.section_type);
      formDataToSend.append('section_order', formData.section_order.toString());
      formDataToSend.append('content', formData.content);
      formDataToSend.append('alt_text', formData.alt_text);
      formDataToSend.append('is_active', formData.is_active.toString());
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      if (formData.image_url) {
        formDataToSend.append('image_url', formData.image_url);
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/website-images/${selectedImage.id}/`, {
        method: 'PUT',
        body: formDataToSend,
      });
      
      if (response.ok) {
        setShowEditModal(false);
        setSelectedImage(null);
        resetForm();
        fetchImages();
      } else {
        alert('Error updating website image');
      }
    } catch (error) {
      console.error('Error updating website image:', error);
      alert('Error updating website image');
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this website image?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/website-images/${id}/`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchImages();
      } else {
        alert('Error deleting website image');
      }
    } catch (error) {
      console.error('Error deleting website image:', error);
      alert('Error deleting website image');
    }
  };

  const openEditModal = (image: WebsiteImage) => {
    setSelectedImage(image);
    setFormData({
      page_type: image.page_type,
      section_name: image.section_name,
      section_type: image.section_type,
      section_order: image.section_order,
      content: image.content,
      image: null,
      image_url: image.image_url || '',
      alt_text: image.alt_text,
      is_active: image.is_active,
    });
    setImagePreview(image.image_source || '');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      page_type: 'HOME',
      section_name: '',
      section_type: 'BACKGROUND',
      section_order: 0,
      content: '',
      image: null,
      image_url: '',
      alt_text: '',
      is_active: true,
    });
    setImagePreview('');
  };

  const getPageTypeLabel = (type: string) => {
    return PAGE_TYPES.find(t => t.value === type)?.label || type;
  };

  const getSectionTypeLabel = (type: string) => {
    const allSectionTypes = Object.values(SECTION_TYPES_BY_PAGE).flat();
    return allSectionTypes.find(t => t.value === type)?.label || type;
  };

  const getSectionTypesForPage = (pageType: string) => {
    return SECTION_TYPES_BY_PAGE[pageType] || SECTION_TYPES_BY_PAGE['HOME'];
  };

  const getAllSectionTypes = (): Array<{value: string, label: string}> => {
    const allTypes = new Set<string>();
    Object.values(SECTION_TYPES_BY_PAGE).forEach(types => {
      types.forEach(type => allTypes.add(type.value));
    });
    return Array.from(allTypes).map(value => {
      const allSectionTypes = Object.values(SECTION_TYPES_BY_PAGE).flat();
      const found = allSectionTypes.find(t => t.value === value);
      return found || { value, label: value };
    });
  };

  return (
    <AdminLayout
      title="Website Images"
      subtitle="Manage images for website pages and sections"
      activePath="/admin/content/website-images"
      onSearch={() => {}}
    >
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Total Images', value: images.length, color: 'blue' },
            { label: 'Home Page', value: images.filter(i => i.page_type === 'HOME').length, color: 'green' },
            { label: 'Services Page', value: images.filter(i => i.page_type === 'SERVICES').length, color: 'amber' },
            { label: 'Active', value: images.filter(i => i.is_active).length, color: 'purple' },
          ].map((stat, index) => {
            const colorClasses = {
              blue: { bg: 'bg-blue-50', valueColor: 'text-blue-700' },
              green: { bg: 'bg-green-50', valueColor: 'text-green-700' },
              amber: { bg: 'bg-amber-50', valueColor: 'text-amber-700' },
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

        {/* Images Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Website Images</h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Image
              </button>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Type</label>
                <select
                  value={filters.page_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, page_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Pages</option>
                  {PAGE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
                <select
                  value={filters.section_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, section_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sections</option>
                  {getAllSectionTypes().map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading website images...</div>
          ) : filteredImages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No website images found matching your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Preview</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Page</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Section</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Section Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredImages.map((image) => (
                    <tr key={image.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        {image.image_source ? (
                          <img 
                            src={image.image_source} 
                            alt={image.alt_text || 'Preview'} 
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-700">{getPageTypeLabel(image.page_type)}</td>
                      <td className="py-4 px-6 text-gray-700">{getSectionTypeLabel(image.section_type)}</td>
                      <td className="py-4 px-6 text-gray-700">{image.section_name}</td>
                      <td className="py-4 px-6 text-gray-700">Order: {image.section_order}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          image.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {image.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(image)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
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
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Website Image</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateImage}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Type *</label>
                    <select
                      value={formData.page_type}
                      onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {PAGE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Type *</label>
                    <select
                      value={formData.section_type}
                      onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getSectionTypesForPage(formData.page_type).map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Name *</label>
                  <input
                    type="text"
                    value={formData.section_name}
                    onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                    required
                    placeholder="e.g., Hero Section, About Section"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Order</label>
                    <input
                      type="number"
                      value={formData.section_order}
                      onChange={(e) => setFormData({ ...formData, section_order: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={2}
                    placeholder="Optional text content for this section"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded border border-gray-200" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    placeholder="Alt text for accessibility"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Website Image</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateImage}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Type *</label>
                    <select
                      value={formData.page_type}
                      onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {PAGE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Type *</label>
                    <select
                      value={formData.section_type}
                      onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getSectionTypesForPage(formData.page_type).map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Name *</label>
                  <input
                    type="text"
                    value={formData.section_name}
                    onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                    required
                    placeholder="e.g., Hero Section, About Section"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Order</label>
                    <input
                      type="number"
                      value={formData.section_order}
                      onChange={(e) => setFormData({ ...formData, section_order: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={2}
                    placeholder="Optional text content for this section"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded border border-gray-200" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    placeholder="Alt text for accessibility"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                  Update Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
