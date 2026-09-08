'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteFrame } from "../site-shell";
import { field, getPublicSiteContent, image } from "../content-api";

interface Project {
  id: string;
  name: string;
  service_line: string;
  description?: string;
  scope_description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  cover_image?: string;
}

interface PublicSiteContent {
  pages: Record<string, {
    fields: Record<string, string>;
    images: Array<{ key: string; label: string; image_url: string | null; alt_text: string }>;
  }>;
  about: any;
  services: any[];
  public_projects: any[];
  testimonials: any[];
  blog_posts: any[];
}

async function fetchPublicProjects(): Promise<Project[]> {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/projects/public/');
    if (response.ok) {
      const data = await response.json();
      return data.results || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default function ProjectsPage() {
  const [content, setContent] = useState<PublicSiteContent | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const siteContent = await getPublicSiteContent();
      const projectData = await fetchPublicProjects();
      setContent(siteContent);
      setProjects(projectData);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <SiteFrame>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </SiteFrame>
    );
  }

  const categories = [...new Set(projects.map((project) => project.service_line))];
  const heroImages = [
    image(content, 'projects', 'hero_image_1'),
    image(content, 'projects', 'hero_image_2'),
    image(content, 'projects', 'hero_image_3'),
  ];

  const handleLocationClick = (project: Project) => {
    setSelectedProject(project);
  };

  const getMapSrc = () => {
    if (selectedProject && selectedProject.latitude && selectedProject.longitude) {
      return `https://www.google.com/maps?q=${selectedProject.latitude},${selectedProject.longitude}(${selectedProject.name.replace(/\s+/g, '+')})&z=12&output=embed`;
    } else if (projects.filter(p => p.latitude && p.longitude).length > 0) {
      return `https://www.google.com/maps?q=${projects.filter(p => p.latitude && p.longitude).map(p => `${p.latitude},${p.longitude}(${p.name.replace(/\s+/g, '+')})`).join('&')}&z=7&output=embed`;
    } else {
      return `https://www.google.com/maps?q=Uganda&z=7&output=embed`;
    }
  };

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage projects-hero hero-photo-stack">
          {heroImages.map((heroImage, index) => (
            <div className={`hero-photo hero-photo-${['one', 'two', 'three'][index]}`} key={index} role="img" aria-label={heroImage?.alt_text || ''} style={heroImage ? { backgroundImage: `url(${heroImage.image_url})` } : undefined} />
          ))}
          <div className="hero-centered">
            <p className="breadcrumb">Home / Projects</p>
            <p className="eyebrow">{field(content, "projects", "hero_eyebrow", "Portfolio")}</p>
            <h1>Our <span className="hero-blue-accent">Projects</span></h1>
            <p>{field(content, "projects", "hero_description", "Selected water engineering work across drilling, pumping, treatment, distribution, and maintenance support.")}</p>
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
          <div className="section-inner">
            <h2 className="section-title">{field(content, "projects", "categories_heading", "Project Categories")}</h2>
            <div className="category-row">
              {categories.map((category) => (
                <span className="category-pill" key={category}>{category}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <h2 className="section-title">{field(content, "projects", "cards_heading", "Our Projects")}</h2>
            <div className="projects-carousel">
              <div className="projects-carousel-track">
                {projects.map((project) => (
                  <Link href={`/projects/${project.id}`} className="project-card-carousel" key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {project.cover_image ? (
                      <img className="project-media" src={project.cover_image} alt={project.name} />
                    ) : (
                      <div className="image-placeholder project-media">
                        <span className="project-label">{project.location || 'No Location'}</span>
                      </div>
                    )}
                    <div className="project-body">
                      <p className="card-kicker">{project.service_line}</p>
                      <h3>{project.name}</h3>
                      <p>{project.description?.substring(0, 150) || project.scope_description?.substring(0, 150)}</p>
                      {project.location && <p className="project-location">📍 {project.location}</p>}
                    </div>
                  </Link>
                ))}
                {projects.map((project) => (
                  <Link href={`/projects/${project.id}`} className="project-card-carousel" key={`${project.id}-duplicate`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {project.cover_image ? (
                      <img className="project-media" src={project.cover_image} alt={project.name} />
                    ) : (
                      <div className="image-placeholder project-media">
                        <span className="project-label">{project.location || 'No Location'}</span>
                      </div>
                    )}
                    <div className="project-body">
                      <p className="card-kicker">{project.service_line}</p>
                      <h3>{project.name}</h3>
                      <p>{project.description?.substring(0, 150) || project.scope_description?.substring(0, 150)}</p>
                      {project.location && <p className="project-location">📍 {project.location}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            {projects.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No projects published yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="section-inner split-section">
            <div>
              <p className="eyebrow">{field(content, "projects", "locations_eyebrow", "Project Locations")}</p>
              <h2 className="section-title align-left">{field(content, "projects", "locations_heading", "Work across Uganda")}</h2>
              <p className="section-copy">{field(content, "projects", "locations_text", "Our projects span across Uganda, bringing water solutions to communities nationwide.")}</p>
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontWeight: 600, marginBottom: '10px' }}>Projects with locations:</p>
                {projects.filter(p => p.latitude && p.longitude).map((project) => (
                  <div
                    key={project.id}
                    style={{
                      marginBottom: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: selectedProject?.id === project.id ? '#e0f2fe' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => handleLocationClick(project)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedProject?.id === project.id ? '#e0f2fe' : '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedProject?.id === project.id ? '#e0f2fe' : 'transparent'}
                  >
                    <span style={{ fontWeight: 500 }}>{project.name}</span>
                    <span style={{ color: '#666', marginLeft: '8px' }}>📍 {project.location}</span>
                  </div>
                ))}
                {projects.filter(p => p.latitude && p.longitude).length === 0 && (
                  <p style={{ color: '#666', fontSize: '14px' }}>No projects with location data yet.</p>
                )}
                {selectedProject && (
                  <button
                    onClick={() => setSelectedProject(null)}
                    style={{
                      marginTop: '15px',
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Show All Projects
                  </button>
                )}
              </div>
            </div>
            <div className="map-container">
              <iframe
                src={getMapSrc()}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Spencer Water Services Project Locations - Uganda"
              />
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
