'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

interface WebsiteImage {
  id: string;
  page: string;
  section: string;
  image_url: string;
  alt_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const WEBSITE_SECTIONS = {
  'Home': ['Hero Banner', 'About Section', 'Services Preview', 'Testimonials', 'Contact Section', 'Footer'],
  'About': ['Header Banner', 'About Content', 'Team Section', 'History Section', 'Values Section'],
  'Services': ['Header Banner', 'Water Supply', 'Installation', 'Maintenance', 'Emergency Services'],
  'Projects': ['Header Banner', 'Featured Projects', 'Project Gallery'],
  'Contact': ['Header Banner', 'Contact Form', 'Map Section', 'Office Location'],
  'Blog': ['Header Banner', 'Featured Posts'],
};

export default function WebsiteImagesPage() {
  const [images, setImages] = useState<WebsiteImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<WebsiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<WebsiteImage | null>(null);
  const [filters, setFilters] = useState({
    page: '',
    section: '',
  });
  
  const [formData, setFormData] = useState({
    page: 'Home',
    section: '',
    image_url: '',
    alt_text: '',
  });

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [images, filters]);

  useEffect(() => {
    // Reset section when page changes
    setFormData(prev => ({ ...prev, section: '' }));
  }, [formData.page]);

  const applyFilters = () => {
    let filtered = [...images];
    
    if (filters.page) {
      filtered = filtered.filter(i => i.page === filters.page);
    }
    
    if (filters.section) {
      filtered = filtered.filter(i => i.section === filters.section);
    }
    
    setFilteredImages(filtered);
  };

  const fetchImages = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/website-images/');
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/website-images/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setShowUploadModal(false);
        setFormData({ page: 'Home', section: '', image_url: '', alt_text: '' });
        fetchImages();
      } else {
        alert('Error uploading image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/website-images/${id}/`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchImages();
      } else {
        alert('Error deleting image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    }
  };

  const handleToggleActive = async (image: WebsiteImage) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/website-images/${image.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !image.is_active }),
      });
      
      if (response.ok) {
        fetchImages();
      } else {
        alert('Error updating image status');
      }
    } catch (error) {
      console.error('Error updating image status:', error);
      alert('Error updating image status');
    }
  };

  const openPreviewModal = (image: WebsiteImage) => {
    setSelectedImage(image);
    setShowPreviewModal(true);
  };

  const stats = [
    { label: 'Total Images', value: images.length, color: 'blue' },
    { label: 'Active Images', value: images.filter(i => i.is_active).length, color: 'green' },
    { label: 'Inactive Images', value: images.filter(i => !i.is_active).length, color: 'gray' },
    { label: 'Pages Covered', value: new Set(images.map(i => i.page)).size, color: 'purple' },
  ];

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/content/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Website Images"
          subtitle="Manage images for corporate website sections"
          onSearch={(q) => console.log('Search images:', q)}
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', valueColor: 'text-green-700' },
                gray: { bg: 'bg-gray-50', valueColor: 'text-gray-700' },
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

          {/* Images Grid */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Website Images</h2>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Upload Image
                </button>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                  <select
                    value={filters.page}
                    onChange={(e) => setFilters(prev => ({ ...prev, page: e.target.value, section: '' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Pages</option>
                    {Object.keys(WEBSITE_SECTIONS).map(page => (
                      <option key={page} value={page}>{page}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    value={filters.section}
                    onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                    disabled={!filters.page}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">All Sections</option>
                    {filters.page && WEBSITE_SECTIONS[filters.page as keyof typeof WEBSITE_SECTIONS]?.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading images...</div>
            ) : filteredImages.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No images found matching your filters.</div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredImages.map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-video bg-gray-100">
                        <img
                          src={image.image_url}
                          alt={image.alt_text}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openPreviewModal(image)}
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            image.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {image.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {image.page}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {image.section}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">{image.alt_text}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => openPreviewModal(image)}
                            className="flex-1 px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleToggleActive(image)}
                            className={`flex-1 px-3 py-1 rounded text-sm font-medium ${
                              image.is_active 
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {image.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(image.id)}
                            className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 text-sm font-medium"
                          >
                            Delete
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Website Image</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                  <select
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.keys(WEBSITE_SECTIONS).map(page => (
                      <option key={page} value={page}>{page}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select section</option>
                    {WEBSITE_SECTIONS[formData.page as keyof typeof WEBSITE_SECTIONS]?.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    required
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
                    required
                    placeholder="Description of the image for accessibility"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.alt_text}
                  className="w-full h-auto"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Page</p>
                  <p className="text-gray-900">{selectedImage.page}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Section</p>
                  <p className="text-gray-900">{selectedImage.section}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Alt Text</p>
                  <p className="text-gray-900">{selectedImage.alt_text}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedImage.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedImage.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Uploaded</p>
                  <p className="text-gray-900">{new Date(selectedImage.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-gray-900">{new Date(selectedImage.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
