'use client';

import { useState, useEffect } from 'react';
import { field, getPublicSiteContent, image } from "../content-api";
import { SiteFrame } from "../site-shell";
import CountryCodeSelector from "../../components/CountryCodeSelector";

export default function ContactPage() {
  const [content, setContent] = useState<any>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    description: '',
  });
  const [countryCode, setCountryCode] = useState('256');

  useEffect(() => {
    getPublicSiteContent().then(setContent);
  }, []);

  if (!content) {
    return <SiteFrame><main><div className="section-inner">Loading...</div></main></SiteFrame>;
  }

  const mapImage = image(content, "contact", "map_image");
  const heroImages = [
    image(content, "contact", "hero_image_1"),
    image(content, "contact", "hero_image_2"),
    image(content, "contact", "hero_image_3"),
  ];

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage contact-hero hero-photo-stack">
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
            <p className="breadcrumb">{field(content, "contact", "breadcrumb_text", "Home / Contact Us")}</p>
            <p className="eyebrow">{field(content, "contact", "hero_eyebrow", "Get in touch")}</p>
            <h1>Contact <span className="hero-blue-accent">Us</span></h1>
            <p>{field(content, "contact", "hero_description", "Reach Spencer Water Services for project quotations, site visits, maintenance support, and technical water-service enquiries.")}</p>
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
          <div className="section-inner contact-grid">
            <form className="quotation-form">
              <div className="form-grid">
                <label>
                  {field(content, "contact", "form_name_label", "Full name")}
                  <input
                    placeholder={field(content, "contact", "form_name_placeholder", "Your name")}
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                </label>
                <label>
                  {field(content, "contact", "form_phone_label", "Phone number")}
                  <div className="flex">
                    <CountryCodeSelector
                      value={countryCode}
                      onChange={setCountryCode}
                    />
                    <input
                      placeholder={field(content, "contact", "form_phone_placeholder", "700 123 456")}
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </label>
                <label className="span-two">
                  {field(content, "contact", "form_email_label", "Email address")}
                  <input
                    placeholder={field(content, "contact", "form_email_placeholder", "name@example.com")}
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </label>
                <label className="span-two">
                  {field(content, "contact", "form_message_label", "Message")}
                  <textarea
                    placeholder={field(content, "contact", "form_message_placeholder", "How can Spencer Water Services help?")}
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  const whatsappNumbers = field(content, "contact", "whatsapp_numbers", "256785257314");
                  const firstNumber = whatsappNumbers.split(',')[0].trim();
                  const message = `Hello Spencer Water Services,\n\nName: ${formData.customer_name}\nPhone: +${countryCode}${formData.phone}\nEmail: ${formData.email}\n\nMessage: ${formData.description}`;
                  const whatsappUrl = `https://wa.me/${firstNumber}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="btn btn-primary"
                style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white' }}
              >
                Send via WhatsApp
              </button>
            </form>

            <aside className="contact-panel">
              <h2 className="section-title align-left">{field(content, "contact", "office_heading", "Office Details")}</h2>
              <div className="contact-list">
                <div><strong>{field(content, "contact", "phone_label", "Phone")}</strong>{field(content, "contact", "phone", "+256 700 123 456")}</div>
                <div><strong>{field(content, "contact", "email_label", "Email")}</strong>{field(content, "contact", "email", "info@spencerwaterservices.co.ug")}</div>
                <div><strong>{field(content, "contact", "office_label", "Office")}</strong>{field(content, "contact", "office_address", "Kampala, Uganda")}</div>
                <div><strong>{field(content, "contact", "business_hours_label", "Business hours")}</strong>{field(content, "contact", "business_hours", "Monday to Saturday, 8:00 AM - 6:00 PM")}</div>
                <div><strong>{field(content, "contact", "emergency_contact_label", "Emergency contact")}</strong>{field(content, "contact", "emergency_contact", "+256 700 123 456")}</div>
              </div>
            </aside>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps?q=G7H2+76M+Town+Centre,+Namayumba+Health+Center+IV+Lane,+Namayumba&output=embed"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Spencer Water Services Location - Town Centre, Namayumba Health Center IV Lane, Namayumba"
              />
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
