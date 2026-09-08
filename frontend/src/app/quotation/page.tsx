'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { services } from "../site-data";
import { SiteFrame } from "../site-shell";
import { field, getPublicSiteContent, image } from "../content-api";
import CountryCodeSelector from "../../components/CountryCodeSelector";

const SERVICE_OPTIONS = [
  { id: 'borehole_drilling', label: 'Borehole Drilling' },
  { id: 'solar_pump_installation', label: 'Solar Pump Installation' },
  { id: 'water_treatment', label: 'Water Treatment' },
  { id: 'pipeline_extension', label: 'Pipeline Extension' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'water_storage', label: 'Water Storage' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'water_taps_accessories', label: 'Water Taps & Accessories' },
  { id: 'other', label: 'Other' },
];

const BUDGET_OPTIONS = [
  { id: 'under_10m', label: 'Under 10M' },
  { id: '10_50m', label: '10–50M' },
  { id: '50_100m', label: '50–100M' },
  { id: '100m_plus', label: '100M+' },
  { id: 'not_sure', label: 'Not Sure' },
];

const TIMELINE_OPTIONS = [
  { id: 'urgent', label: 'Urgent' },
  { id: '1_month', label: '1 Month' },
  { id: '3_months', label: '3 Months' },
  { id: 'flexible', label: 'Flexible' },
];

const CONTACT_METHODS = [
  { id: 'phone', label: 'Phone Call', icon: '📞' },
  { id: 'email', label: 'Email', icon: '✉️' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'sms', label: 'SMS', icon: '💬' },
];

