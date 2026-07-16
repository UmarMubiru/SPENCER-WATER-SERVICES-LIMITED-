'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

interface Testimonial {
  id: string;
  visitor_name: string;
  company_name?: string;
  content: string;
  rating?: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [filters, setFilters] = useState({
    status: 'PENDING_REVIEW',
    search: '',
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [testimonials, filters]);

  const applyFilters = () => {
    let filtered = [...testimonials];
    
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.visitor_name.toLowerCase().includes(search) ||
        (t.company_name && t.company_name.toLowerCase().includes(search)) ||
        t.content.toLowerCase().includes(search)
      );
    }
    
    setFilteredTestimonials(filtered);
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/testimonials/');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/testimonials/${testimonial.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      
      if (response.ok) {
        fetchTestimonials();
      } else {
        alert('Error approving testimonial');
      }
    } catch (error) {
      console.error('Error approving testimonial:', error);
      alert('Error approving testimonial');
    }
  };

  const handleReject = async (testimonial: Testimonial) => {
    if (!confirm('Are you sure you want to reject this testimonial?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/testimonials/${testimonial.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });
      
      if (response.ok) {
        fetchTestimonials();
      } else {
        alert('Error rejecting testimonial');
      }
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      alert('Error rejecting testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/testimonials/${id}/`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchTestimonials();
      } else {
        alert('Error deleting testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Error deleting testimonial');
    }
  };

  const openDetailsModal = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowDetailsModal(true);
  };

  const stats = [
    { label: 'Total Testimonials', value: testimonials.length, color: 'blue' },
    { label: 'Pending Review', value: testimonials.filter(t => t.status === 'PENDING_REVIEW').length, color: 'red' },
    { label: 'Approved', value: testimonials.filter(t => t.status === 'APPROVED').length, color: 'green' },
    { label: 'Rejected', value: testimonials.filter(t => t.status === 'REJECTED').length, color: 'gray' },
  ];

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/content/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Testimonials"
          subtitle="Review and manage customer feedback"
          onSearch={(q) => setFilters(prev => ({ ...prev, search: q }))}
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', valueColor: 'text-green-700' },
                red: { bg: 'bg-red-50', valueColor: 'text-red-700' },
                gray: { bg: 'bg-gray-50', valueColor: 'text-gray-700' },
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses];
              
              return (
                <div key={index} className={`${colors.bg} rounded-xl p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow`} onClick={() => {
                  if (stat.label === 'Pending Review') {
                    setFilters(prev => ({ ...prev, status: 'PENDING_REVIEW' }));
                  } else if (stat.label === 'Approved') {
                    setFilters(prev => ({ ...prev, status: 'APPROVED' }));
                  } else if (stat.label === 'Rejected') {
                    setFilters(prev => ({ ...prev, status: 'REJECTED' }));
                  } else {
                    setFilters(prev => ({ ...prev, status: '' }));
                  }
                }}>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colors.valueColor}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Testimonials Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Testimonials</h2>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading testimonials...</div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No testimonials found matching your filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Company</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Rating</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Content</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Submitted</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTestimonials.map((testimonial) => (
                      <tr key={testimonial.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium text-gray-900">{testimonial.visitor_name}</td>
                        <td className="py-4 px-6 text-gray-700">{testimonial.company_name || 'N/A'}</td>
                        <td className="py-4 px-6">
                          {testimonial.rating ? (
                            <span className="text-yellow-500">{'⭐'.repeat(testimonial.rating)}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-gray-700 line-clamp-2 max-w-md">{testimonial.content}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            testimonial.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            testimonial.status === 'PENDING_REVIEW' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {testimonial.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {new Date(testimonial.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDetailsModal(testimonial)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                            </button>
                            {testimonial.status === 'PENDING_REVIEW' && (
                              <>
                                <button
                                  onClick={() => handleApprove(testimonial)}
                                  className="text-green-600 hover:text-green-800 font-medium"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(testimonial)}
                                  className="text-red-600 hover:text-red-800 font-medium"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(testimonial.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
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
      </div>

      {/* Testimonial Details Modal */}
      {showDetailsModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Testimonial Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Customer Name</p>
                <p className="text-gray-900">{selectedTestimonial.visitor_name}</p>
              </div>
              
              {selectedTestimonial.company_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p className="text-gray-900">{selectedTestimonial.company_name}</p>
                </div>
              )}
              
              {selectedTestimonial.rating && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p className="text-yellow-500">{'⭐'.repeat(selectedTestimonial.rating)}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Content</p>
                <p className="text-gray-700 mt-1">{selectedTestimonial.content}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedTestimonial.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    selectedTestimonial.status === 'PENDING_REVIEW' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedTestimonial.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted</p>
                  <p className="text-gray-700">{new Date(selectedTestimonial.submitted_at).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedTestimonial.reviewed_by && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Reviewed By</p>
                  <p className="text-gray-700">{selectedTestimonial.reviewed_by}</p>
                </div>
              )}
              
              {selectedTestimonial.reviewed_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Reviewed At</p>
                  <p className="text-gray-700">{new Date(selectedTestimonial.reviewed_at).toLocaleString()}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4 border-t">
                {selectedTestimonial.status === 'PENDING_REVIEW' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedTestimonial);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedTestimonial);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedTestimonial.id);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
