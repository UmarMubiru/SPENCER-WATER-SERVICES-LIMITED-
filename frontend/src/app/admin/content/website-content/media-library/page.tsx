'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ImageIcon, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { AdminLayout } from '../../../components/AdminLayout';
import PageHeader from '../../../../../components/admin/ui/PageHeader';

interface MediaAsset {
  id: string;
  url: string;
  name: string;
  alt_text?: string;
}

function MediaLibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = searchParams.get('returnUrl') || '/admin/content/website-content';

  useEffect(() => {
    loadMediaAssets();
  }, []);

  const loadMediaAssets = async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/media/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Media assets data:', data);
        // Handle different response structures - the API returns data.assets
        const assets = data.assets || data.results || data;
        setMediaAssets(Array.isArray(assets) ? assets : []);
      } else {
        const errorText = await response.text();
        console.error('Failed to load media assets:', response.status, errorText);
        setError(`Failed to load media assets: ${response.status}`);
        setMediaAssets([]);
      }
    } catch (err) {
      console.error('Error loading media assets:', err);
      setError('Error loading media assets');
      setMediaAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    // Store selected asset in sessionStorage for the return page to use
    sessionStorage.setItem('selectedMediaAsset', JSON.stringify(asset));
    // Navigate back to edit image page with a flag
    router.back();
  };

  if (loading) {
    return (
      <AdminLayout
        title="Media Library"
        subtitle="Loading..."
        activePath="/admin/content/website-content"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading media library...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Media Library"
      subtitle="Select an image to use for your content"
      activePath="/admin/content/website-content"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Media Library"
          description="Select an image to use for your content"
        />

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Select from Media Library</h2>
              <p className="text-sm text-blue-400 mt-1">Choose an image to use for your content</p>
            </div>
            <a
              href="/admin/content/media"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Open full Media Library
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Media Grid */}
        {mediaAssets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-12 text-center">
            <div className="rounded-lg bg-blue-50 p-6 inline-block mb-4">
              <ImageIcon size={48} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">No images in media library</h3>
            <p className="text-blue-400 mb-4">Upload images to the media library first</p>
            <a
              href="/admin/content/media"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Go to Media Library
              <ExternalLink size={16} />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => handleSelect(asset)}
                className="group relative aspect-square rounded-xl border border-blue-200 bg-white shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-blue-500"
              >
                <img
                  src={asset.url}
                  alt={asset.alt_text || asset.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="bg-white px-6 py-3 rounded-lg text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform scale-95 group-hover:scale-100">
                    Select Image
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium truncate">{asset.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How it works</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-600">
            <li>Click on an image above to select it</li>
            <li>The selected image will be applied to your content</li>
            <li>You'll be returned to the edit page automatically</li>
            <li>Need more images? Open the full Media Library to upload</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function MediaLibraryPage() {
  return (
    <Suspense fallback={
      <AdminLayout
        title="Media Library"
        subtitle="Loading..."
        activePath="/admin/content/website-content"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading media library...</div>
        </div>
      </AdminLayout>
    }>
      <MediaLibraryContent />
    </Suspense>
  );
}
