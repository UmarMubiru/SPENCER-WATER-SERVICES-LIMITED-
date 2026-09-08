'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Check, X, Trash2, Edit2, Plus, Search, Filter, Award } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';

type Testimonial = {
  id: number;
  customer_name: string;
  company_name: string;
  rating: number;
  content: string;
  project_reference: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  is_featured: boolean;
};

const API = 'http://127.0.0.1:8000/api/testimonials/';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({
    customer_name: '',
    company_name: '',
    rating: 5,
    content: '',
    project_reference: '',
    is_featured: false,
  });

  const load = () => {
    setLoading(true);
    fetch(API)
      .then(r => r.json())
      .then(d => setTestimonials(d.testimonials || []))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingTestimonial ? 'PATCH' : 'POST';
    const url = editingTestimonial ? `${API}${editingTestimonial.id}/` : API;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingTestimonial(null);
        setForm({
          customer_name: '',
          company_name: '',
          rating: 5,
          content: '',
          project_reference: '',
          is_featured: false,
        });
        load();
      } else {
        alert('Failed to save testimonial');
      }
    } catch (error) {
      alert('Failed to save testimonial');
    }
  };

  const updateStatus = async (testimonial: Testimonial, status: string) => {
    try {
      const response = await fetch(`${API}${testimonial.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) load();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`${API}${testimonial.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !testimonial.is_featured }),
      });
      if (response.ok) load();
    } catch (error) {
      alert('Failed to update featured status');
    }
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const response = await fetch(`${API}${id}/`, { method: 'DELETE' });
      if (response.ok) load();
      else alert('Failed to delete testimonial');
    } catch (error) {
      alert('Failed to delete testimonial');
    }
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setForm({
      customer_name: testimonial.customer_name,
      company_name: testimonial.company_name,
      rating: testimonial.rating,
      content: testimonial.content,
      project_reference: testimonial.project_reference,
      is_featured: testimonial.is_featured,
    });
    setShowModal(true);
  };

  const visible = testimonials.filter(t => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch = searchQuery === '' ||
      t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: testimonials.length,
    pending: testimonials.filter(t => t.status === 'PENDING').length,
    approved: testimonials.filter(t => t.status === 'APPROVED').length,
    featured: testimonials.filter(t => t.is_featured).length,
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <AdminLayout
      title="Testimonials"
      subtitle="Manage customer reviews and testimonials"
      activePath="/admin/content/testimonials"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <MessageSquare size={18} className="text-[#1e63b8]" />
            </div>
            <strong className="mt-4 block text-3xl text-[#10243d]">{stats.total}</strong>
            <span className="mt-1 block text-xs text-slate-500">All testimonials</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Pending</span>
              <Filter size={18} className="text-amber-500" />
            </div>
            <strong className="mt-4 block text-3xl text-[#10243d]">{stats.pending}</strong>
            <span className="mt-1 block text-xs text-slate-500">Awaiting review</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Approved</span>
              <Check size={18} className="text-emerald-500" />
            </div>
            <strong className="mt-4 block text-3xl text-[#10243d]">{stats.approved}</strong>
            <span className="mt-1 block text-xs text-slate-500">Published reviews</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Featured</span>
              <Award size={18} className="text-purple-500" />
            </div>
            <strong className="mt-4 block text-3xl text-[#10243d]">{stats.featured}</strong>
            <span className="mt-1 block text-xs text-slate-500">Highlighted reviews</span>
          </div>
        </div>

        {/* Header with Add Button */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Review and manage customer testimonials. Approve pending reviews to display them on your website.</p>
          </div>
          <button
            onClick={() => {
              setEditingTestimonial(null);
              setForm({
                customer_name: '',
                company_name: '',
                rating: 5,
                content: '',
                project_reference: '',
                is_featured: false,
              });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e63b8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5699]"
          >
            <Plus size={17} />Add Testimonial
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  filter === status
                    ? 'bg-[#1e63b8] text-white'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={16} className="text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none"
                placeholder="Search testimonials..."
              />
            </label>
          </div>
        </div>

        {/* Testimonials List */}
        {loading ? (
          <p className="py-16 text-center text-slate-500">Loading testimonials...</p>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-slate-500">No testimonials found</p>
        ) : (
          <div className="space-y-4">
            {visible.map(testimonial => (
              <div
                key={testimonial.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-[#10243d]">{testimonial.customer_name}</h3>
                      {testimonial.is_featured && (
                        <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                          <Award size={12} />Featured
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          testimonial.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : testimonial.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {testimonial.status.charAt(0) + testimonial.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    {testimonial.company_name && (
                      <p className="text-sm text-slate-600">{testimonial.company_name}</p>
                    )}
                    <div className="mt-2 flex items-center gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{testimonial.content}</p>
                    {testimonial.project_reference && (
                      <p className="mt-2 text-xs text-slate-500">Project: {testimonial.project_reference}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {testimonial.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(testimonial, 'APPROVED')}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          <Check size={14} />Approve
                        </button>
                        <button
                          onClick={() => updateStatus(testimonial, 'REJECTED')}
                          className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          <X size={14} />Reject
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFeatured(testimonial)}
                        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          testimonial.is_featured
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        <Award size={14} />
                        {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => openEditModal(testimonial)}
                        className="flex items-center gap-1 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                      >
                        <Edit2 size={14} />Edit
                      </button>
                      <button
                        onClick={() => deleteTestimonial(testimonial.id)}
                        className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                      >
                        <Trash2 size={14} />Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={form.customer_name}
                      onChange={e => setForm({ ...form, customer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={form.company_name}
                      onChange={e => setForm({ ...form, company_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={24}
                          className={star <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-slate-600">{form.rating} stars</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial Content *</label>
                  <textarea
                    required
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="What did the customer say about your service?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Reference</label>
                  <input
                    type="text"
                    value={form.project_reference}
                    onChange={e => setForm({ ...form, project_reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Related project name"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.is_featured}
                    onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">Feature this testimonial</label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingTestimonial ? 'Update' : 'Create'} Testimonial
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
