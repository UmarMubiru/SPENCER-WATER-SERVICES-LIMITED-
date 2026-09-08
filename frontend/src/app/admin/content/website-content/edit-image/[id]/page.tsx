'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, ImageIcon } from 'lucide-react';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { AdminLayout } from '../../../../components/AdminLayout';
import PageHeader from '../../../../../../components/admin/ui/PageHeader';

interface PageImage {
  id: number;
  page: string;
  key: string;
  label: string;
  image: string;
  image_url: string;
  image_url_display: string;
  alt_text: string;
  updated_at: string;
  sectionId?: number;
}

export default function EditImagePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [image, setImage] = useState<PageImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const imageId = params.id as string;
  const fromMediaLibrary = searchParams.get('fromMediaLibrary') === 'true';

  useEffect(() => {
    // Check for selected media asset from media library first
    const selectedAsset = sessionStorage.getItem('selectedMediaAsset');
    if (selectedAsset) {
      console.log('Found selected media asset:', selectedAsset);
      const asset = JSON.parse(selectedAsset);
      // Load the image data first, then apply the selected asset
      loadImage().then(() => {
        setImage(prev => prev ? { ...prev, image_url: asset.url } : null);
        setPreview(asset.url);
        sessionStorage.removeItem('selectedMediaAsset');
      });
    } else {
      loadImage();
    }
  }, [imageId, fromMediaLibrary]);

  const loadImage = async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('Loading image with ID:', imageId);
      const response = await fetch(`http://127.0.0.1:8000/api/content/core-pages/page-images/${imageId}/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Image data:', data);
        setImage(data);
        setPreview(data.image_url_display || data.image_url || data.image);
      } else {
        const errorText = await response.text();
        console.error('Failed to load image:', response.status, errorText);
        setError(`Failed to load image: ${response.status}`);
      }
    } catch (err) {
      console.error('Error loading image:', err);
      setError('Error loading image');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !token) return;

    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('key', image.key);
      formData.append('label', image.label);
      formData.append('alt_text', image.alt_text || '');
      formData.append('page', image.page);
      
      console.log('Saving image with data:', {
        key: image.key,
        label: image.label,
        image_url: image.image_url,
        hasFile: !!imageFile,
        fullImage: image
      });
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (image.image_url) {
        formData.append('image_url', image.image_url);
      }

      if (image.sectionId) {
        formData.append('section_id', image.sectionId.toString());
      }

      const response = await fetch(`http://127.0.0.1:8000/api/content/core-pages/page-images/${imageId}/`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      console.log('Save response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Saved image data:', data);
        console.log('Current image_url in state:', image.image_url);
        console.log('Returned image_url:', data.image_url);
        // Set flag to return to images tab
        sessionStorage.setItem('returnToImagesTab', 'true');
        // Don't overwrite state with returned data if it doesn't have the updated URL
        if (data.image_url === image.image_url) {
          console.log('API returned same image_url, keeping current state');
          router.back();
        } else {
          console.log('API returned different image_url, updating state');
          setImage(data);
          router.back();
        }
      } else {
        const errorText = await response.text();
        console.error('Save failed:', response.status, errorText);
        let errorMessage = `Failed to save image: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.error || errorMessage;
        } catch (e) {
          // If not JSON, use the raw text
          if (errorText && errorText.length < 200) {
            errorMessage = errorText;
          }
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error saving image:', err);
      setError('Error saving image');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Edit Image"
        subtitle="Loading..."
        activePath="/admin/content/website-content"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading image...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !image) {
    return (
      <AdminLayout
        title="Edit Image"
        subtitle="Error loading image"
        activePath="/admin/content/website-content"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          {error || 'Image not found'}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Edit Image"
      subtitle={`Editing: ${image.label}`}
      activePath="/admin/content/website-content"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Edit Image"
          description={`Editing: ${image.label}`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="border-b border-blue-100 p-6 bg-blue-50">
              <h2 className="text-xl font-semibold text-blue-900">Image Preview</h2>
              <p className="text-sm text-blue-400 mt-1">Current image display</p>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-blue-50 rounded-lg overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt={image.alt_text || image.label} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-blue-400 flex flex-col items-center gap-2">
                    <ImageIcon size={48} />
                    <span>No image selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="border-b border-blue-100 p-6 bg-blue-50">
              <h2 className="text-xl font-semibold text-blue-900">Image Details</h2>
              <p className="text-sm text-blue-400 mt-1">Edit image properties and content</p>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Key</label>
                <input
                  type="text"
                  value={image.key}
                  disabled
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-blue-50 text-blue-600 cursor-not-allowed"
                />
                <p className="text-xs text-blue-400 mt-1">Unique identifier (cannot be changed)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Label</label>
                <input
                  type="text"
                  value={image.label || ''}
                  onChange={(e) => setImage({ ...image, label: e.target.value })}
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g. Hero Background"
                />
                <p className="text-xs text-blue-400 mt-1">Human-readable name shown in admin</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={image.image_url || ''}
                    onChange={(e) => setImage({ ...image, image_url: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => router.push('/admin/content/website-content/media-library')}
                    className="px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Select from Media Library"
                  >
                    <ImageIcon size={20} className="text-blue-600" />
                  </button>
                </div>
                <p className="text-xs text-blue-400 mt-1">External image URL or select from library</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Or Upload New Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-blue-400 mt-1">Upload a new image file (overrides URL)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Alt Text</label>
                <input
                  type="text"
                  value={image.alt_text || ''}
                  onChange={(e) => setImage({ ...image, alt_text: e.target.value })}
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Describe the image for accessibility"
                />
                <p className="text-xs text-blue-400 mt-1">Alternative text for screen readers</p>
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
        </div>

        {/* Image Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Image Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-400">Image ID:</span>
              <span className="ml-2 text-blue-700">{image.id}</span>
            </div>
            <div>
              <span className="text-blue-400">Page:</span>
              <span className="ml-2 text-blue-700">{image.page}</span>
            </div>
            <div>
              <span className="text-blue-400">Last Updated:</span>
              <span className="ml-2 text-blue-700">
                {new Date(image.updated_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-blue-400">Section ID:</span>
              <span className="ml-2 text-blue-700">{image.sectionId || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
