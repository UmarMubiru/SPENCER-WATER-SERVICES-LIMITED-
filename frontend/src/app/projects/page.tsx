import { featuredProjects } from "../site-data";
import { SiteFrame } from "../site-shell";

const categories = ["Borehole Drilling", "Solar Water Pumping", "Water Treatment", "Pipeline Installation"];

export default function ProjectsPage() {
  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage">
          <div className="section-inner subpage-hero-content">
            <p className="breadcrumb">Home / Projects</p>
            <p className="eyebrow">Portfolio</p>
            <h1>Projects</h1>
            <p>
              Selected water engineering work across drilling, pumping, treatment,
              distribution, and maintenance support.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            <h2 className="section-title">Project Categories</h2>
            <div className="category-row">
              {categories.map((category) => (
                <span className="category-pill" key={category}>{category}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <h2 className="section-title">Project Cards</h2>
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

        <section className="section">
          <div className="section-inner split-section">
            <div>
              <p className="eyebrow">Locations</p>
              <h2 className="section-title align-left">Work across Uganda</h2>
              <p className="section-copy">
                Project locations can be expanded into a map, district list, and individual
                project-detail pages as real media and client approvals are added.
              </p>
            </div>
            <div className="image-placeholder">PROJECT MAP</div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
