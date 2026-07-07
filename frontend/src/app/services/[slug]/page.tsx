import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "../../site-data";
import { SiteFrame } from "../../site-shell";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return {
      title: "Service | Spencer Water Services Ltd",
    };
  }

  return {
    title: `${service.title} | Spencer Water Services Ltd`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    notFound();
  }

  const [introSection, ...contentSections] = service.sections;

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage">
          <div className="section-inner subpage-hero-content">
            <p className="breadcrumb"><Link href="/">Home</Link> / <Link href="/services">Services</Link> / {service.title}</p>
            <p className="eyebrow">Spencer Water Services Ltd</p>
            <h1>{service.title}</h1>
            <p>{service.description}</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/quotation">Request Quotation</Link>
              <Link className="btn btn-secondary" href="/services">All Services</Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner split-section">
            <div>
              <p className="eyebrow">{introSection[0]}</p>
              <h2 className="section-title align-left">{service.title}</h2>
              <p className="section-copy">{introSection[1]}</p>
            </div>
            <div className="image-placeholder water-visual">{service.icon}</div>
          </div>
        </section>

        {contentSections.map(([title, copy], index) => (
          <section className={index % 2 === 0 ? "section soft-band" : "section"} key={title}>
            <div className={`section-inner split-section ${index % 2 === 0 ? "reverse" : ""}`}>
              <div className="image-placeholder service-section-visual">{title}</div>
              <div>
                <p className="eyebrow">{service.title}</p>
                <h2 className="section-title align-left">{title}</h2>
                <p className="section-copy">{copy}</p>
              </div>
            </div>
          </section>
        ))}

        <section className="section">
          <div className="section-inner cta-band">
            <div>
              <p className="eyebrow">Project support</p>
              <h2>Talk to Spencer Water about {service.title.toLowerCase()}</h2>
            </div>
            <Link className="btn btn-secondary" href="/quotation">Request Quotation</Link>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
