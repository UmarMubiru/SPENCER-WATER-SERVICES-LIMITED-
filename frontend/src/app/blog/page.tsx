import { blogPosts } from "../site-data";
import { SiteFrame } from "../site-shell";

export default function BlogPage() {
  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage">
          <div className="section-inner subpage-hero-content">
            <p className="breadcrumb">Home / Blog</p>
            <p className="eyebrow">Articles and updates</p>
            <h1>Blog</h1>
            <p>
              Practical notes about water systems, project planning, maintenance,
              and choosing the right solution for each site.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section-inner split-section">
            <div>
              <p className="eyebrow">Search articles</p>
              <h2 className="section-title align-left">Find guidance by topic</h2>
              <p className="section-copy">
                Blog search and categories can connect to the CMS when the backend content
                workflow is ready.
              </p>
            </div>
            <form className="article-search" role="search">
              <input aria-label="Search articles" placeholder="Search articles" type="search" />
              <button className="btn btn-primary" type="submit">Search</button>
            </form>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <h2 className="section-title">Latest Articles</h2>
            <div className="card-grid testimonial-grid">
              {blogPosts.map((post) => (
                <article className="info-card" key={post.title}>
                  <p className="card-kicker">{post.category}</p>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
