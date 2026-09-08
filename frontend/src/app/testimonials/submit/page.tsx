'use client';

import { useState } from 'react';
import { SiteFrame } from '../../site-shell';
import Link from 'next/link';

export default function SubmitTestimonialPage() {
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    rating: 5,
    content: '',
    project_reference: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/testimonials/public/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          customer_name: '',
          company_name: '',
          rating: 5,
          content: '',
          project_reference: '',
        });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit testimonial. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <SiteFrame>
        <main>
          <section className="section">
            <div className="section-inner" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Thank You!</h1>
                <p style={{ fontSize: '18px', color: '#6b7280', lineHeight: '1.6' }}>
                  Your testimonial has been submitted successfully and is pending review. 
                  Once approved, it will appear on our website.
                </p>
              </div>
              <Link 
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '12px 32px',
                  background: '#1e40af',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                }}
              >
                Return to Home
              </Link>
            </div>
          </section>
        </main>
      </SiteFrame>
    );
  }

  return (
    <SiteFrame>
      <main>
        <section className="section">
          <div className="section-inner" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p className="eyebrow">Share Your Experience</p>
              <h1 className="section-title">Submit a Testimonial</h1>
              <p className="section-copy">
                We value your feedback. Please share your experience working with Spencer Water Services.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ background: '#f9fafb', padding: '40px', borderRadius: '12px' }}>
              {error && (
                <div style={{
                  padding: '16px',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#991b1b',
                  marginBottom: '24px',
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                  placeholder="John Doe"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                  placeholder="Your Company Ltd."
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Rating *
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'white',
                  }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ - Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ - Very Good</option>
                  <option value={3}>⭐⭐⭐ - Good</option>
                  <option value={2}>⭐⭐ - Fair</option>
                  <option value={1}>⭐ - Poor</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Your Testimonial *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical',
                  }}
                  placeholder="Share your experience working with Spencer Water Services..."
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Project Reference (Optional)
                </label>
                <input
                  type="text"
                  name="project_reference"
                  value={formData.project_reference}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                  placeholder="e.g., Irrigation project in Namadope"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: submitting ? '#9ca3af' : '#1e40af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s ease',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Testimonial'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                Your testimonial will be reviewed before being published.
              </p>
            </form>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
