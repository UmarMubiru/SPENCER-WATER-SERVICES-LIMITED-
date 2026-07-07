import Link from "next/link";
import { featuredProjects, testimonials } from "./site-data";
import { SiteFrame } from "./site-shell";

export default function Home() {
  return (
    <SiteFrame>
      <main>
        <section className="hero hero-home hero-photo-stack" id="home">
          <div className="hero-photo hero-photo-one" />
          <div className="hero-photo hero-photo-two" />
          <div className="hero-photo hero-photo-three" />
          <div className="section-inner hero-centered">
            <p className="eyebrow">Water engineering across Uganda</p>
            <h1>Reliable Water.<br />Sustainable Future.</h1>
            <p>
              Professional water engineering solutions for boreholes, solar water pumping,
              treatment, pipelines, plumbing, storage, and technical project support.
            </p>
            <div className="hero-actions center-actions">
              <Link className="btn btn-secondary" href="/services">Our Services</Link>
              <Link className="btn btn-primary" href="/quotation">Get Quote</Link>
            </div>
          </div>
        </section>

        <section className="section" id="featured-projects">
          <div className="section-inner">
            <h2 className="section-title">Featured Projects</h2>
            <div className="card-grid project-grid">
              {featuredProjects.map((project) => (
                <article className="project-card" key={project.title}>
                  <div className="image-placeholder project-media">
                    <span className="project-label">{project.location}</span>
                  </div>
                  <div className="project-body">
                    <p className="card-kicker">{project.category}</p>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section soft-band" id="testimonials">
          <div className="section-inner">
            <h2 className="section-title">Testimonials</h2>
            <div className="card-grid testimonial-grid">
              {testimonials.map((item) => (
                <article className="testimonial-card" key={item.company}>
                  <p>&quot;{item.quote}&quot;</p>
                  <h3>{item.company}</h3>
                  <div className="rating">*****</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
