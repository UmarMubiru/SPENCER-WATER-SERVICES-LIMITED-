import { SiteFrame } from "../site-shell";

export default function ContactPage() {
  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage">
          <div className="section-inner subpage-hero-content">
            <p className="breadcrumb">Home / Contact Us</p>
            <p className="eyebrow">Get in touch</p>
            <h1>Contact Us</h1>
            <p>
              Reach Spencer Water Services for project quotations, site visits,
              maintenance support, and technical water-service enquiries.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section-inner contact-grid">
            <form className="quotation-form">
              <div className="form-grid">
                <label>
                  Full name
                  <input placeholder="Your name" />
                </label>
                <label>
                  Phone number
                  <input placeholder="+256..." />
                </label>
                <label className="span-two">
                  Email address
                  <input placeholder="name@example.com" />
                </label>
                <label className="span-two">
                  Message
                  <textarea placeholder="How can Spencer Water Services help?" />
                </label>
              </div>
              <button className="btn btn-primary" type="submit">Send Message</button>
            </form>

            <aside className="contact-panel">
              <h2 className="section-title align-left">Office Details</h2>
              <div className="contact-list">
                <div><strong>Phone</strong>+256 700 123 456</div>
                <div><strong>Email</strong>info@spencerwaterservices.co.ug</div>
                <div><strong>Office</strong>Kampala, Uganda</div>
                <div><strong>Business hours</strong>Monday to Saturday, 8:00 AM - 6:00 PM</div>
                <div><strong>Emergency contact</strong>+256 700 123 456</div>
              </div>
            </aside>
          </div>
        </section>

        <section className="section soft-band">
          <div className="section-inner">
            <div className="image-placeholder">GOOGLE MAP</div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
