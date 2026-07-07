import { SiteFrame } from "../site-shell";

const values = [
  ["Reliability", "We design and install systems that clients can depend on after handover."],
  ["Technical care", "Projects are guided by site conditions, water demand, and long-term maintainability."],
  ["Clear service", "Clients should understand the scope, process, cost drivers, and next steps."],
  ["Community impact", "Good water systems improve homes, farms, institutions, and local businesses."],
];

const team = [
  ["Technical Director", "Water engineering, project design, and field supervision."],
  ["Operations Lead", "Scheduling, procurement, site coordination, and client updates."],
  ["Service Team", "Installation, maintenance, repairs, and commissioning support."],
];

export default function AboutPage() {
  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage">
          <div className="section-inner subpage-hero-content">
            <p className="breadcrumb">Home / About Us</p>
            <p className="eyebrow">Company profile</p>
            <h1>About Spencer Water Services Ltd</h1>
            <p>
              A water engineering company supporting homes, institutions, farms,
              businesses, and communities with practical water systems across Uganda.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section-inner split-section">
            <div>
              <p className="eyebrow">Company overview</p>
              <h2 className="section-title align-left">Built around dependable water access</h2>
              <p className="section-copy">
                Spencer Water Services Ltd provides borehole drilling, solar water pumping,
                water treatment, pipeline installation, plumbing, storage solutions, accessories,
                and water engineering consultancy.
              </p>
            </div>
            <div className="image-placeholder water-visual">COMPANY IMAGE</div>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner split-section reverse">
            <div className="image-placeholder service-section-visual">MISSION</div>
            <div>
              <p className="eyebrow">Mission and vision</p>
              <h2 className="section-title align-left">Practical solutions, lasting service</h2>
              <p className="section-copy">
                Our mission is to deliver technically sound water systems that solve real needs.
                Our vision is to be a trusted water-services partner for reliable, sustainable
                water infrastructure across Uganda.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            <h2 className="section-title">Core Values</h2>
            <div className="card-grid why-grid">
              {values.map(([title, copy]) => (
                <article className="info-card" key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <h2 className="section-title">Management Team</h2>
            <div className="card-grid testimonial-grid">
              {team.map(([title, copy]) => (
                <article className="info-card" key={title}>
                  <div className="icon-badge">{title.slice(0, 2).toUpperCase()}</div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
