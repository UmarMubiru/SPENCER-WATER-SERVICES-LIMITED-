'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus, Search, Filter, Calendar, Clock, Tag, FolderOpen } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';

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

export default function BlogManagementPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Load posts
      const postsRes = await fetch('http://127.0.0.1:8000/api/blog/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }

      // Load categories
      const categoriesRes = await fetch('http://127.0.0.1:8000/api/blog/categories/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      // Load tags
      const tagsRes = await fetch('http://127.0.0.1:8000/api/blog/tags/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData.tags || []);
      }
    } catch (err) {
      console.error('Error loading blog data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/blog/${postId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category_id === parseInt(categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Blog Management"
        subtitle="Manage your blog posts, categories, and tags"
        activePath="/admin/blog"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading blog data...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Blog Management"
      subtitle="Create, edit, and manage your blog content"
      activePath="/admin/blog"
    >
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Edit2 size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-2xl font-bold text-gray-900">{posts.filter(p => p.status === 'PUBLISHED').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar size={20} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FolderOpen size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tags</p>
                <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Tag size={20} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Blog Posts</h2>
            <button
              onClick={() => router.push('/admin/blog/new')}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e63b8] text-white rounded-lg hover:bg-[#1a5699] transition-colors"
            >
              <Plus size={16} />
              New Post
            </button>
          </div>
          
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No posts found. Create your first blog post!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reading Time</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {post.featured_image && (
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{post.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {post.category || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {post.reading_time} min
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/blog/${post.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
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
    </AdminLayout>
  );
}
