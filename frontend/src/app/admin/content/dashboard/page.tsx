'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  author: string;
  published_at?: string;
  created_at: string;
}

interface Testimonial {
  id: string;
  visitor_name: string;
  company_name?: string;
  content: string;
  rating?: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  submitted_at: string;
}

export default function ContentDashboardPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [blogsRes, testimonialsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/content/blog/'),
        fetch('http://127.0.0.1:8000/api/content/testimonials/'),
      ]);
      
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(Array.isArray(blogsData) ? blogsData : []);
      } else {
        setBlogs([]);
      }
      
      if (testimonialsRes.ok) {
        const testimonialsData = await testimonialsRes.json();
        setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []);
      } else {
        setTestimonials([]);
      }
    } catch (error) {
      console.error('Error fetching content data:', error);
      setBlogs([]);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Services', value: '7', change: 'Service catalogue', color: 'blue' },
    { label: 'Portfolio Projects', value: '0', change: 'Completed projects', color: 'purple' },
    { label: 'Blog Posts', value: blogs.length, change: `${blogs.filter(b => b.status === 'PUBLISHED').length} published`, color: 'green' },
    { label: 'Pending Testimonials', value: testimonials.filter(t => t.status === 'PENDING_REVIEW').length, change: 'Need approval', color: 'red' },
  ];

  return (
    <AdminLayout
      title="Content Management"
      subtitle="Manage blogs, testimonials, and website images"
      activePath="/admin/content/dashboard"
      onSearch={(q) => console.log('Search content:', q)}
    >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', valueColor: 'text-green-700' },
                amber: { bg: 'bg-amber-50', valueColor: 'text-amber-700' },
                red: { bg: 'bg-red-50', valueColor: 'text-red-700' },
                purple: { bg: 'bg-purple-50', valueColor: 'text-purple-700' },
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses] || colorClasses.blue;
              
              return (
                <div key={index} className={`${colors.bg} rounded-xl p-6 border border-gray-200`}>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colors.valueColor} mb-1`}>{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Link href="/admin/content/services" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Services Catalogue</h3>
                  <p className="text-sm text-gray-600">Manage 7 service lines</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/content/portfolio" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏗️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Portfolio</h3>
                  <p className="text-sm text-gray-600">Completed projects</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/content/blogs" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Blog & News</h3>
                  <p className="text-sm text-gray-600">Create and manage articles</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/content/testimonials" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Testimonials</h3>
                  <p className="text-sm text-gray-600">Review and approve feedback</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/content/website-images" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🖼️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Website Images</h3>
                  <p className="text-sm text-gray-600">Manage page images</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Blog Posts */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Blog Posts</h2>
                <Link href="/admin/content/blogs" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : blogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No blog posts yet</div>
                ) : (
                  <div className="space-y-4">
                    {blogs.slice(0, 5).map((blog) => (
                      <div key={blog.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{blog.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{blog.excerpt}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          blog.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                          blog.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {blog.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Testimonials */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pending Testimonials</h2>
                <Link href="/admin/content/testimonials" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Review All
                </Link>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : testimonials.filter(t => t.status === 'PENDING_REVIEW').length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No pending testimonials</div>
                ) : (
                  <div className="space-y-4">
                    {testimonials.filter(t => t.status === 'PENDING_REVIEW').slice(0, 5).map((testimonial) => (
                      <div key={testimonial.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{testimonial.visitor_name}</p>
                          {testimonial.company_name && (
                            <p className="text-sm text-gray-600">{testimonial.company_name}</p>
                          )}
                          <p className="text-sm text-gray-500 line-clamp-1 mt-1">{testimonial.content}</p>
                        </div>
                        {testimonial.rating && (
                          <span className="text-yellow-500">{'⭐'.repeat(testimonial.rating)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
    </AdminLayout>
  );
}
