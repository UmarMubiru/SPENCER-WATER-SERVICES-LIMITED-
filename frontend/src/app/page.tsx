import Link from "next/link";
import { featuredProjects, testimonials } from "./site-data";
import { SiteFrame } from "./site-shell";
import { field, getPublicSiteContent, image } from "./content-api";

export const dynamic = 'force-dynamic';

async function fetchFeaturedProjects() {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/projects/public/', {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return (data.results || []).slice(0, 3).map((project: any) => ({
        title: project.name,
        description: project.description || project.scope_description,
        location: project.site_location,
        category: project.service_line,
        image: project.cover_image,
        id: project.id,
      }));
    }
    return featuredProjects;
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return featuredProjects;
  }
}

async function fetchTestimonials() {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/content/testimonials/public/', {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return (data.testimonials || []).slice(0, 6).map((testimonial: any) => ({
        quote: testimonial.content,
        company: testimonial.company_name || testimonial.customer_name,
        rating: testimonial.rating,
      }));
    }
    return testimonials.map((testimonial) => ({ ...testimonial, rating: 5 }));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return testimonials.map((testimonial) => ({ ...testimonial, rating: 5 }));
  }
}

export default async function Home() {
  const content = await getPublicSiteContent();
  const heroImages = [
    image(content, "home", "hero_image_1"),
    image(content, "home", "hero_image_2"),
    image(content, "home", "hero_image_3"),
  ];
  const projects = await fetchFeaturedProjects();
  const reviews = await fetchTestimonials();

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-home hero-photo-stack" id="home">
          {heroImages.map((heroImage, index) => (
            <div
              className={`hero-photo hero-photo-${["one", "two", "three"][index]}`}
              key={index}
              role="img"
              aria-label={heroImage?.alt_text || ""}
              style={heroImage ? { backgroundImage: `url(${heroImage.image_url})` } : undefined}
            />
          ))}
          <div className="hero-centered">
            <p className="eyebrow">{field(content, "home", "hero_eyebrow", "Water engineering across Uganda")}</p>
            <h1>Reliable <span className="hero-blue-accent">Water</span>. Sustainable <span className="hero-blue-accent">Future</span>.</h1>
            <p className="text-white">{field(content, "home", "hero_description", "Professional water engineering solutions for boreholes, solar water pumping, treatment, pipelines, plumbing, storage, and technical project support.")}</p>
            <div className="hero-actions center-actions">
              <Link className="btn btn-secondary" href="/services">Our Services</Link>
              <Link className="btn btn-primary" href="/quotation">Get Quote</Link>
            </div>
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

        <section className="section" id="featured-projects">
          <div className="section-inner">
            <h2 className="section-title">{field(content, "home", "featured_projects_heading", "Featured Projects")}</h2>
            <div className="featured-projects-carousel">
              <div className="featured-projects-carousel-track">
                {projects.map((project: any) => (
                  <Link href={project.id ? `/projects/${project.id}` : '#'} className="project-card-carousel" key={project.id || project.title} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {"image" in project && project.image ? (
                      <img className="project-media" src={project.image} alt={project.title} />
                    ) : <div className="image-placeholder project-media"><span className="project-label">{project.location}</span></div>}
                    <div className="project-body">
                      <p className="card-kicker">{project.category}</p>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                    </div>
                  </Link>
                ))}
                {projects.map((project: any) => (
                  <Link href={project.id ? `/projects/${project.id}` : '#'} className="project-card-carousel" key={`${project.id || project.title}-duplicate`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {"image" in project && project.image ? (
                      <img className="project-media" src={project.image} alt={project.title} />
                    ) : <div className="image-placeholder project-media"><span className="project-label">{project.location}</span></div>}
                    <div className="project-body">
                      <p className="card-kicker">{project.category}</p>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section soft-band" id="testimonials">
          <div className="section-inner">
            <h2 className="section-title">{field(content, "home", "testimonials_heading", "Testimonials")}</h2>
            <div className="testimonials-carousel">
              <div className="testimonials-carousel-track">
                {reviews.map((item: any) => (
                  <article className="testimonial-card-carousel" key={item.company}>
                    <p>&quot;{item.quote}&quot;</p>
                    <h3>{item.company}</h3>
                    <div className="rating">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </article>
                ))}
                {reviews.map((item: any) => (
                  <article className="testimonial-card-carousel" key={`${item.company}-duplicate`}>
                    <p>&quot;{item.quote}&quot;</p>
                    <h3>{item.company}</h3>
                    <div className="rating">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link
                href="/testimonials/submit"
                className="btn btn-secondary"
                style={{ display: 'inline-block' }}
              >
                Submit Your Testimonial
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
