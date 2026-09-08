import Link from "next/link";
import { services } from "../site-data";
import { SiteFrame } from "../site-shell";
import { field, getPublicSiteContent, image } from "../content-api";

export default async function ServicesPage() {
  const content = await getPublicSiteContent();
  const serviceCards = content?.services.length
    ? content.services.map((service) => ({
        slug: service.slug,
        icon: service.icon,
        title: service.name,
        description: service.short_description || service.description,
        heroImage: service.hero_image
      }))
    : services;
  const overviewImage = image(content, 'services', 'overview_image');
  const heroImages = [
    image(content, 'services', 'hero_image_1'),
    image(content, 'services', 'hero_image_2'),
    image(content, 'services', 'hero_image_3'),
  ];

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage hero-photo-stack">
          {heroImages.map((heroImage, index) => (
            <div className={`hero-photo hero-photo-${['one', 'two', 'three'][index]}`} key={index} role="img" aria-label={heroImage?.alt_text || ''} style={heroImage ? { backgroundImage: `url(${heroImage.image_url})` } : undefined} />
          ))}
          <div className="hero-centered">
            <p className="breadcrumb"><Link href="/">Home</Link> / Services</p>
            <p className="eyebrow">{field(content, 'services', 'hero_eyebrow', 'What we do')}</p>
            <h1><span className="hero-blue-accent">Water</span> Engineering Services</h1>
            <p>{field(content, 'services', 'hero_description', 'Complete water services covering boreholes, solar water pumping, treatment, plumbing, pipelines, storage, accessories, and technical consultancy.')}</p>
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
          <div className="section-inner split-section">
            <div>
              <p className="eyebrow">{field(content, 'services', 'overview_eyebrow', 'Service overview')}</p>
              <h2 className="section-title align-left">{field(content, 'services', 'overview_heading', 'Practical systems for reliable water supply')}</h2>
              <p className="section-copy">{field(content, 'services', 'overview_text', 'Each service is planned around source conditions, water demand, site constraints, durability, maintenance, and the long-term value of the installation.')}</p>
              <Link className="btn btn-primary" href="/quotation">{field(content, 'services', 'overview_button', 'Request Quotation')}</Link>
            </div>
            {overviewImage ? <img className="water-visual" src={overviewImage.image_url} alt={overviewImage.alt_text} /> : <div className="image-placeholder water-visual">SERVICE IMAGE</div>}
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <h2 className="section-title">{field(content, 'services', 'list_heading', 'Explore Services')}</h2>
            <div className="card-grid services-overview-grid">
              {serviceCards.map((service) => (
                <Link className="service-card service-card-wide" href={`/services/${service.slug}`} key={service.slug}>
                  {'heroImage' in service && service.heroImage ? (
                    <img
                      className="service-card-image"
                      src={(service as any).heroImage}
                      alt={service.title}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        marginRight: '16px'
                      }}
                    />
                  ) : (
                    <div className="icon-badge">{service.icon}</div>
                  )}
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner cta-band">
            <div>
              <p className="eyebrow">{field(content, 'services', 'cta_eyebrow', 'Need a site-specific recommendation?')}</p>
              <h2>{field(content, 'services', 'cta_heading', 'Request a project quotation')}</h2>
            </div>
            <Link className="btn btn-secondary" href="/quotation">{field(content, 'services', 'cta_button', 'Start Request')}</Link>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
