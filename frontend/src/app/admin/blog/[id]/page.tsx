'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, X, ArrowLeft, Image as ImageIcon, Tag, FolderOpen, Clock, Eye } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { AdminLayout } from '../../components/AdminLayout';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author: string | null;
  category: string | null;
  category_id: number | null;
  tags: string[];
  tag_ids: number[];
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  meta_description: string | null;
  meta_keywords: string | null;
  reading_time: number;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

interface BlogTag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    tag_ids: [] as number[],
    status: 'DRAFT',
    is_featured: false,
    meta_description: '',
    meta_keywords: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      
      // Load categories and tags
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/blog/categories/', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://127.0.0.1:8000/api/blog/tags/', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData.tags || []);
        }
      } catch (err) {
        console.error('Error loading categories/tags:', err);
      }

      // Check if new post
      const id = params.id;
      if (id === 'new') {
        setIsNew(true);
        setLoading(false);
        return;
      }

      // Load existing post
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/blog/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const postData = await response.json();
          setFormData({
            title: postData.title || '',
            slug: postData.slug || '',
            excerpt: postData.excerpt || '',
            content: postData.content || '',
            featured_image: postData.featured_image || '',
            category_id: postData.category_id?.toString() || '',
            tag_ids: postData.tag_ids || [],
            status: postData.status || 'DRAFT',
            is_featured: postData.is_featured || false,
            meta_description: postData.meta_description || '',
            meta_keywords: postData.meta_keywords || '',
          });
        }
      } catch (err) {
        console.error('Error loading post:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);

    try {
      const url = isNew 
        ? 'http://127.0.0.1:8000/api/blog/'
        : `http://127.0.0.1:8000/api/blog/${params.id}/`;
      
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
        }),
      });

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save post');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <AdminLayout
        title={isNew ? "New Blog Post" : "Edit Blog Post"}
        subtitle={isNew ? "Create a new blog post" : "Edit your blog post"}
        activePath="/admin/blog"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? "New Blog Post" : "Edit Blog Post"}
      subtitle={isNew ? "Create a new blog post" : "Edit your blog post"}
      activePath="/admin/blog"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/blog')}
            className="flex items-center gap-2 text-[#1e63b8] hover:text-[#1a5699] mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Blog Management
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Title and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    if (!formData.slug || isNew) {
                      setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter post title"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="url-friendly-slug"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt *
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Short summary for card previews"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                rows={15}
                placeholder="Write your blog content here..."
                required
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.featured_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaLibrary(true)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ImageIcon size={16} />
                    Media Library
                  </button>
                </div>
                {formData.featured_image && (
                  <div className="relative inline-block">
                    <img
                      src={formData.featured_image}
                      alt="Featured image preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FolderOpen size={16} className="inline mr-1" />
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-1" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        formData.tag_ids.includes(tag.id)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status and Featured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Post</span>
                </label>
              </div>
            </div>

            {/* SEO */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="SEO meta description for search engines"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => router.push('/admin/blog')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              {!isNew && (
                <button
                  onClick={() => {
                    if (confirm('Preview this post?')) {
                      window.open(`/blog/${formData.slug}`, '_blank');
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  <Eye size={16} />
                  Preview
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1e63b8] text-white rounded-lg hover:bg-[#1a5699] transition-colors font-medium disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Media Library</h3>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <MediaLibraryContent onSelect={(url) => {
                setFormData(prev => ({ ...prev, featured_image: url }));
                setShowMediaLibrary(false);
              }} />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function MediaLibraryContent({ onSelect }: { onSelect: (url: string) => void }) {
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    loadMediaAssets();
  }, []);

  const loadMediaAssets = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/media/', {
        headers: { 'Authorization': `Bearer ${token}` },
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

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading media library...</div>;
  }

  if (mediaAssets.length === 0) {
    return <div className="text-center py-8 text-gray-500">No media assets found</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {mediaAssets.map((asset) => (
        <button
          key={asset.id}
          onClick={() => onSelect(asset.url)}
          className="relative group"
        >
          <img
            src={asset.url}
            alt={asset.name || 'Media asset'}
            className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:border-blue-500 transition-colors"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">Select</span>
          </div>
        </button>
      ))}
    </div>
  );
}
