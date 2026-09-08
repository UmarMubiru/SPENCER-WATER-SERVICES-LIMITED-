'use client';

import React, { useState, useEffect } from 'react';
import { SiteFrame } from '../site-shell';
import { getPublicSiteContent, image, field } from '../content-api';

interface Lead {
  id: string;
  lead_number: string;
  customer_name: string;
  company?: string;
  service: string;
  status: string;
  description: string;
  district: string;
  subcounty: string;
  created_at: string;
  updated_at: string;
  quotation_number?: string;
  project_reference?: string;
}

const STATUS_LABELS: { [key: string]: string } = {
  new: 'New',
  reviewing: 'Under Review',
  quotation: 'Quotation Prepared',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

const STATUS_COLORS: { [key: string]: string } = {
  new: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-amber-100 text-amber-700',
  quotation: 'bg-purple-100 text-purple-700',
  negotiation: 'bg-orange-100 text-orange-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

export default function TrackLeadPage() {
  const [content, setContent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublicSiteContent().then(setContent);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError('');
    setLead(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/public/leads/?lead_number=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        const results = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        if (results.length > 0) {
          setLead(results[0]);
        } else {
          setError('No lead found with this number.');
        }
      } else {
        setError('Error searching for lead.');
      }
    } catch (err) {
      setError('Error searching for lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage hero-photo-stack">
          {[
            image(content, 'quotation', 'hero_image_1'),
            image(content, 'quotation', 'hero_image_2'),
            image(content, 'quotation', 'hero_image_3')
          ].map((heroImage, index) => (
            <div
              className={`hero-photo hero-photo-${["one", "two", "three"][index]}`}
              key={index}
              role="img"
              aria-label={heroImage?.alt_text || ""}
              style={heroImage ? { backgroundImage: `url(${heroImage.image_url})` } : undefined}
            />
          ))}
          <div className="hero-centered">
            <p className="breadcrumb">Home / Track Your Request</p>
            <p className="eyebrow">Customer Portal</p>
            <h1>Track Your Request</h1>
            <p>Enter your lead number to check the status of your quotation request.</p>
          </div>

          <div className="sws-feature-strip">
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <strong>Quality & Reliability</strong>
                <span>We deliver lasting solutions</span>
              </div>
            </div>
            <div className="sws-feature-divider" />
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <strong>Expert Engineers</strong>
                <span>Skilled, certified & experienced</span>
              </div>
            </div>
            <div className="sws-feature-divider" />
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h20"/>
                  <path d="M12 2v20"/>
                  <path d="m4.93 4.93 14.14 14.14"/>
                  <path d="m19.07 4.93-14.14 14.14"/>
                </svg>
              </div>
              <div>
                <strong>Sustainable Approach</strong>
                <span>Solutions for a better tomorrow</span>
              </div>
            </div>
            <div className="sws-feature-divider" />
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div>
                <strong>Nationwide Service</strong>
                <span>Across Uganda & beyond</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <form onSubmit={handleSearch}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lead Number</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g., LD-2024-000001"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold">
                    {loading ? 'Searching...' : 'Track'}
                  </button>
                </div>
              </form>
              {error && <p className="text-red-600 mt-3">{error}</p>}
            </div>

            {lead && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{lead.lead_number}</h2>
                      <p className="text-gray-600">{lead.customer_name}</p>
                      {lead.company && <p className="text-gray-600">{lead.company}</p>}
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_COLORS[lead.status]}`}>
                      {STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Service</p>
                      <p className="font-medium">{lead.service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">{lead.district}, {lead.subcounty}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Submitted</p>
                      <p className="font-medium">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quotation</p>
                      <p className="font-medium">{lead.quotation_number || 'Not yet prepared'}</p>
                    </div>
                  </div>
                  {lead.project_reference && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-500">Project Reference</p>
                      <p className="font-medium text-green-600">{lead.project_reference}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
                  <p className="text-gray-700">{lead.description}</p>
                </div>

                {lead.quotation_number && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                    <p className="text-blue-800 mb-3">Your quotation is ready!</p>
                    <a href={`/track-quotation?quotation=${lead.quotation_number}`} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                      View Quotation
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
