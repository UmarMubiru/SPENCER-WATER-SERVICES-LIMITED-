'use client';

import { useState, useEffect, use } from "react";
import { SiteFrame } from "../../site-shell";
import Link from "next/link";
import GallerySection from "./GallerySection";

interface Project {
  id: string;
  name: string;
  service_line: string;
  description: string;
  project_reference: string;
  location?: string;
  status: string;
  completion_percentage: number;
  actual_start_date?: string;
  actual_completion_date?: string;
  contract_value?: number;
  latitude?: number;
  longitude?: number;
  cover_image?: string;
  gallery_images?: Array<{ url: string; caption: string }>;
  milestones?: Array<{ title: string; description: string; target_date: string; is_completed: boolean }>;
  hero_images?: Array<string>;
  challenge?: string;
  approach?: string;
  result_coverage?: string;
  result_units_installed?: string;
  result_infrastructure?: string;
  result_other?: string;
  result_delivery_timing?: string;
  related_projects?: Array<{ id: string; name: string; service_line: string; location?: string; cover_image?: string }>;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectDetail() {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/projects/public/${id}/`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        }
      } catch (error) {
        console.error('Error fetching project detail:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectDetail();
  }, [id]);

  if (loading) {
    return (
      <SiteFrame>
        <main>
          <section className="hero hero-subpage">
            <div className="section-inner subpage-hero-content">
              <p className="breadcrumb">Home / Projects</p>
              <h1>Loading...</h1>
            </div>
          </section>
        </main>
      </SiteFrame>
    );
  }

  if (!project) {
    return (
      <SiteFrame>
        <main>
          <section className="hero hero-subpage">
            <div className="section-inner subpage-hero-content">
              <p className="breadcrumb">Home / Projects</p>
              <h1>Project Not Found</h1>
              <p>The project you're looking for doesn't exist or hasn't been published.</p>
              <Link className="btn btn-primary" href="/projects" style={{ marginTop: '20px', display: 'inline-block' }}>
                Back to Projects
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
        {/* Hero Section with 3 Image Slots */}
        <section className={`hero hero-home hero-subpage${project.hero_images && project.hero_images.length ? ' hero-photo-stack' : ''}`}>
          {project.hero_images && project.hero_images.length > 0 ? (
            project.hero_images.slice(0, 3).map((heroImage, index) => (
              <div
                key={index}
                className={`hero-photo hero-photo-${['one', 'two', 'three'][index]}`}
                role="img"
                aria-label={`${project.name} hero image ${index + 1}`}
                style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
              />
            ))
          ) : project.cover_image ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${project.cover_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : null}
          <div className="hero-centered">
            <p className="breadcrumb" style={{ color: 'white' }}>
              <Link href="/projects" style={{ color: 'white', textDecoration: 'none' }}>Home / Projects</Link> / {project.name}
            </p>
            <p className="eyebrow" style={{ color: 'white', textTransform: 'uppercase', letterSpacing: '2px' }}>{project.service_line}</p>
            <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>{project.name}</h1>
            {project.location && (
              <p style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>
                {project.location}
              </p>
            )}
            {project.project_reference && (
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}>
                {project.project_reference}
              </p>
            )}
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

        {/* Quick Facts Row */}
        <section style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <div className="section-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', padding: '32px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>{project.status}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Progress</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{project.completion_percentage}%</p>
            </div>
            {project.actual_start_date && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Started</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#374151' }}>
                  {new Date(project.actual_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
            {project.actual_completion_date && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Completed</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#374151' }}>
                  {new Date(project.actual_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* The Challenge */}
        {project.challenge && (
          <section className="section">
            <div className="section-inner" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <p className="eyebrow" style={{ marginBottom: '16px' }}>The Challenge</p>
              <h2 className="section-title" style={{ marginBottom: '24px' }}>What Prompted This Project</h2>
              <p className="section-copy" style={{ fontSize: '18px', lineHeight: '1.8', color: '#374151' }}>
                {project.challenge}
              </p>
            </div>
          </section>
        )}

        {/* Our Approach */}
        {project.approach && (
          <section className="section soft-band">
            <div className="section-inner" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <p className="eyebrow" style={{ marginBottom: '16px' }}>Our Approach</p>
              <h2 className="section-title" style={{ marginBottom: '24px' }}>What We Did</h2>
              <p className="section-copy" style={{ fontSize: '18px', lineHeight: '1.8', color: '#374151' }}>
                {project.approach}
              </p>
            </div>
          </section>
        )}

        {/* The Result */}
        {(project.result_coverage || project.result_units_installed || project.result_infrastructure || project.result_other || project.result_delivery_timing) && (
          <section className="section">
            <div className="section-inner" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <p className="eyebrow" style={{ marginBottom: '16px' }}>The Result</p>
              <h2 className="section-title" style={{ marginBottom: '24px' }}>Project Outcomes</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                {project.result_coverage && (
                  <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Coverage</p>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#16a34a' }}>{project.result_coverage}</p>
                  </div>
                )}
                {project.result_units_installed && (
                  <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Units Installed</p>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#1e40af' }}>{project.result_units_installed}</p>
                  </div>
                )}
                {project.result_infrastructure && (
                  <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Infrastructure</p>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#b45309' }}>{project.result_infrastructure}</p>
                  </div>
                )}
                {project.result_other && (
                  <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px', borderLeft: '4px solid #6b7280' }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Additional</p>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>{project.result_other}</p>
                  </div>
                )}
                {project.result_delivery_timing && (
                  <div style={{ padding: '20px', background: '#fce7f3', borderRadius: '8px', borderLeft: '4px solid #db2777' }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Delivery</p>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#be185d' }}>{project.result_delivery_timing}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Project Gallery - only show if images exist */}
        {project.gallery_images && project.gallery_images.length > 0 && (
          <GallerySection images={project.gallery_images.map((img, idx) => ({ id: idx.toString(), url: img.url, caption: img.caption }))} />
        )}

        {/* Location Map */}
        {project.latitude && project.longitude && (
          <section className="section soft-band">
            <div className="section-inner" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <p className="eyebrow">Project Location</p>
                <h2 className="section-title">Where This Project Took Place</h2>
                {project.location && <p className="section-copy">{project.location}</p>}
              </div>
              <div className="map-container" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <iframe
                  src={`https://www.google.com/maps?q=${project.latitude},${project.longitude}&z=15&output=embed`}
                  width="100%"
                  height="500"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${project.name} Location`}
                />
              </div>
            </div>
          </section>
        )}

        {/* Related Projects */}
        {project.related_projects && project.related_projects.length > 0 && (
          <section className="section">
            <div className="section-inner" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <p className="eyebrow">More Projects</p>
                <h2 className="section-title">Related {project.service_line} Projects</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {project.related_projects.map((relatedProject) => (
                  <Link
                    key={relatedProject.id}
                    href={`/projects/${relatedProject.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      background: 'white',
                      border: '1px solid #e5e7eb',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {relatedProject.cover_image ? (
                        <img
                          src={relatedProject.cover_image}
                          alt={relatedProject.name}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '200px',
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af',
                        }}>
                          No image
                        </div>
                      )}
                      <div style={{ padding: '20px' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                          {relatedProject.service_line}
                        </p>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                          {relatedProject.name}
                        </h3>
                        {relatedProject.location && (
                          <p style={{ fontSize: '14px', color: '#6b7280' }}>
                            {relatedProject.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="section">
          <div className="section-inner cta-band">
            <div>
              <p className="eyebrow">Interested in similar projects?</p>
              <h2>Request a quotation for your water engineering needs</h2>
            </div>
            <Link className="btn btn-secondary" href="/quotation">
              Request Quote
            </Link>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
