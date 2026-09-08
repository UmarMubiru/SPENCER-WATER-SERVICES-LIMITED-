import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services as staticServices } from "../../site-data";
import { SiteFrame } from "../../site-shell";
import { getPublicSiteContent } from "../../content-api";
import FAQAccordion from "./FAQAccordion";
import GallerySection from "./GallerySection";

export const dynamic = 'force-dynamic';

const CMS_API_URL = (process.env.CMS_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

// Map service slugs to quotation form service IDs
const slugToServiceId: { [key: string]: string } = {
  'borehole-drilling': 'borehole_drilling',
  'solar-water-pumping': 'solar_pump_installation',
  'water-treatment': 'water_treatment',
  'pipeline-installation': 'pipeline_extension',
  'plumbing-services': 'plumbing',
  'water-storage': 'water_storage',
  'water-taps-accessories': 'maintenance',
  'water-engineering-consultancy': 'other',
};

const SOLAR_ADVANTAGE_CARDS = [
  { title: 'Lower Running Costs', description: 'Solar energy reduces dependence on fuel and grid electricity for day-to-day pumping.' },
  { title: 'Reliable Water Access', description: 'A correctly sized system delivers dependable water for homes, farms, institutions, and businesses.' },
  { title: 'Clean Energy', description: 'Solar pumping uses renewable energy and supports more sustainable water supply projects.' },
  { title: 'Ideal for Remote Sites', description: 'The system can serve locations where grid power is unavailable, costly, or unreliable.' },
];

const SERVICE_PROCESS_STEPS: Record<string, Array<{ title: string; description: string }>> = {
  'borehole-drilling': [
    { title: 'Site Survey', description: 'We assess the location, access, groundwater conditions, and the project water requirements.' },
    { title: 'Rig Mobilisation', description: 'The drilling rig, tools, casing, compressor, and safety equipment are moved safely to site.' },
    { title: 'Borehole Drilling', description: 'The borehole is drilled to the required depth while the geological formations are monitored.' },
    { title: 'Casing & Development', description: 'Casing, screens, and gravel pack are installed, then the borehole is developed for clean water flow.' },
    { title: 'Test Pumping & Handover', description: 'We test yield and water performance, commission the system, and provide operating guidance.' },
  ],
  'solar-water-pumping-systems': [
    { title: 'Site Assessment', description: 'We assess the water source, daily demand, pumping head, available sunlight, and installation location.' },
    { title: 'System Sizing', description: 'The team selects the right solar array, pump, controller, cabling, and storage capacity for the site.' },
    { title: 'Equipment Installation', description: 'Solar panels, mounting structures, pumps, pipes, controls, and protection devices are installed safely.' },
    { title: 'Testing & Commissioning', description: 'We test water flow, pressure, electrical connections, and system controls before handover.' },
    { title: 'Handover & Guidance', description: 'You receive operating guidance, basic maintenance advice, and the information needed to use the system confidently.' },
  ],
  'pipeline-installation': [
    { title: 'Route Survey & Planning', description: 'We confirm the pipeline route, ground conditions, required capacity, and connection points.' },
    { title: 'Site Preparation', description: 'The route is set out and prepared, including safe trenching where required.' },
    { title: 'Pipe Laying & Jointing', description: 'Pipes, valves, fittings, and connections are installed to the approved layout.' },
    { title: 'Pressure Testing', description: 'The completed line is tested for strength, leaks, flow, and reliable operation.' },
    { title: 'Backfilling & Handover', description: 'We reinstate the site, commission the pipeline, and hand over operating guidance.' },
  ],
  'water-storage-solutions': [
    { title: 'Site Assessment', description: 'We confirm the required storage capacity, location, water source, and outlet connections.' },
    { title: 'Foundation Preparation', description: 'A stable, level foundation or support structure is prepared for the selected tank system.' },
    { title: 'Tank Positioning', description: 'The tank, reservoir, or supporting structure is installed safely in its final position.' },
    { title: 'Pipework & Fittings', description: 'Inlet, outlet, overflow, valves, and related connections are fitted and secured.' },
    { title: 'Testing & Handover', description: 'The storage system is tested for leaks and flow, then handed over with care guidance.' },
  ],
};

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return staticServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublicSiteContent();
  const cmsService = content?.services.find((item) => item.slug === slug);
  const staticService = staticServices.find((item) => item.slug === slug);
  const serviceName = cmsService?.name || staticService?.title;
  const serviceDescription = cmsService?.description || staticService?.description;

  if (!serviceName || !serviceDescription) {
    return {
      title: "Service | Spencer Water Services Ltd",
    };
  }

  return {
      title: cmsService?.meta_title || `${serviceName} | Spencer Water Services Ltd`,
      description: cmsService?.meta_description || serviceDescription,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const content = await getPublicSiteContent();
  const cmsService = content?.services.find((item) => item.slug === slug);
  const staticService = staticServices.find((item) => item.slug === slug);

  if (!cmsService && !staticService) {
    notFound();
  }

  // Fetch gallery images for this service from the folder
  let galleryImages: Array<{ id: number; url: string; name: string; alt_text: string }> = [];
  try {
    const galleryResponse = await fetch(`${CMS_API_URL}/api/content/media/?folder=${slug}-gallery`, {
      cache: "no-store",
    });
    if (galleryResponse.ok) {
      const galleryData = await galleryResponse.json();
      galleryImages = galleryData.assets || [];
    }
  } catch (error) {
    console.error('Error fetching gallery images:', error);
  }

  const service = cmsService
    ? {
      slug: cmsService.slug,
      icon: cmsService.icon,
      title: cmsService.name,
      description: cmsService.description,
      heroEyebrow: cmsService.hero_eyebrow,
      heroTitle: cmsService.hero_title,
      heroDescription: cmsService.hero_description,
      heroImage: cmsService.hero_image,
      heroImages: cmsService.hero_images || [cmsService.hero_image],
      heroAltText: cmsService.hero_alt_text,
      metaTitle: cmsService.meta_title,
      metaDescription: cmsService.meta_description,
      sections: cmsService.sections.length
        ? cmsService.sections.map((section) => [section.label, section.heading, section.content, section.image, section.alt_text, section.process_images || []] as const)
        : staticService?.sections.map(([title, copy]) => [title, title, copy, null, "", []] as const) || [["Service overview", cmsService.name, cmsService.description, null, "", []]],
      faqs: cmsService.faqs || [],
    }
    : staticService ? {
      ...staticService,
      heroEyebrow: 'Spencer Water Services Ltd',
      heroTitle: staticService.title,
      heroDescription: staticService.description,
      heroImage: null,
      heroImages: [],
      heroAltText: '',
      metaTitle: '',
      metaDescription: '',
      sections: staticService.sections.map(([label, copy]) => [label, label, copy, null, '', []] as const),
      faqs: [],
    } : null;

  if (!service) notFound();

  const [introSection, ...contentSections] = service.sections;
  const populatedHeroImages = service.heroImages.filter((image): image is string => Boolean(image));
  const introProcessSteps = SERVICE_PROCESS_STEPS[service.slug];
  const isIntroProcessSection = Boolean(introProcessSteps) && (introSection[0].toLowerCase().includes('process') || introSection[0].toLowerCase() === 'installation');
  const introProcessImages = introSection[5].filter((image): image is string => Boolean(image));

  return (
    <SiteFrame>
      <main>
        <section className={`hero hero-subpage${populatedHeroImages.length ? ' hero-photo-stack' : ''}`}>
          {populatedHeroImages.slice(0, 3).map((heroImage, index) => (
            <div
              key={index}
              className={`hero-photo hero-photo-${['one', 'two', 'three'][index]}`}
              role="img"
              aria-label={`${service.title} hero image ${index + 1}`}
              style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
            />
          ))}
          <div className="hero-centered">
            <Link href="/services" className="back-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
              Back to Services
            </Link>
            <p className="breadcrumb"><Link href="/">Home</Link> / <span className="breadcrumb-accent">Services</span> / <span className="breadcrumb-accent">{service.title}</span></p>
            <p className="eyebrow">{service.heroEyebrow}</p>
            <h1 className="service-page-hero-title" dangerouslySetInnerHTML={{ __html: service.heroTitle.replace(/(\b(?:Water|Solar|Borehole|Pumping|Treatment|Pipeline|Plumbing|Storage|Engineering)\b)/gi, '<span class="hero-blue-accent">$1</span>') }} />
            <p>{service.heroDescription}</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={`/quotation?service=${slugToServiceId[slug] || 'other'}`}>Request Quotation</Link>
              <Link className="btn btn-secondary" href="/services">All Services</Link>
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

        <section className="section">
          {isIntroProcessSection ? (
            <div className="section-inner split-section process-section">
              {introProcessImages.length ? (
                <div className="process-image-rotator process-section-visual" role="img" aria-label={introSection[4] || introSection[1]}>
                  {introProcessImages.slice(0, 3).map((image, index) => <div key={image} className={`hero-photo hero-photo-${['one', 'two', 'three'][index]}`} style={{ backgroundImage: `url(${image})` }} />)}
                </div>
              ) : <div className="image-placeholder process-section-visual">Drilling Process Images</div>}
              <div>
                <p className="eyebrow">{service.title}</p>
                <h2 className="section-title align-left">{introSection[1]}</h2>
                <ol className="process-steps-enhanced">
                  {(introProcessSteps || []).map((step, stepIndex) => (
                    <li key={step.title} className="process-step-enhanced">
                      <span className="step-number-enhanced">{stepIndex + 1}</span>
                      <div className="step-content-enhanced">
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="section-inner split-section">
              <div>
                <p className="eyebrow">{introSection[0]}</p>
                <h2 className="section-title align-left">{introSection[1]}</h2>
                <p className="section-copy">{introSection[2]}</p>
              </div>
              {service.heroImage ? <img className="water-visual" src={service.heroImage} alt={service.heroAltText || service.title} /> : <div className="image-placeholder water-visual">{service.icon}</div>}
            </div>
          )}
        </section>

        {contentSections.map(([label, heading, copy, sectionImage, altText, processImages], index) => {
          const processSteps = SERVICE_PROCESS_STEPS[service.slug];
          const isProcessSection = Boolean(processSteps) && (label.toLowerCase().includes('process') || label.toLowerCase() === 'installation');

          return (
          <section className={index % 2 === 0 ? "section soft-band" : "section"} key={label}>
            {isProcessSection ? (
              <div className="section-inner split-section process-section">
                {processImages && processImages.length ? (
                  <div className="process-image-rotator process-section-visual" role="img" aria-label={altText || heading}>
                    {processImages.slice(0, 3).map((image, imageIndex) => (
                      <div key={image} className={`hero-photo hero-photo-${['one', 'two', 'three'][imageIndex]}`} style={{ backgroundImage: `url(${image})` }} />
                    ))}
                  </div>
                ) : sectionImage ? <img className="process-section-visual" src={sectionImage} alt={altText || heading} /> : <div className="image-placeholder process-section-visual">Process Images</div>}
                <div>
                  <p className="eyebrow">{service.title}</p>
                  <h2 className="section-title align-left">{heading}</h2>
                <ol className="process-steps-enhanced">
                  {(processSteps || []).map((step, stepIndex) => (
                    <li key={step.title} className="process-step-enhanced">
                      <span className="step-number-enhanced">{stepIndex + 1}</span>
                      <div className="step-content-enhanced">
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                </div>
              </div>
            ) : label.toLowerCase().includes('benefits') || label.toLowerCase().includes('advantages') ? (
              <div className="section-inner">
                <p className="eyebrow">{service.title}</p>
                <h2 className="section-title align-left">{heading}</h2>
                <div className="benefits-carousel">
                  <div className="benefits-carousel-track">
                    {(() => {
                      const cards = copy.split('\n\n')
                        .filter((benefit) => benefit.trim())
                        .map((benefit) => benefit.match(/\*\*(.*?)\*\* — (.*?)$/))
                        .filter((match): match is RegExpMatchArray => Boolean(match))
                        .map((match) => ({ title: match[1], description: match[2] }));
                      const useSolarDefaults = service.slug === 'solar-water-pumping-systems' && label.toLowerCase().includes('advantages');
                      const displayedCards = (cards.length ? cards : useSolarDefaults ? SOLAR_ADVANTAGE_CARDS : []).slice(0, useSolarDefaults ? 4 : 6);
                      const icons = ['💧', '🌊', '💰', '🔒', '🌾', '🏠'];

                      // Duplicate cards for infinite scrolling
                      const carouselCards = [...displayedCards, ...displayedCards];

                      return carouselCards.map((card, cardIndex) => (
                        <div key={`${card.title}-${cardIndex}`} className="benefit-card-carousel">
                          <div className="benefit-icon">{icons[cardIndex % icons.length] || '✓'}</div>
                          <h3>{card.title}</h3>
                          <p>{card.description}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`section-inner split-section ${index % 2 === 0 ? "reverse" : ""}`}>
                {sectionImage ? <img className="service-section-visual" src={sectionImage} alt={altText || heading} /> : <div className="image-placeholder service-section-visual">{label}</div>}
                <div>
                  <p className="eyebrow">{service.title}</p>
                  <h2 className="section-title align-left">{heading}</h2>
                  <p className="section-copy">{copy}</p>
                </div>
              </div>
            )}
          </section>
          );
        })}

        {service.faqs.length > 0 && (
          <section className="section soft-band">
            <div className="section-inner">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <FAQAccordion faqs={service.faqs} />
            </div>
          </section>
        )}

        {galleryImages.length > 0 && (
          <GallerySection images={galleryImages} />
        )}

        <section className="section">
          <div className="section-inner cta-band">
            <div>
              <p className="eyebrow">Project support</p>
              <h2>Talk to Spencer Water about {service.title.toLowerCase()}</h2>
            </div>
            <Link className="btn btn-secondary" href={`/quotation?service=${slugToServiceId[slug] || 'other'}`}>Request Quotation</Link>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
