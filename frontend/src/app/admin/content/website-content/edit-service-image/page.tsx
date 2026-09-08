'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/app/admin/components/AdminLayout';
import PageHeader from '@/components/admin/ui/PageHeader';

interface ServiceImageData {
  key: string;
  label: string;
  image_url: string;
  alt_text: string;
  sectionId?: number;
  serviceId?: number;
}

function EditServiceImagePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [imageData, setImageData] = useState<ServiceImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const selectedAssetRef = useRef<{ url: string } | null>(null);

  const key = searchParams.get('key') || '';
  const label = searchParams.get('label') || '';
  const serviceId = searchParams.get('serviceId');
  const sectionId = searchParams.get('sectionId');
  const currentImageUrl = searchParams.get('currentImageUrl') || '';
  const currentAltText = searchParams.get('currentAltText') || '';

  useEffect(() => {
    const initializeImageData = () => {
      console.log('Initializing image data...');
      console.log('Current URL params:', { key, label, serviceId, sectionId, currentImageUrl, currentAltText });

      // Validate that this is a service image edit
      const parsedServiceId = serviceId ? parseInt(serviceId) : null;
      if (!parsedServiceId || isNaN(parsedServiceId)) {
        console.error('Invalid serviceId:', serviceId, 'redirecting to website content');
        setError('This page is for editing service images only. Please navigate to the Services section to edit service images.');
        setLoading(false);
        return;
      }
      
      // Check for selected media asset from media library first
      const selectedAsset = sessionStorage.getItem('selectedMediaAsset');
      console.log('Selected asset from sessionStorage:', selectedAsset);
      
      let imageUrl = currentImageUrl;
      if (selectedAsset) {
        const asset = JSON.parse(selectedAsset);
        imageUrl = asset.url;
        console.log('Using selected asset URL:', imageUrl);
        selectedAssetRef.current = { url: imageUrl };
        sessionStorage.removeItem('selectedMediaAsset');
      } else if (selectedAssetRef.current) {
        // Use the asset URL from ref if sessionStorage was already cleared
        imageUrl = selectedAssetRef.current.url;
        console.log('Using cached asset URL from ref:', imageUrl);
      }

      console.log('Final image URL to use:', imageUrl);
      
      setImageData({
        key,
        label,
        image_url: imageUrl || '',
        alt_text: currentAltText || '',
        sectionId: sectionId ? parseInt(sectionId) : undefined,
        serviceId: parsedServiceId,
      });
      setPreview(imageUrl || null);
      setLoading(false);
    };

    initializeImageData();
  }, [key, label, serviceId, sectionId, currentImageUrl, currentAltText]);

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
    if (!imageData || !token) return;

    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageData.image_url) {
        formData.append('image_url', imageData.image_url);
      }
      
      formData.append('alt_text', imageData.alt_text || '');

      let response;
      const isSectionImage = key.startsWith('section_') || key.startsWith('process_');
      
      console.log('Saving image with key:', key, 'serviceId:', serviceId, 'sectionId:', sectionId, 'isSectionImage:', isSectionImage);
      
      if (isSectionImage && sectionId && serviceId) {
        const imageNumber = key.includes('_image_') ? parseInt(key.split('_image_')[1]) : 1;
        formData.append(`image_url${imageNumber > 1 ? '_' + imageNumber : ''}`, imageData.image_url || '');
        formData.append(`alt_text${imageNumber > 1 ? '_' + imageNumber : ''}`, imageData.alt_text || '');
        
        console.log('Updating section image:', { serviceId, sectionId, imageNumber, hasFile: !!imageFile });
        
        response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/sections/${sectionId}/`, {
          method: imageFile ? 'POST' : 'PATCH',
          headers: imageFile ? { 'Authorization': `Bearer ${token}` } : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: imageFile ? formData : JSON.stringify({
            [`image_url${imageNumber > 1 ? '_' + imageNumber : ''}`]: imageData.image_url || '',
            [`alt_text${imageNumber > 1 ? '_' + imageNumber : ''}`]: imageData.alt_text || '',
          }),
        });
      } else if (key.startsWith('hero_image') && serviceId) {
        const imageNumber = key === 'hero_image_1' ? '' : `_${key.split('_')[2]}`;
        formData.append(`hero_image_url${imageNumber}`, imageData.image_url || '');
        formData.append(`hero_alt_text${imageNumber}`, imageData.alt_text || '');
        
        console.log('Updating hero image:', { serviceId, imageNumber, hasFile: !!imageFile });
        
        response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/`, {
          method: imageFile ? 'POST' : 'PATCH',
          headers: imageFile ? { 'Authorization': `Bearer ${token}` } : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: imageFile ? formData : JSON.stringify({
            [`hero_image_url${imageNumber}`]: imageData.image_url || '',
            [`hero_alt_text${imageNumber}`]: imageData.alt_text || '',
          }),
        });
      } else {
        console.error('Invalid image key or missing parameters:', { key, serviceId, sectionId });
        setError('Invalid image configuration. Missing service ID or unrecognized image key. This page is for editing service images only.');
        setSaving(false);
        return;
      }

      console.log('Response status:', response?.status);
      if (response && response.ok) {
        sessionStorage.setItem('returnToImagesTab', 'true');
        if (serviceId) {
          sessionStorage.setItem('editingServiceId', serviceId);
        }
        router.push('/admin/content/website-content?page=services');
      } else {
        const errorText = await response?.text() || 'Unknown error';
        console.error('Save failed:', response?.status, errorText);
        let errorMessage = `Failed to save image: ${response?.status || 'Unknown'}`;
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
        title="Edit Service Image"
        subtitle="Loading..."
        activePath="/admin/content/website-content"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        title="Edit Service Image"
        subtitle="Error"
        activePath="/admin/content/website-content"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 mb-6">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1e63b8] hover:text-[#1a5699] transition-colors"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Edit Service Image"
      subtitle={`Editing: ${label}`}
      activePath="/admin/content/website-content"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Edit Service Image"
          description={`Editing: ${label}`}
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
                  <img src={preview} alt={imageData?.alt_text || label} className="w-full h-full object-contain" />
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
                  value={imageData?.key || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-blue-50 text-blue-600 cursor-not-allowed"
                />
                <p className="text-xs text-blue-400 mt-1">Unique identifier (cannot be changed)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Label</label>
                <input
                  type="text"
                  value={imageData?.label || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-blue-50 text-blue-600 cursor-not-allowed"
                />
                <p className="text-xs text-blue-400 mt-1">Image label (cannot be changed)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageData?.image_url || ''}
                    onChange={(e) => setImageData(prev => prev ? { ...prev, image_url: e.target.value } : null)}
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
                  value={imageData?.alt_text || ''}
                  onChange={(e) => setImageData(prev => prev ? { ...prev, alt_text: e.target.value } : null)}
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
      </div>
    </AdminLayout>
  );
}

export default function EditServiceImagePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditServiceImagePageContent />
    </Suspense>
  );
}
