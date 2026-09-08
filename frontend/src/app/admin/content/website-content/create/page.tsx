'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { AdminLayout } from '../../../components/AdminLayout';
import PageHeader from '../../../../../components/admin/ui/PageHeader';

interface PageSection {
  id: string;
  type: 'text' | 'image' | 'hero' | 'features' | 'testimonials';
  content: any;
  display_order: number;
}

interface WebsitePage {
  id?: number;
  title: string;
  slug: string;
  page_type: 'CUSTOM' | 'LANDING' | 'LEGAL';
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  sections: PageSection[];
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  og_image: string;
  scheduled_for?: string;
}

const newPageDraft = (): WebsitePage => ({
  title: '',
  slug: '',
  page_type: 'CUSTOM',
  status: 'DRAFT',
  sections: [],
  meta_title: '',
  meta_description: '',
  canonical_url: '',
  og_image: '',
});

export default function CreatePagePage() {
  const [page, setPage] = useState<WebsitePage>(newPageDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<Array<{ id: number | string; url: string; name: string; alt_text: string }>>([]);

  const loadMediaAssets = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/media/');
      if (response.ok) {
        const data = await response.json();
        setMediaAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error loading media assets:', error);
    }
  };

  const openMediaLibrary = () => {
    loadMediaAssets();
    setShowMediaLibrary(true);
  };

  const selectMediaAsset = (asset: { id: number | string; url: string; name: string; alt_text: string }) => {
    setPage({ ...page, og_image: asset.url });
    setShowMediaLibrary(false);
  };

  const handleCreatePage = async (pageData: WebsitePage) => {
    if (!pageData.title || !pageData.slug) {
      alert('Please provide both title and slug');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/pages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pageData.title,
          slug: pageData.slug,
          page_type: pageData.page_type,
          status: pageData.status,
          sections: pageData.sections,
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          canonical_url: pageData.canonical_url,
          og_image: pageData.og_image,
          scheduled_for: pageData.scheduled_for,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Page created successfully! You can now edit its content.');
        window.location.href = '/admin/content/website-content';
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create page');
        alert('Failed to create page');
      }
    } catch (err) {
      setError('An error occurred while creating the page');
      alert('An error occurred while creating the page');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setPage({
      ...page,
      title,
      slug: page.slug || generateSlug(title),
      meta_title: page.meta_title || title,
    });
  };

  const addSection = (type: PageSection['type']) => {
    const newSection: PageSection = {
      id: Date.now().toString(),
      type,
      content: {},
      display_order: page.sections.length,
    };
    setPage({ ...page, sections: [...page.sections, newSection] });
  };

  const removeSection = (sectionId: string) => {
    setPage({
      ...page,
      sections: page.sections.filter(s => s.id !== sectionId),
    });
  };

  return (
    <AdminLayout
      title="Create New Page"
      subtitle="Add a new custom page to your website"
      activePath="/admin/content/website-content"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Create New Page"
          description="Add a new custom page to your website"
        />

            {/* Main Form */}
            <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
              <div className="p-6 border-b border-blue-100">
                <h2 className="text-lg font-semibold text-blue-900">Page Information</h2>
                <p className="text-sm text-blue-400 mt-1">Fill in the basic details for your new page</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-blue-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Page Title *</label>
                    <input
                      type="text"
                      value={page.title}
                      onChange={handleTitleChange}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Careers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">URL Slug *</label>
                    <input
                      type="text"
                      value={page.slug}
                      onChange={(e) => setPage({ ...page, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., careers"
                    />
                    <p className="text-xs text-blue-400 mt-1">This will be used in the URL: /{page.slug || 'slug'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Page Type</label>
                    <select
                      value={page.page_type}
                      onChange={(e) => setPage({ ...page, page_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CUSTOM">Custom Page</option>
                      <option value="LANDING">Landing Page</option>
                      <option value="LEGAL">Legal Page</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Status</label>
                    <select
                      value={page.status}
                      onChange={(e) => setPage({ ...page, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="REVIEW">In Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Page Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-blue-900">Page Sections</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => addSection('text')}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        + Text
                      </button>
                      <button
                        type="button"
                        onClick={() => addSection('image')}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        + Image
                      </button>
                      <button
                        type="button"
                        onClick={() => addSection('hero')}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        + Hero
                      </button>
                    </div>
                  </div>
                  
                  {page.sections.length === 0 ? (
                    <p className="text-sm text-blue-400 py-4 border border-dashed border-blue-200 rounded-lg text-center">
                      No sections added yet. Click a button above to add content sections.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {page.sections.map((section, index) => (
                        <div key={section.id} className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                          <span className="text-xs font-medium text-blue-500 uppercase">{section.type}</span>
                          <span className="flex-1 text-sm text-blue-700">Section {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeSection(section.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SEO */}
                <div className="rounded-lg border border-purple-100 bg-purple-50 p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-purple-950">SEO Settings</p>
                    <p className="text-xs text-purple-700">Optimize your page for search engines</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={page.meta_title}
                      onChange={(e) => setPage({ ...page, meta_title: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Page title for search engines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Meta Description</label>
                    <textarea
                      value={page.meta_description}
                      onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Page description for search engines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Canonical URL</label>
                    <input
                      type="url"
                      value={page.canonical_url}
                      onChange={(e) => setPage({ ...page, canonical_url: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/canonical-url"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">OG Image</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={page.og_image}
                        onChange={(e) => setPage({ ...page, og_image: e.target.value })}
                        className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/og-image.jpg"
                      />
                      <button
                        type="button"
                        onClick={openMediaLibrary}
                        className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                        title="Select from Media Library"
                      >
                        <ImageIcon size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scheduling */}
                {page.status === 'SCHEDULED' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-blue-900">Schedule Publishing</h3>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Publish Date & Time</label>
                      <input
                        type="datetime-local"
                        value={page.scheduled_for || ''}
                        onChange={(e) => setPage({ ...page, scheduled_for: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-blue-100">
                  <button
                    onClick={() => handleCreatePage(page)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    <Save size={16} />
                    {saving ? 'Creating...' : 'Create Page'}
                  </button>
                  <Link
                    href="/admin/content/website-content"
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After creating the page, you can add detailed content sections (text, images, etc.) from the main Website Content page by selecting this page.
              </p>
            </div>
          </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-[#10243d]">Select from Media Library</h3>
                <p className="text-sm text-slate-500">Choose an image to use for this page</p>
              </div>
              <button onClick={() => setShowMediaLibrary(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {mediaAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-lg bg-slate-100 p-4 mb-4">
                    <ImageIcon size={32} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500">No images in media library</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => selectMediaAsset(asset)}
                      className="group relative aspect-square rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-blue-500"
                    >
                      <img
                        src={asset.url}
                        alt={asset.alt_text || asset.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="bg-white px-4 py-2 rounded-lg text-sm font-semibold text-[#1e63b8] opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                          Select
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <a
                  href="/admin/content/media"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-[#1e63b8] hover:text-[#1a5699] flex items-center gap-2"
                >
                  Open full Media Library to upload new images
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <button
                  onClick={() => setShowMediaLibrary(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
