import { services } from "../site-data";
import { SiteFrame } from "../site-shell";

export default function QuotationPage() {
  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage">
          <div className="section-inner subpage-hero-content">
            <p className="breadcrumb">Home / Request Quotation</p>
            <p className="eyebrow">Project enquiry</p>
            <h1>Request Quotation</h1>
            <p>
              Share customer details, service requirements, project information, and supporting files
              so Spencer Water Services can prepare a clear response.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section-inner quotation-layout">
            <form className="quotation-form">
              <div className="form-grid">
                <label>
                  Full name
                  <input placeholder="Client name" />
                </label>
                <label>
                  Phone number
                  <input placeholder="+256..." />
                </label>
                <label>
                  Email address
                  <input placeholder="name@example.com" />
                </label>
                <label>
                  Location
                  <input placeholder="District or project site" />
                </label>
                <label className="span-two">
                  Service selection
                  <select defaultValue="">
                    <option value="" disabled>Select a service</option>
                    {services.map((service) => (
                      <option value={service.slug} key={service.slug}>{service.title}</option>
                    ))}
                  </select>
                </label>
                <label className="span-two">
                  Project information
                  <textarea placeholder="Tell us about the water source, site, timelines, and expected water use." />
                </label>
                <label className="span-two">
                  File upload
                  <input type="file" />
                </label>
              </div>
              <button className="btn btn-primary" type="submit">Submit Request</button>
            </form>

            <aside className="quote-aside">
              <p className="eyebrow">Quotation checklist</p>
              <h2>Helpful details</h2>
              <ul>
                <li>Project location and access notes</li>
                <li>Preferred service or problem to solve</li>
                <li>Water source, demand, or existing system details</li>
                <li>Photos, sketches, test results, or documents</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