// Service-specific questions for dynamic form
const SERVICE_QUESTIONS: { [key: string]: Array<{ id: string; label: string; type: string; placeholder?: string; options?: Array<{ id: string; label: string }> }> } = {
  borehole_drilling: [
    { id: 'depth_estimate', label: 'Estimated Depth Required (meters)', type: 'text', placeholder: 'e.g., 60-80m' },
    { id: 'current_water_source', label: 'Current Water Source', type: 'select', options: [
      { id: 'none', label: 'No current source' },
      { id: 'shallow_well', label: 'Shallow well' },
      { id: 'rainwater', label: 'Rainwater harvesting' },
      { id: 'public_tap', label: 'Public tap' },
      { id: 'other', label: 'Other' },
    ]},
    { id: 'intended_use', label: 'Intended Use', type: 'select', options: [
      { id: 'domestic', label: 'Domestic household' },
      { id: 'institution', label: 'School/Institution' },
      { id: 'commercial', label: 'Commercial/Business' },
      { id: 'agriculture', label: 'Agriculture/Irrigation' },
      { id: 'community', label: 'Community project' },
    ]},
    { id: 'estimated_users', label: 'Estimated Number of Users', type: 'text', placeholder: 'e.g., 500 people' },
    { id: 'power_source', label: 'Power Source Available', type: 'select', options: [
      { id: 'grid', label: 'Grid electricity' },
      { id: 'solar', label: 'Solar' },
      { id: 'generator', label: 'Generator' },
      { id: 'none', label: 'None - need recommendation' },
    ]},
    { id: 'terrain_type', label: 'Terrain Type', type: 'select', options: [
      { id: 'flat', label: 'Flat' },
      { id: 'hilly', label: 'Hilly' },
      { id: 'rocky', label: 'Rocky' },
      { id: 'swampy', label: 'Swampy' },
    ]},
  ],
  solar_pump_installation: [
    { id: 'existing_borehole', label: 'Do you have an existing borehole?', type: 'select', options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ]},
    { id: 'borehole_depth', label: 'If yes, what is the borehole depth?', type: 'text', placeholder: 'Depth in meters' },
    { id: 'pumping_distance', label: 'Required Pumping Distance (meters)', type: 'text', placeholder: 'Horizontal distance to storage' },
    { id: 'elevation_rise', label: 'Elevation Rise (meters)', type: 'text', placeholder: 'Vertical lift required' },
    { id: 'daily_water_requirement', label: 'Daily Water Requirement (liters)', type: 'text', placeholder: 'e.g., 5000 liters/day' },
    { id: 'solar_exposure', label: 'Solar Exposure at Site', type: 'select', options: [
      { id: 'excellent', label: 'Excellent (full day sun)' },
      { id: 'good', label: 'Good (6-8 hours)' },
      { id: 'moderate', label: 'Moderate (4-6 hours)' },
      { id: 'poor', label: 'Poor (less than 4 hours)' },
    ]},
  ],
  water_treatment: [
    { id: 'water_source', label: 'Water Source to be Treated', type: 'select', options: [
      { id: 'borehole', label: 'Borehole' },
      { id: 'surface_water', label: 'Surface water (lake/river)' },
      { id: 'rainwater', label: 'Rainwater' },
      { id: 'municipal', label: 'Municipal supply' },
      { id: 'other', label: 'Other' },
    ]},
    { id: 'water_issues', label: 'Current Water Quality Issues', type: 'select', options: [
      { id: 'bacterial', label: 'Bacterial contamination' },
      { id: 'turbidity', label: 'High turbidity/murky' },
      { id: 'iron', label: 'Iron content' },
      { id: 'hardness', label: 'Hard water' },
      { id: 'ph', label: 'pH imbalance' },
      { id: 'taste_odor', label: 'Bad taste/odor' },
      { id: 'unknown', label: 'Unknown - need testing' },
    ]},
    { id: 'treatment_capacity', label: 'Required Treatment Capacity (liters/hour)', type: 'text', placeholder: 'e.g., 1000 L/hr' },
    { id: 'intended_application', label: 'Intended Application', type: 'select', options: [
      { id: 'drinking', label: 'Drinking water only' },
      { id: 'household', label: 'Full household use' },
      { id: 'commercial', label: 'Commercial/industrial' },
      { id: 'irrigation', label: 'Irrigation' },
    ]},
  ],
  pipeline_extension: [
    { id: 'pipeline_length', label: 'Required Pipeline Length (meters)', type: 'text', placeholder: 'Total length needed' },
    { id: 'pipe_diameter', label: 'Preferred Pipe Diameter', type: 'select', options: [
      { id: '25mm', label: '25mm (1 inch)' },
      { id: '32mm', label: '32mm (1.25 inch)' },
      { id: '50mm', label: '50mm (2 inch)' },
      { id: '63mm', label: '63mm (2.5 inch)' },
      { id: '75mm', label: '75mm (3 inch)' },
      { id: '90mm', label: '90mm (3.5 inch)' },
      { id: '110mm', label: '110mm (4 inch)' },
      { id: 'unsure', label: 'Not sure - need recommendation' },
    ]},
    { id: 'connection_point', label: 'Connection Point', type: 'select', options: [
      { id: 'main_line', label: 'Main water line' },
      { id: 'existing_tank', label: 'Existing storage tank' },
      { id: 'borehole', label: 'Borehole' },
      { id: 'new_source', label: 'New water source needed' },
    ]},
    { id: 'terrain', label: 'Installation Terrain', type: 'select', options: [
      { id: 'open', label: 'Open land' },
      { id: 'urban', label: 'Urban/developed area' },
      { id: 'rocky', label: 'Rocky terrain' },
      { id: 'road_crossing', label: 'Requires road crossing' },
    ]},
    { id: 'number_of_outlets', label: 'Number of Connection Points/Outlets', type: 'text', placeholder: 'e.g., 10 connections' },
  ],
  plumbing: [
    { id: 'project_type', label: 'Plumbing Project Type', type: 'select', options: [
      { id: 'new_installation', label: 'New installation' },
      { id: 'renovation', label: 'Renovation/upgrade' },
      { id: 'repair', label: 'Repair work' },
      { id: 'maintenance', label: 'Maintenance' },
    ]},
    { id: 'building_type', label: 'Building Type', type: 'select', options: [
      { id: 'residential', label: 'Residential house' },
      { id: 'commercial', label: 'Commercial building' },
      { id: 'institutional', label: 'School/Institution' },
      { id: 'industrial', label: 'Industrial facility' },
    ]},
    { id: 'number_of_rooms', label: 'Number of Rooms/Fixtures', type: 'text', placeholder: 'e.g., 10 rooms, 5 bathrooms' },
    { id: 'floors', label: 'Number of Floors', type: 'text', placeholder: 'e.g., 2 floors' },
    { id: 'hot_water_required', label: 'Hot Water System Required?', type: 'select', options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ]},
  ],
  water_storage: [
    { id: 'storage_purpose', label: 'Storage Purpose', type: 'select', options: [
      { id: 'domestic', label: 'Domestic use' },
      { id: 'irrigation', label: 'Irrigation' },
      { id: 'emergency', label: 'Emergency backup' },
      { id: 'commercial', label: 'Commercial/industrial' },
      { id: 'rainwater', label: 'Rainwater harvesting' },
    ]},
    { id: 'tank_capacity', label: 'Required Tank Capacity (liters)', type: 'select', options: [
      { id: '1000', label: '1,000 liters' },
      { id: '2000', label: '2,000 liters' },
      { id: '3000', label: '3,000 liters' },
      { id: '5000', label: '5,000 liters' },
      { id: '10000', label: '10,000 liters' },
      { id: 'custom', label: 'Custom capacity - specify below' },
    ]},
    { id: 'custom_capacity', label: 'If custom, specify capacity', type: 'text', placeholder: 'Custom capacity in liters' },
    { id: 'tank_type', label: 'Preferred Tank Type', type: 'select', options: [
      { id: 'plastic', label: 'Plastic (polyethylene)' },
      { id: 'steel', label: 'Steel' },
      { id: 'concrete', label: 'Concrete' },
      { id: 'fiberglass', label: 'Fiberglass' },
      { id: 'unsure', label: 'Not sure - need recommendation' },
    ]},
    { id: 'installation_location', label: 'Installation Location', type: 'select', options: [
      { id: 'ground', label: 'Ground level' },
      { id: 'elevated', label: 'Elevated/stand' },
      { id: 'underground', label: 'Underground' },
      { id: 'rooftop', label: 'Rooftop' },
    ]},
  ],
  maintenance: [
    { id: 'equipment_type', label: 'Equipment Type', type: 'select', options: [
      { id: 'borehole', label: 'Borehole system' },
      { id: 'solar_pump', label: 'Solar pump system' },
      { id: 'treatment', label: 'Water treatment system' },
      { id: 'plumbing', label: 'Plumbing system' },
      { id: 'storage', label: 'Storage tanks' },
      { id: 'other', label: 'Other equipment' },
    ]},
    { id: 'issue_description', label: 'Issue/Problem Description', type: 'text', placeholder: 'Describe the problem' },
    { id: 'age_of_equipment', label: 'Age of Equipment', type: 'select', options: [
      { id: 'less_1', label: 'Less than 1 year' },
      { id: '1_3', label: '1-3 years' },
      { id: '3_5', label: '3-5 years' },
      { id: '5_10', label: '5-10 years' },
      { id: 'over_10', label: 'Over 10 years' },
      { id: 'unknown', label: 'Unknown' },
    ]},
    { id: 'maintenance_type', label: 'Maintenance Type Required', type: 'select', options: [
      { id: 'routine', label: 'Routine maintenance' },
      { id: 'repair', label: 'Repair' },
      { id: 'replacement', label: 'Part replacement' },
      { id: 'upgrade', label: 'System upgrade' },
      { id: 'inspection', label: 'Inspection only' },
    ]},
  ],
  water_taps_accessories: [
    { id: 'item_type', label: 'Type of Items Needed', type: 'select', options: [
      { id: 'taps', label: 'Water Taps' },
      { id: 'pipes', label: 'Pipes & Fittings' },
      { id: 'valves', label: 'Valves' },
      { id: 'accessories', label: 'Plumbing Accessories' },
      { id: 'complete_set', label: 'Complete Installation Set' },
      { id: 'other', label: 'Other Items' },
    ]},
    { id: 'quantity_estimate', label: 'Estimated Quantity', type: 'text', placeholder: 'e.g., 50 taps, 100 meters of pipe' },
    { id: 'application', label: 'Application/Purpose', type: 'select', options: [
      { id: 'residential', label: 'Residential Building' },
      { id: 'commercial', label: 'Commercial Building' },
      { id: 'industrial', label: 'Industrial Facility' },
      { id: 'institutional', label: 'School/Institution' },
      { id: 'replacement', label: 'Replacement/Repair' },
      { id: 'other', label: 'Other Purpose' },
    ]},
    { id: 'specifications', label: 'Specific Requirements', type: 'textarea', placeholder: 'Any specific brands, sizes, or specifications required' },
    { id: 'installation_needed', label: 'Installation Service Required?', type: 'select', options: [
      { id: 'yes', label: 'Yes, need installation' },
      { id: 'no', label: 'No, materials only' },
      { id: 'unsure', label: 'Not sure yet' },
    ]},
  ],
  other: [
    { id: 'service_description', label: 'Please describe the service you need', type: 'textarea', placeholder: 'Detailed description of your requirements' },
  ],
};

