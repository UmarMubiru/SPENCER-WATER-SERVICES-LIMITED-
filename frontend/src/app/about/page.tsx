import { SiteFrame } from "../site-shell";
import { field, getPublicSiteContent, image } from "../content-api";

function firstAvailableField(
  content: Awaited<ReturnType<typeof getPublicSiteContent>>,
  keys: string[],
  fallback: string,
) {
  return keys.map((key) => field(content, "about", key, "")).find((value) => value.trim()) || fallback;
}

const fallbackValues = [
  ["Reliability", "We design and install systems that clients can depend on after handover."],
  ["Technical care", "Projects are guided by site conditions, water demand, and long-term maintainability."],
  ["Clear service", "Clients should understand the scope, process, cost drivers, and next steps."],
  ["Community impact", "Good water systems improve homes, farms, institutions, and local businesses."],
];

const fallbackTeam = [
  { id: null, name: "Technical Director", role_title: "Technical Director", bio: "Water engineering, project design, and field supervision.", photo_url: null, display_order: 0 },
  { id: null, name: "Operations Lead", role_title: "Operations Lead", bio: "Scheduling, procurement, site coordination, and client updates.", photo_url: null, display_order: 0 },
  { id: null, name: "Service Team", role_title: "Service Team", bio: "Installation, maintenance, repairs, and commissioning support.", photo_url: null, display_order: 0 },
];

export default async function AboutPage() {
  const content = await getPublicSiteContent();
  const values = content?.about.core_values.length
    ? content.about.core_values.map((value) => [value.title, value.description] as const)
    : fallbackValues;
  const team = content?.about.team_members.length
    ? content.about.team_members
    : fallbackTeam;
  const companyImage = image(content, "about", "company_image");
  const missionImage = image(content, "about", "mission_image");
  const heroImages = [
    image(content, "about", "hero_image_1"),
    image(content, "about", "hero_image_2"),
    image(content, "about", "hero_image_3"),
  ];

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage about-hero hero-photo-stack">
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
            <p className="breadcrumb">Home / About Us</p>
            <p className="eyebrow">{field(content, "about", "hero_eyebrow", "Company profile")}</p>
            <h1>About <span className="hero-blue-accent">Spencer Water Services</span> Ltd</h1>
            <p>{firstAvailableField(content, ["hero_subheadline", "hero_description"], "A water engineering company supporting homes, institutions, farms, businesses, and communities with practical water systems across Uganda.")}</p>
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
              <p className="eyebrow">{field(content, "about", "overview_eyebrow", "Company overview")}</p>
              <h2 className="section-title align-left">{firstAvailableField(content, ["company_overview_title", "overview_heading"], "Built around dependable water access")}</h2>
              <p className="section-copy">
                {firstAvailableField(content, ["company_overview", "company_overview_text"], "Spencer Water Services Ltd provides borehole drilling, solar water pumping, water treatment, pipeline installation, plumbing, storage solutions, accessories, and water engineering consultancy.")}
              </p>
            </div>
            {companyImage ? (
              <img className="water-visual" src={companyImage.image_url} alt={companyImage.alt_text} />
            ) : <div className="image-placeholder water-visual">COMPANY IMAGE</div>}
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner split-section reverse">
            {missionImage ? (
              <img className="service-section-visual" src={missionImage.image_url} alt={missionImage.alt_text} />
            ) : <div className="image-placeholder service-section-visual">MISSION</div>}
            <div>
              <p className="eyebrow">{field(content, "about", "mission_eyebrow", "Mission and vision")}</p>
              <h2 className="section-title align-left">{firstAvailableField(content, ["mission_title", "mission_heading"], "Practical solutions, lasting service")}</h2>
              <p className="section-copy">
                {firstAvailableField(content, ["mission", "mission_text"], "Our mission is to deliver technically sound water systems that solve real needs.")}
              </p>
              <h3 className="about-vision-title">{firstAvailableField(content, ["vision_title"], "Our Vision")}</h3>
              <p className="section-copy">{firstAvailableField(content, ["vision", "vision_text"], "Our vision is to be a trusted water-services partner for reliable, sustainable water infrastructure across Uganda.")}</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            <h2 className="section-title">{field(content, "about", "values_heading", "Core Values")}</h2>
            <div className="core-values-carousel">
              <div className="core-values-carousel-track">
                {values.map(([title, copy]) => (
                  <article className="core-value-card-carousel" key={title}>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </article>
                ))}
                {values.map(([title, copy]) => (
                  <article className="core-value-card-carousel" key={`${title}-duplicate`}>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <h2 className="section-title">{firstAvailableField(content, ["team_section_title", "team_heading"], "Management Team")}</h2>
            <p className="section-copy team-section-description">{firstAvailableField(content, ["team_section_description"], "")}</p>
            <div className="team-carousel">
              <div className="team-carousel-track">
                {team.map((member) => (
                  <a
                    href={member.id ? `/about/team/${member.id}` : '#'}
                    className="team-card-carousel"
                    key={`${member.name}-${member.role_title}`}
                    style={{ textDecoration: 'none', color: 'inherit', cursor: member.id ? 'pointer' : 'default' }}
                  >
                    {member.photo_url ? (
                      <img className="team-member-photo" src={member.photo_url} alt={member.name} />
                    ) : (
                      <div className="icon-badge">{member.role_title.slice(0, 2).toUpperCase()}</div>
                    )}
                    <h3>{member.name}</h3>
                    <p className="team-member-role">{member.role_title}</p>
                    <p>{member.bio}</p>
                  </a>
                ))}
                {team.map((member) => (
                  <a
                    href={member.id ? `/about/team/${member.id}` : '#'}
                    className="team-card-carousel"
                    key={`${member.name}-${member.role_title}-duplicate`}
                    style={{ textDecoration: 'none', color: 'inherit', cursor: member.id ? 'pointer' : 'default' }}
                  >
                    {member.photo_url ? (
                      <img className="team-member-photo" src={member.photo_url} alt={member.name} />
                    ) : (
                      <div className="icon-badge">{member.role_title.slice(0, 2).toUpperCase()}</div>
                    )}
                    <h3>{member.name}</h3>
                    <p className="team-member-role">{member.role_title}</p>
                    <p>{member.bio}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
