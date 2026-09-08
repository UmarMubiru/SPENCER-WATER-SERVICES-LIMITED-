'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Topbar } from '../../../components/Topbar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImageIcon, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ProjectActivity {
  id: string;
  activity_name: string;
}

export default function ProjectGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    activity: '',
    caption: '',
    image: null as File | null,
    mediaLibraryUrl: null as string | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        setProjectId(id);
        
        const activitiesRes = await fetch(`http://127.0.0.1:8000/api/projects/activities/?project=${id}`);

        if (!activitiesRes.ok) throw new Error('Failed to fetch activities');

        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Check for selected media asset from media library
    const selectedAsset = sessionStorage.getItem('selectedMediaAsset');
    if (selectedAsset) {
      const asset = JSON.parse(selectedAsset);
      setFormData(prev => ({
        ...prev,
        mediaLibraryUrl: asset.url,
      }));
      sessionStorage.removeItem('selectedMediaAsset');
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('activity', formData.activity);
      formDataToSend.append('caption', formData.caption);
      
      if (formData.mediaLibraryUrl) {
        formDataToSend.append('image_url', formData.mediaLibraryUrl);
      } else if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      console.log('Uploading image with data:', {
        activity: formData.activity,
        caption: formData.caption,
        hasImage: !!formData.image,
        hasMediaLibraryUrl: !!formData.mediaLibraryUrl,
        imageName: formData.image?.name
      });

      const response = await fetch('http://127.0.0.1:8000/api/projects/activity_images/', {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        responseData = { detail: responseText };
      }
      console.log('Response data:', responseData);

      if (response.ok) {
        router.push(`/admin/projects/gallery/${projectId}`);
      } else {
        setError(responseData.detail || JSON.stringify(responseData) || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
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
        image: e.target.files[0],
        mediaLibraryUrl: null,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      activity: '',
      caption: '',
      image: null,
      mediaLibraryUrl: null,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/projects" />
        <div className="flex-1 ml-64">
          <Topbar title="Upload Image" subtitle="Add an image to the project gallery" onSearch={(q) => console.log('Search:', q)} />
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
            title="Upload Image"
            subtitle="Add an image to the project gallery"
            onSearch={(q) => console.log('Search:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Image Information</h2>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity (Optional)</label>
                <select
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Activity</option>
                  {activities.map((act) => (
                    <option key={act.id} value={act.id}>{act.activity_name}</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="space-y-4">
                  {/* Media Library Button */}
                  <button
                    type="button"
                    onClick={() => setShowMediaLibrary(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
                  >
                    <ImageIcon size={20} />
                    Choose from Media Library
                  </button>

                  <div className="text-center text-gray-400 text-sm">or</div>

                  {/* File Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600 cursor-pointer"
                    >
                      <ImageIcon size={20} />
                      Upload File
                    </label>
                  </div>

                  {/* Preview */}
                  {formData.mediaLibraryUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Selected from Media Library:</p>
                      <img
                        src={formData.mediaLibraryUrl}
                        alt="Selected from media library"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  {formData.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Selected file:</p>
                      <p className="text-sm font-medium text-gray-900">{formData.image.name}</p>
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200 mt-2"
                      />
                    </div>
                  )}
                </div>
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
                  {submitting ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Media Library</h3>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-60px)] bg-gray-50">
              <MediaLibraryContent onSelect={(url) => {
                setFormData(prev => ({
                  ...prev,
                  mediaLibraryUrl: url,
                  image: null,
                }));
                setShowMediaLibrary(false);
              }} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Media Library Content Component
function MediaLibraryContent({ onSelect }: { onSelect: (url: string) => void }) {
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMediaAssets();
  }, []);

  const loadMediaAssets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/content/media/', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        const assets = data.assets || data.results || data;
        setMediaAssets(Array.isArray(assets) ? assets : []);
      }
    } catch (err) {
      console.error('Error loading media assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (assetId: string) => {
    setImageErrors(prev => new Set(prev).add(assetId));
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500 bg-white rounded-lg">Loading media library...</div>;
  }

  if (mediaAssets.length === 0) {
    return <div className="text-center py-8 text-gray-500 bg-white rounded-lg">No media assets found</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {mediaAssets.map((asset) => (
        <button
          key={asset.id}
          onClick={() => onSelect(asset.url)}
          className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors shadow-sm"
        >
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            {imageErrors.has(asset.id) ? (
              <div className="text-gray-400 text-sm text-center p-2">
                <ImageIcon size={24} className="mx-auto mb-1" />
                Failed to load
              </div>
            ) : (
              <img
                src={asset.url}
                alt={asset.name || 'Media asset'}
                className="w-full h-full object-cover"
                onError={() => handleImageError(asset.id)}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium bg-black/50 px-3 py-1 rounded">Select</span>
          </div>
        </button>
      ))}
    </div>
  );
}