function QuotationPageContent() {
  const searchParams = useSearchParams();
  const [content, setContent] = useState<any>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    company: '',
    phone: '',
    email: '',
    preferred_contact: '',
    district: '',
    subcounty: '',
    village: '',
    address: '',
    gps: '',
    service: '',
    description: '',
    budget_range: '',
    timeline: '',
    // Service-specific answers
    service_answers: {} as { [key: string]: string },
  });
  const [countryCode, setCountryCode] = useState('256');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [leadNumber, setLeadNumber] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getPublicSiteContent().then(setContent);
  }, []);

  // Handle URL parameter for service pre-selection
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam && SERVICE_OPTIONS.find(s => s.id === serviceParam)) {
      setSelectedServices([serviceParam]);
      // Set primary service for backward compatibility
      setFormData(prev => ({ ...prev, service: serviceParam }));
    }
  }, [searchParams]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleServiceAnswerChange = (questionId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      service_answers: {
        ...prev.service_answers,
        [questionId]: value,
      },
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(leadNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('customer_name', formData.customer_name);
      formDataToSend.append('company', formData.company);
      formDataToSend.append('phone', `+${countryCode}${formData.phone}`);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('preferred_contact', formData.preferred_contact);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('subcounty', formData.subcounty);
      formDataToSend.append('village', formData.village);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('gps', formData.gps);
      // Send primary service for backward compatibility
      formDataToSend.append('service', selectedServices[0]);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('budget_range', formData.budget_range);
      formDataToSend.append('timeline', formData.timeline);
      formDataToSend.append('source', 'website');

      // Send all selected services as a JSON array
      formDataToSend.append('services', JSON.stringify(selectedServices));

      // Add service-specific answers for each selected service
      selectedServices.forEach(serviceId => {
        const questions = SERVICE_QUESTIONS[serviceId as keyof typeof SERVICE_QUESTIONS] || [];
        questions.forEach(q => {
          const value = formData.service_answers[`${serviceId}_${q.id}`];
          if (value) {
            formDataToSend.append(`${serviceId}_${q.id}`, value);
          }
        });
      });

      // Add files
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const response = await fetch('http://127.0.0.1:8000/api/quotations/public/leads/', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        setLeadNumber(data.lead_number);
        setSubmitSuccess(true);

        // Upload files if any
        if (files.length > 0) {
          const formDataUpload = new FormData();
          files.forEach(file => formDataUpload.append('file', file));
          formDataUpload.append('lead', data.id);

          await fetch('http://127.0.0.1:8000/api/quotations/lead-attachments/', {
            method: 'POST',
            body: formDataUpload,
          });
        }
      } else {
        alert('Error submitting lead. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Error submitting lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <SiteFrame>
        <main>
          <section className="hero hero-subpage hero-photo-stack">
            {[
              image(content, 'quotation', 'hero_image_1'),
              image(content, 'quotation', 'hero_image_2'),
              image(content, 'quotation', 'hero_image_3')
            ].map((heroImage, index) => (
              <div
                className={`hero-photo hero-photo-${["one", "two", "three"][index]}`}
                key={index}
                role="img"
                aria-label={heroImage?.alt_text || ""}
                style={heroImage ? { backgroundImage: `url(${heroImage.image_url})` } : undefined}
              />
            ))}
            <div className="hero-centered">
              <p className="breadcrumb">Home / Request Consultation & Quotation</p>
              <p className="eyebrow">Success</p>
              <h1>Thank <span className="hero-blue-accent">You</span></h1>
              <p>Your inquiry has been received successfully.</p>
            </div>
          </section>

          <section className="section">
            <div className="section-inner">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    <span className="text-2xl">✓</span>
                    Lead Submitted Successfully
                  </h2>
                </div>
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <p className="text-gray-600 mb-2">Your Lead Number</p>
                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-4 relative">
                      <p className="text-3xl font-bold text-green-700 tracking-wider">{leadNumber}</p>
                      <button
                        onClick={copyToClipboard}
                        className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <span className="text-green-600 text-xl">✓</span>
                        ) : (
                          <span className="text-gray-600 text-xl">📋</span>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      {copied ? 'Copied to clipboard!' : 'Click the copy icon or save this number to track your inquiry status'}
                    </p>
                  </div>
                  <p className="text-gray-600 mb-6">
                    We'll contact you within 24 hours to discuss your water solution requirements.
                  </p>
                  <a
                    href={`/track-lead?lead=${leadNumber}`}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    <span>🔍</span>
                    Track Your Request
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>
      </SiteFrame>
    );
  }

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage hero-photo-stack">
          {[
            image(content, 'quotation', 'hero_image_1'),
            image(content, 'quotation', 'hero_image_2'),
            image(content, 'quotation', 'hero_image_3')
          ].map((heroImage, index) => (
            <div
              className={`hero-photo hero-photo-${["one", "two", "three"][index]}`}
              key={index}
              role="img"
              aria-label={heroImage?.alt_text || ""}
              style={heroImage ? { backgroundImage: `url(${heroImage.image_url})` } : undefined}
            />
          ))}
          <div className="hero-centered">
            <p className="breadcrumb">Home / Request Consultation & Quotation</p>
            <p className="eyebrow">{field(content, 'quotation', 'hero_eyebrow', 'Project enquiry')}</p>
            <h1>Request <span className="hero-blue-accent">Consultation</span> & Quotation</h1>
            <p>{field(content, 'quotation', 'hero_subheadline', 'Need a water solution? Tell us about your project and our engineers will review your requirements.')}</p>
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
          <div className="section-inner">
            <p className="section-copy max-w-4xl mx-auto mb-8 text-center text-lg text-gray-600">{field(content, 'quotation', 'form_intro', 'Complete the form below and we will prepare a professional quotation for your project.')}</p>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
              {/* Customer Information Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Customer Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Company name (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                      <div className="flex">
                        <CountryCodeSelector
                          value={countryCode}
                          onChange={setCountryCode}
                        />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="flex-1 px-4 py-3 border border-l-0 border-gray-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                          placeholder="700 123 456"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="name@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Contact Method</label>
                      <select
                        value={formData.preferred_contact}
                        onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                      >
                        <option value="">Select your preferred contact method</option>
                        {CONTACT_METHODS.map((method) => (
                          <option key={method.id} value={method.id}>{method.icon} {method.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Location Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    Project Location
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="District"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sub County</label>
                      <input
                        type="text"
                        value={formData.subcounty}
                        onChange={(e) => setFormData({ ...formData, subcounty: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Sub County"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Village</label>
                      <input
                        type="text"
                        value={formData.village}
                        onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Village"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">GPS Coordinates</label>
                      <input
                        type="text"
                        value={formData.gps}
                        onChange={(e) => setFormData({ ...formData, gps: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Latitude, Longitude"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Physical Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Full physical address"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Required Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">⚙️</span>
                    Services Required
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">Select all services you need (you can choose multiple)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SERVICE_OPTIONS.map((service) => (
                      <label
                        key={service.id}
                        className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedServices.includes(service.id)
                            ? 'border-purple-500 bg-purple-50 shadow-md scale-105'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => {
                            handleServiceToggle(service.id);
                            // Update primary service for backward compatibility
                            if (selectedServices.length === 0 || selectedServices[0] === service.id) {
                              setFormData(prev => ({ ...prev, service: service.id }));
                            }
                          }}
                          className="sr-only"
                        />
                        <div className="text-3xl mb-2">
                          {service.id === 'borehole_drilling' ? '💧' :
                           service.id === 'solar_pump_installation' ? '☀️' :
                           service.id === 'water_treatment' ? '🔬' :
                           service.id === 'pipeline_extension' ? '🔧' :
                           service.id === 'plumbing' ? '🚿' :
                           service.id === 'water_storage' ? '🏊' :
                           service.id === 'maintenance' ? '🔨' : '📋'}
                        </div>
                        <span className="text-sm font-medium text-center">{service.label}</span>
                        {selectedServices.includes(service.id) && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Service-Specific Questions Card */}
              {selectedServices.length > 0 && selectedServices.map((serviceId, index) => (
                SERVICE_QUESTIONS[serviceId as keyof typeof SERVICE_QUESTIONS] && (
                  <div key={serviceId} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        {SERVICE_OPTIONS.find(s => s.id === serviceId)?.label} Details
                      </h2>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-amber-700 mb-5 bg-amber-50 p-3 rounded-lg">
                        Please provide additional details to help us prepare an accurate quotation.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {SERVICE_QUESTIONS[serviceId as keyof typeof SERVICE_QUESTIONS].map((question) => (
                          <div key={`${serviceId}_${question.id}`} className={question.type === 'textarea' ? 'md:col-span-2' : ''}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {question.label}
                            </label>
                            {question.type === 'select' ? (
                              <select
                                value={formData.service_answers[`${serviceId}_${question.id}`] || ''}
                                onChange={(e) => handleServiceAnswerChange(`${serviceId}_${question.id}`, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-gray-50 focus:bg-white"
                              >
                                <option value="">Select an option</option>
                                {question.options?.map((opt) => (
                                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                              </select>
                            ) : question.type === 'textarea' ? (
                              <textarea
                                value={formData.service_answers[`${serviceId}_${question.id}`] || ''}
                                onChange={(e) => handleServiceAnswerChange(`${serviceId}_${question.id}`, e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-gray-50 focus:bg-white resize-none"
                                placeholder={question.placeholder}
                              />
                            ) : (
                              <input
                                type="text"
                                value={formData.service_answers[`${serviceId}_${question.id}`] || ''}
                                onChange={(e) => handleServiceAnswerChange(`${serviceId}_${question.id}`, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-gray-50 focus:bg-white"
                                placeholder={question.placeholder}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              ))}

              {/* Project Description Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    Project Description
                  </h2>
                </div>
                <div className="p-6">
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white resize-none"
                    placeholder="Describe your project. Current water source. Estimated users. Expected completion. Challenges."
                  />
                </div>
              </div>

              {/* Budget and Timeline Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    Budget & Timeline
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Range (Optional)</label>
                      <select
                        value={formData.budget_range}
                        onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50 focus:bg-white"
                      >
                        <option value="">Select budget range</option>
                        {BUDGET_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Timeline</label>
                      <select
                        value={formData.timeline}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50 focus:bg-white"
                      >
                        <option value="">Select timeline</option>
                        {TIMELINE_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📎</span>
                    Attachments
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">Upload photos, BOQs, drawings, reports, or tender documents</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-rose-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-4xl mb-3">📁</div>
                      <p className="text-gray-700 font-medium">Click to upload files</p>
                      <p className="text-gray-500 text-sm">or drag and drop</p>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 p-3 bg-rose-50 rounded-lg">
                      <p className="text-sm text-rose-700 font-medium">{files.length} file(s) selected</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>📤</span>
                    Submit Request
                  </span>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}

export default function QuotationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuotationPageContent />
    </Suspense>
  );
}
