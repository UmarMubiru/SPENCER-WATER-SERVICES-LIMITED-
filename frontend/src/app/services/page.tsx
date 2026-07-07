import Link from "next/link";
import { services } from "../site-data";
import { SiteFrame } from "../site-shell";

export default function ServicesPage() {
  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage">
          <div className="section-inner subpage-hero-content">
            <p className="breadcrumb"><Link href="/">Home</Link> / Services</p>
            <p className="eyebrow">What we do</p>
            <h1>Water Engineering Services</h1>
            <p>
              Complete water services covering boreholes, solar water pumping, treatment,
              plumbing, pipelines, storage, accessories, and technical consultancy.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section-inner split-section">
            <div>
              <p className="eyebrow">Service overview</p>
              <h2 className="section-title align-left">Practical systems for reliable water supply</h2>
              <p className="section-copy">
                Each service is planned around source conditions, water demand, site constraints,
                durability, maintenance, and the long-term value of the installation.
              </p>
              <Link className="btn btn-primary" href="/quotation">Request Quotation</Link>
            </div>
            <div className="image-placeholder water-visual">SERVICE IMAGE</div>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <h2 className="section-title">Explore Services</h2>
            <div className="card-grid services-overview-grid">
              {services.map((service) => (
                <Link className="service-card service-card-wide" href={`/services/${service.slug}`} key={service.slug}>
                  <div className="icon-badge">{service.icon}</div>
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
              <p className="eyebrow">Need a site-specific recommendation?</p>
              <h2>Request a project quotation</h2>
            </div>
            <Link className="btn btn-secondary" href="/quotation">Start Request</Link>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
