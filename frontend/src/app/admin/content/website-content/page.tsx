'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Edit2, Trash2, Plus, Save, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { AdminLayout } from '../../components/AdminLayout';
import PageHeader from '../../../../components/admin/ui/PageHeader';

interface PageField {
  id: number;
  page: string;
  key: string;
  label: string;
  field_type: string;
  value: string;
  display_order: number;
  updated_at: string;
}

interface PageImage {
  id: number;
  page: string;
  key: string;
  label: string;
  image: string;
  image_url: string;
  image_url_display: string;
  alt_text: string;
  updated_at: string;
  sectionId?: number;
}

interface CoreValue {
  id: number;
  title: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

interface TeamMember {
  id: number;
  employee?: number | null;
  employee_id?: number | null;
  employee_name?: string | null;
  name: string;
  display_name?: string;
  role_title: string;
  bio: string;
  photo: string;
  photo_url: string;
  display_order: number;
  is_active: boolean;
}

interface Testimonial {
  id: number;
  customer_name: string;
  company_name: string;
  content: string;
  rating: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  is_featured: boolean;
}

interface ManagedProject {
  id: string;
  name: string;
  scope_description: string;
  site_location: string;
  service_line: string;
  is_portfolio_candidate: boolean;
  is_published: boolean;
  cover_image?: string;
  cover_image_url?: string;
  public_description?: string;
  latitude?: string;
  longitude?: string;
  gallery_images?: Array<{ id: string; url: string; caption: string }>;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  icon: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  hero_image: string | null;
  hero_image_url: string;
  hero_image_source: string;
  hero_alt_text: string;
  hero_image_2?: string | null;
  hero_image_url_2?: string;
  hero_alt_text_2?: string;
  hero_image_3?: string | null;
  hero_image_url_3?: string;
  hero_alt_text_3?: string;
  gallery_images: Array<{ id: number; url: string; name: string; alt_text: string }>;
  meta_title: string;
  meta_description: string;
  is_active: boolean;
  display_order: number;
  sections: ServiceSection[];
  faqs: ServiceFAQ[];
  updated_at?: string;
}

interface ServiceSection {
  id: number;
  label: string;
  heading: string;
  content: string;
  image: string | null;
  image_url: string;
  image_source: string;
  alt_text: string;
  image_2?: string | null;
  image_url_2?: string;
  alt_text_2?: string;
  image_3?: string | null;
  image_url_3?: string;
  alt_text_3?: string;
  display_order: number;
  is_enabled: boolean;
}

interface ServiceFAQ {
  id: number;
  question: string;
  answer: string;
  display_order: number;
  is_enabled: boolean;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author: string | null;
  category: string | null;
  category_id: number | null;
  tags: string[];
  tag_ids: number[];
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  meta_description: string | null;
  meta_keywords: string | null;
  reading_time: number;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

interface BlogTag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

interface MediaAsset {
  id: number | string;
  url: string;
  name: string;
  alt_text: string;
}

const newServiceDraft = (): Service => ({
  id: 0,
  name: '',
  slug: '',
  description: '',
  short_description: '',
  icon: '💧',
  hero_eyebrow: 'Water engineering service',
  hero_title: '',
  hero_description: '',
  hero_image: null,
  hero_image_url: '',
  hero_image_source: '',
  hero_alt_text: '',
  meta_title: '',
  meta_description: '',
  is_active: false,
  display_order: 0,
  sections: [],
  faqs: [],
  gallery_images: [],
});

const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
  { id: 'projects', label: 'Projects' },
  { id: 'quotation', label: 'Request Quotation' },
  { id: 'services', label: 'Services Overview' },
];

const ABOUT_TEXT_FIELD_GROUPS = [
  { title: 'About Us Hero', description: 'The text visitors see first at the top of the About Us page.', keys: ['hero_eyebrow', 'hero_headline', 'hero_subheadline'] },
  { title: 'Our Story', description: 'The Company Overview heading and paragraph.', keys: ['overview_eyebrow', 'company_overview_title', 'company_overview'] },
  { title: 'Mission & Vision', description: 'The mission and vision headings and statements.', keys: ['mission_eyebrow', 'mission_title', 'mission', 'vision_title', 'vision'] },
  { title: 'Core Values & Team headings', description: 'Headings shown above the Core Values and Meet Our Team sections.', keys: ['values_heading', 'team_section_title', 'team_section_description'] },
];

const ABOUT_IMAGE_SLOTS = [
  { key: 'hero_image_1', label: 'Hero Background Image 1' },
  { key: 'hero_image_2', label: 'Hero Background Image 2' },
  { key: 'hero_image_3', label: 'Hero Background Image 3' },
  { key: 'company_image', label: 'Company Overview Image' },
  { key: 'mission_image', label: 'Mission & Vision Image' },
];

const HOME_TEXT_FIELD_GROUPS = [
  { title: 'Home Hero', description: 'The text visitors see at the top of the Home page.', keys: ['hero_eyebrow', 'hero_headline', 'hero_description'] },
  { title: 'Featured Projects', description: 'Heading for the featured projects section.', keys: ['featured_projects_heading'] },
  { title: 'Testimonials', description: 'Heading for the testimonials section.', keys: ['testimonials_heading'] },
];

const HOME_IMAGE_SLOTS = [
  { key: 'hero_image_1', label: 'Hero Background Image 1' },
  { key: 'hero_image_2', label: 'Hero Background Image 2' },
  { key: 'hero_image_3', label: 'Hero Background Image 3' },
];

const QUOTATION_TEXT_FIELD_GROUPS = [
  { title: 'Quotation Page Hero', description: 'The text visitors see at the top of the Request Quotation page.', keys: ['hero_eyebrow', 'hero_headline', 'hero_subheadline'], defaults: ['Project enquiry', 'Request Consultation & Quotation', 'Need a water solution? Tell us about your project and our engineers will review your requirements.'] },
  { title: 'Form Introduction', description: 'Instructions shown above the quotation request form.', keys: ['form_intro'], defaults: ['Complete the form below and we will prepare a professional quotation for your project.'] },
];

const QUOTATION_IMAGE_SLOTS = [
  { key: 'hero_image_1', label: 'Hero Background Image 1' },
  { key: 'hero_image_2', label: 'Hero Background Image 2' },
  { key: 'hero_image_3', label: 'Hero Background Image 3' },
];

const BLOG_TEXT_FIELD_GROUPS = [
  { title: 'Blog Hero', description: 'The text visitors see at the top of the Blog page.', keys: ['hero_eyebrow', 'hero_headline', 'hero_description'], defaults: ['HOME / INSIGHTS', 'Water, Engineering & Infrastructure Insights', 'Practical knowledge from our experience in water systems, irrigation, pumping, treatment and infrastructure.'] },
  { title: 'Featured Article', description: 'Label shown above the featured blog article.', keys: ['featured_label'], defaults: ['Featured insight'] },
  { title: 'Latest Articles', description: 'Heading and description above the latest blog articles.', keys: ['latest_heading', 'latest_description', 'empty_heading', 'empty_description'], defaults: ['Latest Insights', 'Practical knowledge for better water systems.', 'No insights yet', 'Check back soon for practical water engineering articles and project updates.'] },
  { title: 'Why Our Insights', description: 'Heading and description in the benefit section.', keys: ['why_heading', 'why_description'], defaults: ['Why Our Insights?', 'Knowledge you can trust for your water projects.'] },
  { title: 'Blog Call to Action', description: 'Text in the final project-support call to action.', keys: ['cta_eyebrow', 'cta_heading', 'cta_button'], defaults: ['Project support', 'Talk to Spencer Water about your water project', 'Request quotation'] },
];

const BLOG_IMAGE_SLOTS = [
  { key: 'hero_image_1', label: 'Hero Background Image 1' },
  { key: 'hero_image_2', label: 'Hero Background Image 2' },
  { key: 'hero_image_3', label: 'Hero Background Image 3' },
  { key: 'search_image', label: 'Search Articles Image' },
];

const CONTACT_TEXT_FIELD_GROUPS = [
  { title: 'Contact Us Hero', description: 'The text visitors see at the top of the Contact Us page.', keys: ['hero_eyebrow', 'hero_headline', 'hero_description'] },
  { title: 'Office Details', description: 'The contact details shown beside the enquiry form.', keys: ['office_heading', 'phone', 'email', 'office_address', 'business_hours', 'emergency_contact'] },
  { title: 'Office Detail Labels', description: 'Labels shown before each office contact detail.', keys: ['phone_label', 'email_label', 'office_label', 'business_hours_label', 'emergency_contact_label'], defaults: ['Phone', 'Email', 'Office', 'Business hours', 'Emergency contact'] },
  { title: 'WhatsApp Settings', description: 'WhatsApp recipient numbers for contact form (comma-separated for multiple numbers).', keys: ['whatsapp_numbers'], defaults: ['256785257314'] },
  { title: 'Form Labels', description: 'Labels for the contact form.', keys: ['form_name_label', 'form_phone_label', 'form_email_label', 'form_message_label'], defaults: ['Full name', 'Phone number', 'Email address', 'Message'] },
  { title: 'Form Placeholders', description: 'Placeholder text for form inputs.', keys: ['form_name_placeholder', 'form_phone_placeholder', 'form_email_placeholder', 'form_message_placeholder'], defaults: ['Your name', '+256...', 'name@example.com', 'How can Spencer Water Services help?'] },
  { title: 'Form Button Text', description: 'Text for the submit button.', keys: ['form_submit_text', 'form_submitting_text'], defaults: ['Send Message', 'Sending...'] },
  { title: 'Success Messages', description: 'Text shown after successful form submission.', keys: ['success_heading', 'success_message', 'success_reference_label', 'success_followup'], defaults: ['Message Received', 'Thank you for contacting Spencer Water Services.', 'Reference', 'We\'ll get back to you within 24 hours.'] },
  { title: 'Breadcrumb', description: 'Breadcrumb navigation text.', keys: ['breadcrumb_text'], defaults: ['Home / Contact Us'] },
];

const CONTACT_IMAGE_SLOTS = [
  { key: 'hero_image_1', label: 'Hero Background Image 1' },
  { key: 'hero_image_2', label: 'Hero Background Image 2' },
  { key: 'hero_image_3', label: 'Hero Background Image 3' },
];

const PROJECTS_TEXT_FIELD_GROUPS = [
  { title: 'Projects Hero', description: 'The text visitors see at the top of the Projects page.', keys: ['hero_eyebrow', 'hero_headline', 'hero_description'] },
  { title: 'Project Categories', description: 'The heading above project categories.', keys: ['categories_heading'] },
  { title: 'Project Cards', description: 'The heading above the project cards.', keys: ['cards_heading'] },
  { title: 'Project Locations', description: 'Text shown in the project locations and map section.', keys: ['locations_eyebrow', 'locations_heading', 'locations_text'], defaults: ['Project Locations', 'Work across Uganda', 'Our projects span across Uganda, bringing water solutions to communities nationwide.'] },
];

const PROJECTS_IMAGE_SLOTS = [
  { key: 'hero_image_1', label: 'Hero Background Image 1' },
  { key: 'hero_image_2', label: 'Hero Background Image 2' },
  { key: 'hero_image_3', label: 'Hero Background Image 3' },
];

const SERVICES_TEXT_FIELD_GROUPS = [
  { title: 'Services Hero', description: 'The text visitors see at the top of the Services Overview page.', keys: ['hero_eyebrow', 'hero_headline', 'hero_description'] },
  { title: 'Services Overview', description: 'Introduction and button shown above the service list.', keys: ['overview_eyebrow', 'overview_heading', 'overview_text', 'overview_button'], defaults: ['Service overview', 'Practical systems for reliable water supply', 'Each service is planned around source conditions, water demand, site constraints, durability, maintenance, and the long-term value of the installation.', 'Request Quotation'] },
  { title: 'Service List', description: 'Heading above the individual service cards.', keys: ['list_heading'], defaults: ['Explore Services'] },
  { title: 'Services Call to Action', description: 'Text in the final service call to action.', keys: ['cta_eyebrow', 'cta_heading', 'cta_button'], defaults: ['Need a site-specific recommendation?', 'Request a project quotation', 'Start Request'] },
];

const SERVICES_IMAGE_SLOTS = [
  { key: 'hero_image_1', label: 'Hero Background Image 1' },
  { key: 'hero_image_2', label: 'Hero Background Image 2' },
  { key: 'hero_image_3', label: 'Hero Background Image 3' },
  { key: 'overview_image', label: 'Services Overview Image' },
];

const SERVICE_TEXT_FIELD_GROUPS: { keys: string[]; label: string }[] = [
  { keys: ['name'], label: 'Service Name' },
  { keys: ['short_description'], label: 'Short Description' },
  { keys: ['icon'], label: 'Icon (Emoji)' },
  { keys: ['hero_eyebrow'], label: 'Hero Eyebrow' },
  { keys: ['hero_title'], label: 'Hero Title' },
  { keys: ['hero_description'], label: 'Hero Description' },
  { keys: ['meta_title'], label: 'Meta Title' },
  { keys: ['meta_description'], label: 'Meta Description' },
];

const SECTION_TEXT_FIELD_GROUPS: { keys: string[]; label: string }[] = [
  { keys: ['label'], label: 'Section Label' },
  { keys: ['heading'], label: 'Section Heading' },
  { keys: ['content'], label: 'Section Content' },
];

const SERVICE_IMAGE_SLOTS: { key: string; label: string }[] = [];

function WebsiteContentPageContent() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [activeTab, setActiveTab] = useState('fields');
  const [pageFields, setPageFields] = useState<PageField[]>([]);
  const [pageImages, setPageImages] = useState<PageImage[]>([]);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [managedProjects, setManagedProjects] = useState<ManagedProject[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [servicePageFields, setServicePageFields] = useState<PageField[]>([]);
  const [serviceSections, setServiceSections] = useState<ServiceSection[]>([]);
  const [serviceFAQs, setServiceFAQs] = useState<ServiceFAQ[]>([]);
  const [editingSection, setEditingSection] = useState<ServiceSection | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<ServiceFAQ | null>(null);
  const [showServiceEditor, setShowServiceEditor] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [showFAQEditor, setShowFAQEditor] = useState(false);
  const [showImagesTab, setShowImagesTab] = useState(false);
  const [showGallerySelector, setShowGallerySelector] = useState(false);
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<Set<string>>(new Set());
  const [availableMediaAssets, setAvailableMediaAssets] = useState<MediaAsset[]>([]);
  const [editingField, setEditingField] = useState<PageField | null>(null);
  const [editingImage, setEditingImage] = useState<PageImage | null>(null);
  const [editingCoreValue, setEditingCoreValue] = useState<CoreValue | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<Array<{ id: number | string; url: string; name: string; alt_text: string }>>([]);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [employees, setEmployees] = useState<Array<{ id: number; full_name: string; photo?: string }>>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [blogTags, setBlogTags] = useState<BlogTag[]>([]);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [showBlogImageSelector, setShowBlogImageSelector] = useState(false);
  const [blogMediaAssets, setBlogMediaAssets] = useState<MediaAsset[]>([]);
  const [editingProject, setEditingProject] = useState<ManagedProject | null>(null);
  const [showProjectImageSelector, setShowProjectImageSelector] = useState(false);

  useEffect(() => {
    loadPageData();
  }, [activePage]);

  useEffect(() => {
    // Check for page parameter in URL
    const pageSlug = searchParams.get('page');

    if (pageSlug) {
      // Map page slug to activePage
      const pageMap: Record<string, string> = {
        'home': 'home',
        'about': 'about',
        'contact': 'contact',
        'services': 'services',
        'projects': 'projects',
        'blog': 'blog',
        'quotation': 'quotation',
      };
      const mappedPage = pageMap[pageSlug];
      if (mappedPage) {
        setActivePage(mappedPage);
      }
    }

    // Check for returnToImagesTab flag from edit image page
    const returnToImagesTab = sessionStorage.getItem('returnToImagesTab');
    if (returnToImagesTab === 'true') {
      setActiveTab('images');
      sessionStorage.removeItem('returnToImagesTab');
    }
  }, [searchParams]);

  // Separate effect to restore editing service after services are loaded
  useEffect(() => {
    const editingServiceId = sessionStorage.getItem('editingServiceId');
    if (editingServiceId && services.length > 0) {
      const service = services.find(s => s.id === parseInt(editingServiceId));
      if (service) {
        setEditingService(service);
        sessionStorage.removeItem('editingServiceId');
      }
    }
  }, [services]);

  useEffect(() => {
    if (editingService) {
      const loadServiceContent = async () => {
        const serviceFieldsRes = await fetch(`http://127.0.0.1:8000/api/content/core-pages/page-fields/?page=service-${editingService.slug}`);
        
        if (serviceFieldsRes.ok) {
          const fieldsData = await serviceFieldsRes.json();
          setServicePageFields(Array.isArray(fieldsData.results) ? fieldsData.results : Array.isArray(fieldsData) ? fieldsData : []);
        }
        // Service images are stored on the Service and ServiceSection models, not as PageImage records
        // So we don't fetch from the PageImage API for services
        
        // Initialize selected gallery images from the service
        if (editingService.gallery_images) {
          setSelectedGalleryImages(new Set(editingService.gallery_images.map(img => img.id.toString())));
        }
      };
      loadServiceContent();
    }
  }, [editingService]);

  const loadAvailableMediaAssets = async () => {
    if (!editingService) return;
    try {
      const folderName = `${editingService.slug}-gallery`;
      const response = await fetch(`http://127.0.0.1:8000/api/content/media/?folder=${folderName}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableMediaAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error loading media assets:', error);
    }
  };

  const handleOpenGallerySelector = () => {
    loadAvailableMediaAssets();
    setShowGallerySelector(true);
  };

  const handleToggleGalleryImage = (imageId: string) => {
    setSelectedGalleryImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleSaveGalleryImages = async () => {
    if (!editingService || !token) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${editingService.id}/gallery/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gallery_image_ids: Array.from(selectedGalleryImages).map(id => parseInt(id)),
        }),
      });

      if (response.ok) {
        // Reload service data to get updated gallery images
        const servicesRes = await fetch('http://127.0.0.1:8000/api/content/services/');
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          const updatedService = servicesData.find((s: Service) => s.id === editingService.id);
          if (updatedService) {
            setEditingService(updatedService);
          }
        }
        setShowGallerySelector(false);
        alert('Gallery images updated successfully');
      } else {
        alert('Failed to update gallery images');
      }
    } catch (error) {
      console.error('Error saving gallery images:', error);
    }
  };

  const loadBlogMediaAssets = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/media/?folder=blog`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBlogMediaAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error loading blog media assets:', error);
    }
  };

  const handleSelectBlogImage = (imageUrl: string) => {
    setEditingBlogPost({ ...editingBlogPost, featured_image: imageUrl } as any);
    setShowBlogImageSelector(false);
  };

  const loadPageData = async () => {
    setLoading(true);
    try {
      const [fieldsRes, imagesRes, valuesRes, membersRes, testimonialsRes, servicesRes, employeesRes, blogPostsRes, blogCategoriesRes, blogTagsRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/content/core-pages/page-fields/?page=${activePage}`),
        fetch(`http://127.0.0.1:8000/api/content/core-pages/page-images/?page=${activePage}`),
        fetch('http://127.0.0.1:8000/api/content/core-pages/core-values/'),
        fetch('http://127.0.0.1:8000/api/content/core-pages/team-members/'),
        fetch('http://127.0.0.1:8000/api/content/testimonials/'),
        fetch('http://127.0.0.1:8000/api/content/services/'),
        fetch('http://127.0.0.1:8000/api/employees/'),
        fetch('http://127.0.0.1:8000/api/content/blog/'),
        fetch('http://127.0.0.1:8000/api/content/blog/categories/'),
        fetch('http://127.0.0.1:8000/api/content/blog/tags/'),
      ]);

      if (fieldsRes.ok) {
        const fieldsData = await fieldsRes.json();
        setPageFields(Array.isArray(fieldsData.results) ? fieldsData.results : Array.isArray(fieldsData) ? fieldsData : []);
      }

      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        setPageImages(Array.isArray(imagesData.results) ? imagesData.results : Array.isArray(imagesData) ? imagesData : []);
      }

      if (valuesRes.ok) {
        const valuesData = await valuesRes.json();
        setCoreValues(Array.isArray(valuesData.results) ? valuesData.results : Array.isArray(valuesData) ? valuesData : []);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setTeamMembers(Array.isArray(membersData.results) ? membersData.results : Array.isArray(membersData) ? membersData : []);
      }

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json();
        setEmployees(Array.isArray(employeesData.results) ? employeesData.results : Array.isArray(employeesData) ? employeesData : []);
      }

      if (testimonialsRes.ok) {
        const data = await testimonialsRes.json();
        setTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(Array.isArray(servicesData.services) ? servicesData.services : []);
      }

      if (blogPostsRes.ok) {
        const blogData = await blogPostsRes.json();
        setBlogPosts(Array.isArray(blogData.posts) ? blogData.posts : Array.isArray(blogData.results) ? blogData.results : Array.isArray(blogData) ? blogData : []);
      }

      if (blogCategoriesRes.ok) {
        const categoriesData = await blogCategoriesRes.json();
        setBlogCategories(Array.isArray(categoriesData.categories) ? categoriesData.categories : []);
      }

      if (blogTagsRes.ok) {
        const tagsData = await blogTagsRes.json();
        setBlogTags(Array.isArray(tagsData.tags) ? tagsData.tags : []);
      }

      const projectsRes = await fetch('http://127.0.0.1:8000/api/projects/');
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setManagedProjects(Array.isArray(projectsData.results) ? projectsData.results : Array.isArray(projectsData) ? projectsData : []);
      }
    } catch (error) {
      console.error('Error loading page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMediaAssets = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/media/');
      if (response.ok) {
        const data = await response.json();
        setMediaAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error loading media assets:', error);
    }
  };

  // Blog handlers
  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingBlogPost) return;

    setSaving(true);
    try {
      const url = editingBlogPost.id
        ? `http://127.0.0.1:8000/api/content/blog/${editingBlogPost.id}/`
        : 'http://127.0.0.1:8000/api/content/blog/';
      
      const method = editingBlogPost.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingBlogPost.title,
          slug: editingBlogPost.slug,
          excerpt: editingBlogPost.excerpt,
          content: editingBlogPost.content,
          featured_image: editingBlogPost.featured_image,
          status: editingBlogPost.status,
          is_featured: editingBlogPost.is_featured,
          category_id: editingBlogPost.category_id,
          tag_ids: editingBlogPost.tag_ids,
          meta_description: editingBlogPost.meta_description,
          meta_keywords: editingBlogPost.meta_keywords,
          reading_time: editingBlogPost.reading_time,
        }),
      });

      if (response.ok) {
        const blogPostsRes = await fetch('http://127.0.0.1:8000/api/content/blog/');
        if (blogPostsRes.ok) {
          const blogData = await blogPostsRes.json();
          setBlogPosts(Array.isArray(blogData.posts) ? blogData.posts : []);
        }
        setShowBlogEditor(false);
        setEditingBlogPost(null);
      } else {
        alert('Failed to save blog post');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Error saving blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlogPost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/blog/${postId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        setBlogPosts(blogPosts.filter(p => p.id !== postId));
      } else {
        alert('Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Error deleting blog post');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingCategory) return;

    setSaving(true);
    try {
      const url = editingCategory.id
        ? `http://127.0.0.1:8000/api/content/blog/categories/${editingCategory.id}/`
        : 'http://127.0.0.1:8000/api/content/blog/categories/';
      
      const method = editingCategory.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description,
        }),
      });

      if (response.ok) {
        const categoriesRes = await fetch('http://127.0.0.1:8000/api/content/blog/categories/');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setBlogCategories(Array.isArray(categoriesData.categories) ? categoriesData.categories : []);
        }
        setShowCategoryEditor(false);
        setEditingCategory(null);
      } else {
        alert('Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/blog/categories/${categoryId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        setBlogCategories(blogCategories.filter(c => c.id !== categoryId));
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingTag) return;

    setSaving(true);
    try {
      const url = editingTag.id
        ? `http://127.0.0.1:8000/api/content/blog/tags/${editingTag.id}/`
        : 'http://127.0.0.1:8000/api/content/blog/tags/';
      
      const method = editingTag.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingTag.name,
          slug: editingTag.slug,
        }),
      });

      if (response.ok) {
        const tagsRes = await fetch('http://127.0.0.1:8000/api/content/blog/tags/');
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setBlogTags(Array.isArray(tagsData.tags) ? tagsData.tags : []);
        }
        setShowTagEditor(false);
        setEditingTag(null);
      } else {
        alert('Failed to save tag');
      }
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Error saving tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/blog/tags/${tagId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        setBlogTags(blogTags.filter(t => t.id !== tagId));
      } else {
        alert('Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Error deleting tag');
    }
  };

  const openMediaLibrary = () => {
    loadMediaAssets();
    setShowMediaLibrary(true);
  };

  const selectMediaAsset = async (asset: { id: number | string; url: string; name: string; alt_text: string }) => {
    if (!token) return;

    // If editingImage has no ID, we need to create a new page image
    if (!editingImage?.id) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/content/core-pages/page-images/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            page: activePage,
            key: editingImage?.key,
            label: editingImage?.label,
            image_url: asset.url,
            alt_text: asset.alt_text || '',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Created new page image:', data);
          loadPageData();
          setShowMediaLibrary(false);
          setEditingImage(null);
        } else {
          console.error('Failed to create page image:', await response.text());
          alert('Failed to create page image');
        }
      } catch (error) {
        console.error('Error creating page image:', error);
        alert('Error creating page image');
      }
    } else {
      // Update existing image
      setEditingImage({ ...editingImage, image_url: asset.url, alt_text: asset.alt_text || editingImage?.alt_text || '' } as PageImage);
      setShowMediaLibrary(false);
    }
  };

  const selectProjectImage = async (asset: { id: number | string; url: string; name: string; alt_text: string }) => {
    if (!editingProject || !token) return;

    try {
      console.log('Updating project cover image:', editingProject.id, asset.url);
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${editingProject.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cover_image_url: asset.url }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        console.log('Project updated successfully:', updatedData);
        await loadPageData();
        setShowProjectImageSelector(false);
        setEditingProject(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update project cover image:', errorData);
        alert(`Failed to update project cover image: ${errorData.detail || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating project cover image:', error);
      alert('Error updating project cover image');
    }
  };

  const handleSaveField = async (field: Partial<PageField>) => {
    console.log('handleSaveField called:', field);
    if (!token) {
      alert('You must be logged in to save changes');
      return;
    }

    setSaving(true);
    try {
      const url = editingField
        ? `http://127.0.0.1:8000/api/content/core-pages/page-fields/${editingField.id}/`
        : `http://127.0.0.1:8000/api/content/core-pages/page-fields/`;
      
      const method = editingField ? 'PUT' : 'POST';
      const body = {
        ...field,
        page: editingService ? `service-${editingService.slug}` : activePage,
        display_order: field.display_order || 0,
      };

      console.log('Saving field to:', url, 'method:', method, 'body:', body);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      console.log('Save field response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Save field response data:', data);
        setShowFieldModal(false);
        setEditingField(null);
        loadPageData();
      } else {
        console.error('Save field failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveImage = async (imageData: Partial<PageImage> & { image_file?: File }) => {
    if (!token) {
      alert('You must be logged in to save changes');
      return;
    }

    console.log('handleSaveImage called with imageData:', imageData);

    setSaving(true);
    try {
      // Handle service-specific images
      if (editingService && (imageData.key?.startsWith('hero_image') || imageData.key?.startsWith('section_') || imageData.key?.startsWith('process_'))) {
        if (imageData.key?.startsWith('hero_image')) {
          // Update service hero image
          const imageNumber = imageData.key === 'hero_image_1' ? '' : `_${imageData.key.split('_')[2]}`;
          const formData = new FormData();
          if (imageData.image_file) {
            formData.append(`hero_image${imageNumber}`, imageData.image_file);
          }
          if (imageData.image_url) {
            formData.append(`hero_image_url${imageNumber}`, imageData.image_url);
          }
          if (imageData.alt_text !== undefined) {
            formData.append(`hero_alt_text${imageNumber}`, imageData.alt_text);
          }

          console.log('Saving hero image for service:', editingService.id, 'image number:', imageNumber || 1);
          console.log('FormData entries:', Array.from(formData.entries()));
          console.log('FormData has image_url?', !!imageData.image_url);
          console.log('FormData has image_file?', !!imageData.image_file);
          console.log('FormData has alt_text?', imageData.alt_text !== undefined);

          // Django does not parse multipart PATCH bodies into request.POST.
          // Gallery selections are URLs, so save them as JSON. Use a normal
          // multipart POST only when a file has actually been selected.
          const hasFile = Boolean(imageData.image_file);
          const response = await fetch(`http://127.0.0.1:8000/api/content/services/${editingService.id}/`, {
            method: hasFile ? 'POST' : 'PATCH',
            headers: hasFile
              ? { 'Authorization': `Bearer ${token}` }
              : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: hasFile
              ? formData
              : JSON.stringify({
                  [`hero_image_url${imageNumber}`]: imageData.image_url || '',
                  [`hero_alt_text${imageNumber}`]: imageData.alt_text || '',
                }),
          });

          if (response.ok) {
            const data = await response.json();
            // Service images are stored on the Service record, not as PageImage
            // records. Keep the editor's service state in sync with the returned
            // record so the saved image is immediately visible in this tab.
            if (data.service) {
              setEditingService(data.service);
              setServices((current) => current.map((service) => service.id === data.service.id ? data.service : service));
            }
            setShowImageModal(false);
            setEditingImage(null);
            alert('Hero image saved successfully');
          } else {
            const errorData = await response.json();
            console.error('Error saving hero image:', errorData);
            alert(`Failed to save hero image: ${errorData.error || 'Unknown error'}`);
          }
        } else if (imageData.key?.startsWith('section_') || imageData.key?.startsWith('process_')) {
          // Update service section image
          const sectionId = imageData.sectionId || parseInt(imageData.key.replace('section_', '').replace('process_', '').split('_')[0]);
          const imageNumber = imageData.key.includes('_image_') ? parseInt(imageData.key.split('_image_')[1]) : 1;
          
          const formData = new FormData();
          if (imageData.image_file) {
            formData.append(`image${imageNumber > 1 ? '_' + imageNumber : ''}`, imageData.image_file);
          }
          if (imageData.image_url) {
            formData.append(`image_url${imageNumber > 1 ? '_' + imageNumber : ''}`, imageData.image_url);
          }
          if (imageData.alt_text !== undefined) {
            formData.append(`alt_text${imageNumber > 1 ? '_' + imageNumber : ''}`, imageData.alt_text);
          }

          console.log('Saving section image for service:', editingService.id, 'section:', sectionId, 'image number:', imageNumber);
          console.log('FormData entries:', Array.from(formData.entries()));

          const hasFile = Boolean(imageData.image_file);
          const response = await fetch(`http://127.0.0.1:8000/api/content/services/${editingService.id}/sections/${sectionId}/`, {
            method: hasFile ? 'POST' : 'PATCH',
            headers: hasFile
              ? { 'Authorization': `Bearer ${token}` }
              : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: hasFile
              ? formData
              : JSON.stringify({
                  [`image_url${imageNumber > 1 ? '_' + imageNumber : ''}`]: imageData.image_url || '',
                  [`alt_text${imageNumber > 1 ? '_' + imageNumber : ''}`]: imageData.alt_text || '',
                }),
          });

          if (response.ok) {
            const data = await response.json();
            // As above, sections belong to the currently edited service rather
            // than to the shared PageImage collection.
            setEditingService((current) => current ? {
              ...current,
              sections: current.sections.map((section) => section.id === sectionId ? data : section),
            } : current);
            setServices((current) => current.map((service) => service.id === editingService.id ? {
              ...service,
              sections: service.sections.map((section) => section.id === sectionId ? data : section),
            } : service));
            setShowImageModal(false);
            setEditingImage(null);
            alert('Section image saved successfully');
          } else {
            const errorData = await response.json();
            console.error('Error saving section image:', errorData);
            alert(`Failed to save section image: ${errorData.error || 'Unknown error'}`);
          }
        }
        return;
      }

      // Handle regular PageImage system
      const formData = new FormData();
      formData.append('page', imageData.page || activePage);
      formData.append('key', imageData.key || '');
      formData.append('label', imageData.label || '');
      formData.append('alt_text', imageData.alt_text || '');
      if (imageData.image_url) {
        formData.append('image_url', imageData.image_url);
      }
      if (imageData.image_file) {
        formData.append('image', imageData.image_file);
      }

      const hasPersistedImage = Boolean(editingImage?.id);
      const url = hasPersistedImage
        ? `http://127.0.0.1:8000/api/content/core-pages/page-images/${editingImage?.id}/`
        : `http://127.0.0.1:8000/api/content/core-pages/page-images/`;

      const method = hasPersistedImage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setShowImageModal(false);
        setEditingImage(null);
        loadPageData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error saving image:', errorData);
        alert(`Failed to save image: ${errorData.detail || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveValue = async (value: Partial<CoreValue>) => {
    if (!token) {
      alert('You must be logged in to save changes');
      return;
    }
    
    setSaving(true);
    try {
      const url = editingCoreValue
        ? `http://127.0.0.1:8000/api/content/core-pages/core-values/${editingCoreValue.id}/`
        : `http://127.0.0.1:8000/api/content/core-pages/core-values/`;
      
      const method = editingCoreValue ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(value),
      });

      if (response.ok) {
        setShowValueModal(false);
        setEditingCoreValue(null);
        loadPageData();
      }
    } catch (error) {
      console.error('Error saving value:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMember = async (member: Partial<TeamMember> & { photo_file?: File }) => {
    if (!token) {
      alert('You must be logged in to save changes');
      return;
    }
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', member.name || '');
      formData.append('role_title', member.role_title || '');
      formData.append('bio', member.bio || '');
      if (member.employee) {
        formData.append('employee', String(member.employee));
      }
      if (member.photo_file) {
        formData.append('photo', member.photo_file);
      }
      formData.append('display_order', String(member.display_order || 0));
      formData.append('is_active', String(member.is_active !== false));

      const url = editingMember
        ? `http://127.0.0.1:8000/api/content/core-pages/team-members/${editingMember.id}/`
        : `http://127.0.0.1:8000/api/content/core-pages/team-members/`;

      const method = editingMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setShowMemberModal(false);
        setEditingMember(null);
        setMemberPhotoPreview(null);
        loadPageData();
      }
    } catch (error) {
      console.error('Error saving member:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: 'field' | 'image' | 'value' | 'member', id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    if (!token) {
      alert('You must be logged in to save changes');
      return;
    }

    try {
      // Handle service-specific image deletions
      if (editingService && type === 'image' && editingImage) {
        if (editingImage.key === 'hero_image') {
          // Clear service hero image
          const response = await fetch(`http://127.0.0.1:8000/api/content/services/${editingService.id}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ hero_image: null, hero_image_url: '', hero_alt_text: '' }),
          });
          if (response.ok) {
            loadPageData();
          }
        } else if (editingImage.key?.startsWith('section_')) {
          // Clear service section image
          const sectionId = editingImage.sectionId || parseInt(editingImage.key.replace('section_', ''));
          const response = await fetch(`http://127.0.0.1:8000/api/content/services/${editingService.id}/sections/${sectionId}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ image: null, image_url: '', alt_text: '' }),
          });
          if (response.ok) {
            loadPageData();
          }
        }
        return;
      }

      const urls = {
        field: `http://127.0.0.1:8000/api/content/core-pages/page-fields/${id}/`,
        image: `http://127.0.0.1:8000/api/content/core-pages/page-images/${id}/`,
        value: `http://127.0.0.1:8000/api/content/core-pages/core-values/${id}/`,
        member: `http://127.0.0.1:8000/api/content/core-pages/team-members/${id}/`,
      };

      const response = await fetch(urls[type], {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        loadPageData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const reviewTestimonial = async (testimonial: Testimonial, status: 'APPROVED' | 'REJECTED') => {
    if (!token) return alert('You must be logged in to review testimonials');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/testimonials/${testimonial.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, is_featured: status === 'APPROVED' }),
      });
      if (response.ok) {
        loadPageData();
      } else {
        const errorText = await response.text();
        console.error('Error reviewing testimonial:', response.status, errorText);
        alert(`Failed to ${status.toLowerCase()} testimonial (Status ${response.status}): ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error reviewing testimonial:', error);
      alert('An error occurred while reviewing the testimonial');
    }
  };

  const deleteTestimonial = async (testimonialId: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    if (!token) return alert('You must be logged in to delete testimonials');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/testimonials/${testimonialId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        loadPageData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error deleting testimonial:', errorData);
        alert(`Failed to delete testimonial: ${errorData.detail || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('An error occurred while deleting the testimonial');
    }
  };

  const handleSaveService = async (service: Service) => {
    if (!token) {
      alert('You must be logged in to save changes');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${service.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: service.name,
          slug: service.slug,
          description: service.description,
          short_description: service.short_description,
          icon: service.icon,
          hero_eyebrow: service.hero_eyebrow,
          hero_title: service.hero_title,
          hero_description: service.hero_description,
          hero_image_url: service.hero_image_url,
          hero_alt_text: service.hero_alt_text,
          meta_title: service.meta_title,
          meta_description: service.meta_description,
          is_active: service.is_active,
          display_order: service.display_order,
        }),
      });
      if (response.ok) {
        alert('Service saved successfully');
        loadPageData();
      } else {
        alert('Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error saving service');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Are you sure you want to delete this service? This will also delete all its sections.')) return;
    if (!token) {
      alert('You must be logged in to delete services');
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setSelectedService(null);
        loadPageData();
        alert('Service deleted successfully');
      } else {
        alert('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service');
    }
  };

  const handleCreateService = async (service: Service) => {
    if (!token) {
      alert('You must be logged in to create services');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: service.name,
          slug: service.slug,
          description: service.description,
          short_description: service.short_description,
          icon: service.icon,
          hero_eyebrow: service.hero_eyebrow,
          hero_title: service.hero_title,
          hero_description: service.hero_description,
          hero_image_url: service.hero_image_url,
          hero_alt_text: service.hero_alt_text,
          meta_title: service.meta_title,
          meta_description: service.meta_description,
          is_active: service.is_active,
          display_order: service.display_order,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedService(null);
        setEditingService(data.service);
        setActivePage('services');
        setActiveTab('fields');
        loadPageData();
        alert('Service created. Continue with the page editor to add its text and images.');
      } else {
        alert('Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Error creating service');
    } finally {
      setSaving(false);
    }
  };

  const handleAddServiceSection = async (serviceId: number) => {
    if (!token) {
      alert('You must be logged in to add sections');
      return;
    }
    const label = prompt('Enter section label (e.g., "Service Overview", "Key Benefits"):');
    if (!label) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/sections/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ label, heading: label, content: '' }),
      });
      if (response.ok) {
        loadPageData();
      } else {
        alert('Failed to add section');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      alert('Error adding section');
    }
  };

  const handleUpdateServiceSection = async (serviceId: number, sectionId: number, updates: Partial<ServiceSection>) => {
    if (!token) {
      alert('You must be logged in to update sections');
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/sections/${sectionId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedService(prev => prev ? {
          ...prev,
          sections: prev.sections.map(s => s.id === sectionId ? data : s)
        } : null);
      }
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleDeleteServiceSection = async (serviceId: number, sectionId: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    if (!token) {
      alert('You must be logged in to delete sections');
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/sections/${sectionId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setSelectedService(prev => prev ? {
          ...prev,
          sections: prev.sections.filter(s => s.id !== sectionId)
        } : null);
      } else {
        alert('Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section');
    }
  };

  const handleAddServiceFAQ = async (serviceId: number) => {
    if (!token) {
      alert('You must be logged in to add FAQs');
      return;
    }
    const question = prompt('Enter FAQ question:');
    if (!question) return;
    const answer = prompt('Enter FAQ answer:');
    if (!answer) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/faqs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question, answer }),
      });
      if (response.ok) {
        loadPageData();
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
    }
  };

  const handleUpdateServiceFAQ = async (serviceId: number, faqId: number, updates: Partial<ServiceFAQ>) => {
    if (!token) {
      alert('You must be logged in to update FAQs');
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/faqs/${faqId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        loadPageData();
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const handleDeleteServiceFAQ = async (serviceId: number, faqId: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    if (!token) {
      alert('You must be logged in to delete FAQs');
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/faqs/${faqId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        loadPageData();
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const handleSaveServiceFAQ = async (serviceId: number, faq: ServiceFAQ) => {
    if (!token) {
      alert('You must be logged in to save FAQs');
      return;
    }
    try {
      if (faq.id) {
        // Update existing FAQ
        await handleUpdateServiceFAQ(serviceId, faq.id, { question: faq.question, answer: faq.answer });
      } else {
        // Create new FAQ
        const response = await fetch(`http://127.0.0.1:8000/api/content/services/${serviceId}/faqs/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ question: faq.question, answer: faq.answer }),
        });
        if (response.ok) {
          loadPageData();
        }
      }
      setShowFAQModal(false);
      setEditingFAQ(null);
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleEditImage = (key: string, label: string, image: any) => {
    console.log('handleEditImage called:', { key, label, image });

    // If editing a service, use the service image editor
    if (editingService) {
      const params = new URLSearchParams({
        key,
        label,
        serviceId: editingService.id.toString(),
        currentImageUrl: image?.image_url_display || image?.image_url || '',
        currentAltText: image?.alt_text || '',
      });
      if (key.startsWith('section_') || key.startsWith('process_')) {
        const sectionId = key.replace('section_', '').replace('process_', '').split('_')[0];
        params.set('sectionId', sectionId);
      }
      router.push(`/admin/content/website-content/edit-service-image?${params.toString()}`);
    } else {
      // Otherwise, use the regular page image editor
      if (!image || !image.id) {
        // If image doesn't exist yet, create a new one via the media selector
        console.log('Opening media library for new image');
        setShowMediaLibrary(true);
        setEditingImage({ key, label } as any);
      } else {
        console.log('Navigating to edit image:', image.id);
        router.push(`/admin/content/website-content/edit-image/${image.id}`);
      }
    }
  };

  const toggleProjectPublishing = async (project: ManagedProject) => {
    if (!token) return alert('You must be logged in to publish projects');
    const response = await fetch(`http://127.0.0.1:8000/api/projects/${project.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_published: !project.is_published }),
    });
    if (response.ok) {
      await loadPageData();
    } else {
      alert('Failed to update project publishing status');
    }
  };

  const renderTextField = (field: PageField) => {
    const currentFields = editingService ? servicePageFields : pageFields;
    const setFields = editingService ? setServicePageFields : setPageFields;
    
    return (
      <div key={field.id} className="border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-blue-900">{field.label}</h4>
            <p className="text-sm text-blue-400">Public field: {field.key}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push(`/admin/content/website-content/edit-field/${field.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" aria-label={`Edit ${field.label}`}>
              <Edit2 size={16} />
            </button>
            <button onClick={() => handleDelete('field', field.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" aria-label={`Delete ${field.label}`}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {field.field_type === 'richtext' ? (
          <textarea 
            value={field.value} 
            onChange={(e) => {
              console.log('onChange field:', field.key, e.target.value);
              setFields(currentFields.map((item) => item.id === field.id ? { ...item, value: e.target.value } : item));
            }} 
            onBlur={(e) => {
              console.log('onBlur saving field:', field.key, e.target.value);
              handleSaveField({ ...field, value: e.target.value });
            }} 
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            rows={3} 
          />
        ) : (
          <input 
            type="text" 
            value={field.value} 
            onChange={(e) => {
              console.log('onChange field:', field.key, e.target.value);
              setFields(currentFields.map((item) => item.id === field.id ? { ...item, value: e.target.value } : item));
            }} 
            onBlur={(e) => {
              console.log('onBlur saving field:', field.key, e.target.value);
              handleSaveField({ ...field, value: e.target.value });
            }} 
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        )}
      </div>
    );
  };

  const renderAutoCreateField = (key: string, label: string, defaultValue: string, fieldType: string = 'text') => {
    const currentFields = pageFields;
    const existingField = currentFields.find((field) => field.key === key);
    
    if (existingField) {
      return renderTextField(existingField);
    }
    
    // Field doesn't exist, show input that creates on blur
    return (
      <div key={key} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-blue-900">{label}</h4>
            <p className="text-sm text-blue-400">Public field: {key}</p>
            <p className="text-xs text-blue-600">Field will be created on first save</p>
          </div>
        </div>
        {fieldType === 'richtext' ? (
          <textarea 
            defaultValue={defaultValue}
            onBlur={async (e) => {
              if (!token) return;
              try {
                const response = await fetch(`http://127.0.0.1:8000/api/content/core-pages/page-fields/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({
                    page: activePage,
                    key,
                    label,
                    value: e.target.value,
                    field_type: fieldType,
                    display_order: 0,
                  }),
                });
                if (response.ok) {
                  loadPageData();
                }
              } catch (error) {
                console.error('Error creating field:', error);
              }
            }}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            rows={3} 
          />
        ) : (
          <input 
            type="text" 
            defaultValue={defaultValue}
            onBlur={async (e) => {
              if (!token) return;
              try {
                const response = await fetch(`http://127.0.0.1:8000/api/content/core-pages/page-fields/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({
                    page: activePage,
                    key,
                    label,
                    value: e.target.value,
                    field_type: fieldType,
                    display_order: 0,
                  }),
                });
                if (response.ok) {
                  loadPageData();
                }
              } catch (error) {
                console.error('Error creating field:', error);
              }
            }}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        )}
      </div>
    );
  };

  const renderServiceTextField = (key: string, label: string) => {
    if (!editingService) return null;
    
    const value = editingService[key as keyof typeof editingService] as string || '';
    const isTextarea = key === 'description' || key === 'hero_description' || key === 'short_description' || key === 'meta_description';
    
    return (
      <div key={key} className="border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-blue-900">{label}</h4>
            <p className="text-sm text-blue-400">Service field: {key}</p>
          </div>
        </div>
        {isTextarea ? (
          <textarea 
            value={value} 
            onChange={(e) => {
              console.log('onChange:', key, e.target.value);
              setEditingService({ ...editingService, [key]: e.target.value });
            }}
            onBlur={async (e) => {
              if (!token) return;
              try {
                const newValue = e.target.value;
                console.log('onBlur saving:', key, newValue);
                const response = await fetch(`http://127.0.0.1:8000/api/content/services/${editingService.id}/`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ [key]: newValue }),
                });
                console.log('Response status:', response.status);
                if (response.ok) {
                  const data = await response.json();
                  console.log('Saved successfully:', data);
                  setEditingService(data.service || data);
                } else {
                  console.error('Save failed:', response.status, await response.text());
                }
              } catch (error) {
                console.error('Error saving service field:', error);
              }
            }}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            rows={key === 'description' ? 5 : 3} 
          />
        ) : (
          <input 
            type="text" 
            value={value} 
            onChange={(e) => {
              console.log('onChange:', key, e.target.value);
              setEditingService({ ...editingService, [key]: e.target.value });
            }}
            onBlur={async (e) => {
              if (!token) return;
              try {
                const newValue = e.target.value;
                console.log('onBlur saving:', key, newValue);
                const response = await fetch(`http://127.0.0.1:8000/api/content/services/${editingService.id}/`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ [key]: newValue }),
                });
                console.log('Response status:', response.status);
                if (response.ok) {
                  const data = await response.json();
                  console.log('Saved successfully:', data);
                  setEditingService(data.service || data);
                } else {
                  console.error('Save failed:', response.status, await response.text());
                }
              } catch (error) {
                console.error('Error saving service field:', error);
              }
            }}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        )}
      </div>
    );
  };

  const renderSectionTextField = (section: ServiceSection, key: string, label: string) => {
    const value = section[key as keyof typeof section] as string || '';
    const isTextarea = key === 'content';
    
    return (
      <div key={`${section.id}-${key}`} className="border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-blue-900">{label}</h4>
            <p className="text-sm text-blue-400">Section: {section.label}</p>
          </div>
        </div>
        {isTextarea ? (
          <textarea 
            value={value} 
            onChange={(e) => {
              if (!editingService) return;
              setEditingService({
                ...editingService,
                sections: editingService.sections.map(s => 
                  s.id === section.id ? { ...s, [key]: e.target.value } : s
                )
              });
            }}
            onBlur={async (e) => {
              if (!token || !editingService) return;
              try {
                const newValue = e.target.value;
                await fetch(`http://127.0.0.1:8000/api/content/services/${editingService.id}/sections/${section.id}/`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ [key]: newValue }),
                });
              } catch (error) {
                console.error('Error saving section field:', error);
              }
            }}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            rows={4} 
          />
        ) : (
          <input 
            type="text" 
            value={value} 
            onChange={(e) => {
              if (!editingService) return;
              setEditingService({
                ...editingService,
                sections: editingService.sections.map(s => 
                  s.id === section.id ? { ...s, [key]: e.target.value } : s
                )
              });
            }}
            onBlur={async (e) => {
              if (!token || !editingService) return;
              try {
                const newValue = e.target.value;
                await fetch(`http://127.0.0.1:8000/api/content/services/${editingService.id}/sections/${section.id}/`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ [key]: newValue }),
                });
              } catch (error) {
                console.error('Error saving section field:', error);
              }
            }}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        )}
      </div>
    );
  };

  const textFieldGroups = editingService
    ? SERVICE_TEXT_FIELD_GROUPS
    : activePage === 'home'
      ? HOME_TEXT_FIELD_GROUPS
      : activePage === 'about'
        ? ABOUT_TEXT_FIELD_GROUPS
        : activePage === 'blog'
          ? BLOG_TEXT_FIELD_GROUPS
          : activePage === 'contact'
            ? CONTACT_TEXT_FIELD_GROUPS
            : activePage === 'projects'
              ? PROJECTS_TEXT_FIELD_GROUPS
              : activePage === 'quotation'
                ? QUOTATION_TEXT_FIELD_GROUPS
                : activePage === 'services'
                  ? SERVICES_TEXT_FIELD_GROUPS
          : null;
  const imageSlots = editingService
    ? [
        { key: 'hero_image_1', label: 'Service Hero Image 1' },
        { key: 'hero_image_2', label: 'Service Hero Image 2' },
        { key: 'hero_image_3', label: 'Service Hero Image 3' },
        ...editingService.sections
          .filter((section) => {
            const label = section.label.toLowerCase();
            return !label.includes('benefit') && !label.includes('advantage');
          })
          .flatMap((section, index) => section.label.toLowerCase().includes('process') || section.label.toLowerCase().includes('installation')
            ? [1, 2, 3].map((imageNumber) => ({
                key: `process_${section.id}_image_${imageNumber}`,
                label: `${section.label} Image ${imageNumber}`,
              }))
            : [{
                key: `section_${section.id}`,
                label: section.label || `Section ${index + 1} Image`,
                sectionId: section.id,
              }]),
      ]
    : activePage === 'home'
      ? HOME_IMAGE_SLOTS
      : activePage === 'about'
        ? ABOUT_IMAGE_SLOTS
        : activePage === 'blog'
          ? BLOG_IMAGE_SLOTS
          : activePage === 'contact'
            ? CONTACT_IMAGE_SLOTS
            : activePage === 'projects'
              ? PROJECTS_IMAGE_SLOTS
              : activePage === 'quotation'
                ? QUOTATION_IMAGE_SLOTS
                : activePage === 'services'
                  ? SERVICES_IMAGE_SLOTS
          : null;
  const displayedImages = editingService
    ? [
        {
          id: 0,
          page: `service-${editingService.slug}`,
          key: 'hero_image_1',
          label: 'Service Hero Image 1',
          image: editingService.hero_image || '',
          image_url: editingService.hero_image_url || '',
          image_url_display: editingService.hero_image_url || editingService.hero_image || '',
          alt_text: editingService.hero_alt_text || '',
          updated_at: editingService.updated_at || '',
        },
        {
          id: 0,
          page: `service-${editingService.slug}`,
          key: 'hero_image_2',
          label: 'Service Hero Image 2',
          image: editingService.hero_image_2 || '',
          image_url: editingService.hero_image_url_2 || '',
          image_url_display: editingService.hero_image_url_2 || editingService.hero_image_2 || '',
          alt_text: editingService.hero_alt_text_2 || '',
          updated_at: editingService.updated_at || '',
        },
        {
          id: 0,
          page: `service-${editingService.slug}`,
          key: 'hero_image_3',
          label: 'Service Hero Image 3',
          image: editingService.hero_image_3 || '',
          image_url: editingService.hero_image_url_3 || '',
          image_url_display: editingService.hero_image_url_3 || editingService.hero_image_3 || '',
          alt_text: editingService.hero_alt_text_3 || '',
          updated_at: editingService.updated_at || '',
        },
        ...editingService.sections.flatMap((section) => {
          if (section.label.toLowerCase().includes('process') || section.label.toLowerCase().includes('installation')) {
            // Return 3 image slots for process and installation sections
            return [
              {
                id: 0,
                page: `service-${editingService.slug}`,
                key: `process_${section.id}_image_1`,
                label: `${section.label} Image 1`,
                image: section.image || '',
                image_url: section.image_url || '',
                image_url_display: section.image_url || section.image || '',
                alt_text: section.alt_text || '',
                updated_at: '',
                sectionId: section.id,
              },
              {
                id: 0,
                page: `service-${editingService.slug}`,
                key: `process_${section.id}_image_2`,
                label: `${section.label} Image 2`,
                image: section.image_2 || '',
                image_url: section.image_url_2 || '',
                image_url_display: section.image_url_2 || section.image_2 || '',
                alt_text: section.alt_text_2 || '',
                updated_at: '',
                sectionId: section.id,
              },
              {
                id: 0,
                page: `service-${editingService.slug}`,
                key: `process_${section.id}_image_3`,
                label: `${section.label} Image 3`,
                image: section.image_3 || '',
                image_url: section.image_url_3 || '',
                image_url_display: section.image_url_3 || section.image_3 || '',
                alt_text: section.alt_text_3 || '',
                updated_at: '',
                sectionId: section.id,
              },
            ];
          } else {
            return [{
              id: 0,
              page: `service-${editingService.slug}`,
              key: `section_${section.id}`,
              label: section.label || `Section Image`,
              image: section.image || '',
              image_url: section.image_url || '',
              image_url_display: section.image_url || section.image || '',
              alt_text: section.alt_text || '',
              updated_at: '',
              sectionId: section.id,
            }];
          }
        }),
      ]
    : imageSlots
      ? imageSlots.map((slot) => pageImages.find((image) => image.key === slot.key) || ({
          id: 0,
          page: activePage,
          key: slot.key,
          label: slot.label,
          image: '',
          image_url: '',
          image_url_display: '',
          alt_text: '',
          updated_at: '',
        } satisfies PageImage))
      : pageImages;
  const reviewUrl = editingService ? `/services/${editingService.slug}` : activePage === 'home' ? '/' : `/${activePage}`;

  return (
    <AdminLayout
      title="Website Content"
      subtitle="Manage text, images, and content across all pages"
      activePath="/admin/content/website-content"
    >
      <div className="min-h-[calc(100vh-4rem)] space-y-8 p-8 max-w-6xl mx-auto">
        {/* Page Tabs */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm mb-6 overflow-hidden">
          <div className="border-b border-blue-100">
            <nav className="flex gap-8 px-6 overflow-x-auto">
              {PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    setActivePage(page.id);
                    router.push(`/admin/content/website-content?page=${page.id}`);
                  }}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activePage === page.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-blue-400 hover:text-blue-600'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-blue-100 px-6 py-4 bg-blue-50">
            <p className="text-sm text-blue-900">Saved content is published immediately. Open the public page to review the current text, images, testimonials, or project cards.</p>
            <a href={reviewUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">Review public page</a>
          </div>

          {/* Content Tabs */}
          <div className="border-b border-blue-100">
            <nav className="flex gap-8 px-6">
              {[
                { id: 'fields', label: 'Text Fields' },
                { id: 'images', label: 'Images' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-blue-400 hover:text-blue-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              {activePage === 'about' && (
                <>
                  {[
                    { id: 'values', label: 'Core Values' },
                    { id: 'team', label: 'Team Members' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-blue-400 hover:text-blue-600'
                    }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </>
              )}
              {activePage === 'home' && (
                <button onClick={() => setActiveTab('testimonials')} className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'testimonials' ? 'border-blue-600 text-blue-600' : 'border-transparent text-blue-400 hover:text-blue-600'}`}>
                  Testimonials Review
                </button>
              )}
              {activePage === 'projects' && (
                <button onClick={() => setActiveTab('project-management')} className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'project-management' ? 'border-blue-600 text-blue-600' : 'border-transparent text-blue-400 hover:text-blue-600'}`}>
                  Project Cards & Map
                </button>
              )}
              {activePage === 'blog' && (
                <button onClick={() => setActiveTab('blog-management')} className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'blog-management' ? 'border-blue-600 text-blue-600' : 'border-transparent text-blue-400 hover:text-blue-600'}`}>
                  Blog Management
                </button>
              )}
              {activePage === 'services' && !editingService && (
                <button onClick={() => setActiveTab('service-lines')} className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'service-lines' ? 'border-blue-600 text-blue-600' : 'border-transparent text-blue-400 hover:text-blue-600'}`}>
                  Service Lines
                </button>
              )}
              {activePage === 'services' && editingService && (
                <>
                  <button onClick={() => setActiveTab('images')} className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'images' ? 'border-blue-600 text-blue-600' : 'border-transparent text-blue-400 hover:text-blue-600'}`}>
                    Images
                  </button>
                  <button onClick={() => setActiveTab('gallery')} className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'gallery' ? 'border-blue-600 text-blue-600' : 'border-transparent text-blue-400 hover:text-blue-600'}`}>
                    Gallery
                  </button>
                  <button onClick={() => setActiveTab('sections')} className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'sections' ? 'border-blue-600 text-blue-600' : 'border-transparent text-blue-400 hover:text-blue-600'}`}>
                    Sections
                  </button>
                  <button onClick={() => setActiveTab('faqs')} className={`py-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'faqs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-blue-400 hover:text-blue-600'}`}>
                    FAQs
                  </button>
                </>
              )}
            </nav>
          </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-blue-400">Loading...</div>
          ) : (
        <>
          {activeTab === 'fields' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-900">Text Fields</h3>
                {editingService && (
                  <button
                    onClick={() => { setEditingService(null); setActiveTab('service-lines'); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <X size={16} />
                    Back to Service Lines
                  </button>
              )}
            </div>
            <div className="space-y-4">
              {textFieldGroups ? (
                textFieldGroups.map((group) => {
                  if (editingService) {
                    // Render Service model fields directly
                    return (
                      <section key={('label' in group) ? group.label : group.title} className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                        <div>
                          <h4 className="font-semibold text-blue-900">{('label' in group) ? group.label : group.title}</h4>
                        </div>
                        {group.keys.map((key) => renderServiceTextField(key, ('label' in group) ? group.label : group.title))}
                      </section>
                    );
                  }

                  // Render PageField records for other pages with auto-create
                  const currentFields = pageFields;
                  const hasDefaults = 'defaults' in group;

                  if (hasDefaults) {
                    // Use auto-create for fields with defaults
                    return (
                      <section key={('title' in group) ? group.title : group.label} className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                        <div>
                          <h4 className="font-semibold text-blue-900">{('title' in group) ? group.title : group.label}</h4>
                          {('description' in group) && <p className="text-sm text-blue-600">{group.description}</p>}
                        </div>
                        {group.keys.map((key, index) =>
                          renderAutoCreateField(key, key, (group as any).defaults[index] || '')
                        )}
                      </section>
                    );
                  }

                  // Render existing PageField records for groups without defaults
                  const fields = group.keys
                    .map((key) => currentFields.find((field) => field.key === key))
                    .filter((field): field is PageField => Boolean(field));

                  return (
                    <section key={('title' in group) ? group.title : group.label} className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                      <div>
                        <h4 className="font-semibold text-blue-900">{('title' in group) ? group.title : group.label}</h4>
                        {('description' in group) && <p className="text-sm text-blue-600">{group.description}</p>}
                      </div>
                      {fields.length ? fields.map(renderTextField) : (
                        <p className="text-sm text-blue-600">No CMS fields have been created for this section yet.</p>
                      )}
                    </section>
                  );
                })
              ) : pageFields.map(renderTextField)}

              {/* Render section text fields when editing a service */}
              {editingService && editingService.sections.length > 0 && (
                <section className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                  <div>
                    <h4 className="font-semibold text-blue-900">Section Text Fields</h4>
                    <p className="text-sm text-blue-600">Edit text content for each service section</p>
                  </div>
                  {editingService.sections.map((section) => (
                    <div key={section.id} className="mt-4 pt-4 border-t border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-3">{section.label}</h5>
                      {SECTION_TEXT_FIELD_GROUPS.map((group) =>
                        group.keys.map((key) => renderSectionTextField(section, key, group.label))
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Images</h3>
              {editingService && (
                <button
                  onClick={() => { setEditingService(null); setActiveTab('service-lines'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <X size={16} />
                  Back to Service Lines
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {imageSlots ? (
                imageSlots.map((slot) => {
                  // Service hero and section images live on the Service
                  // and ServiceSection API responses. PageImage is only
                  // used for the regular website pages.
                  const currentImages = editingService ? displayedImages : pageImages;
                  const image = currentImages.find((img) => img.key === slot.key);

                  return (
                    <div key={`${image?.id || 0}-${slot.key}`} className="border border-blue-200 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-blue-50 relative">
                        {image?.image_url_display && (
                          <img src={image.image_url_display} alt={image.alt_text} className="w-full h-full object-cover" />
                        )}
                        {!image?.image_url_display && (
                          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-blue-400">No image uploaded yet</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-blue-900 mb-1">{slot.label}</h4>
                        <p className="text-sm text-blue-400 mb-3">Key: {slot.key}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditImage(slot.key, slot.label, image)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          {image && (image.id > 0 || image.image_url) && (
                            <button
                              onClick={() => handleDelete('image', image.id || Number(slot.key))}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              aria-label={`Delete ${slot.label}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center text-blue-400">No image slots configured for this page.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'faqs' && editingService && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#10243d]">Frequently Asked Questions</h3>
              <button
                onClick={() => handleAddServiceFAQ(editingService.id)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1e63b8] text-white rounded-lg hover:bg-[#1a5699] transition-colors"
              >
                <Plus size={16} />
                Add FAQ
              </button>
            </div>
            <div className="space-y-3">
              {editingService.faqs?.map((faq) => (
                <div key={faq.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-[#10243d]">{faq.question}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingFAQ(faq); setShowFAQModal(true); }}
                        className="p-2 text-[#1e63b8] hover:bg-blue-50 rounded"
                        aria-label={`Edit FAQ`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteServiceFAQ(editingService.id, faq.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        aria-label={`Delete FAQ`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">{faq.answer}</p>
                </div>
              ))}
              {!editingService.faqs?.length && (
                <p className="rounded-lg border border-dashed border-blue-300 p-6 text-center text-sm text-blue-400">
                  No FAQs added yet. Click "Add FAQ" to create one.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && editingService && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#10243d]">Service Gallery Images</h3>
              <button
                onClick={handleOpenGallerySelector}
                className="flex items-center gap-2 px-4 py-2 bg-[#1e63b8] text-white rounded-lg hover:bg-[#1a5699] transition-colors"
              >
                <ImageIcon size={16} />
                Select Images
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {editingService.gallery_images?.map((image) => (
                <div key={image.id} className="relative aspect-square rounded-lg border border-blue-200 overflow-hidden group">
                  <img src={image.url} alt={image.alt_text || image.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm">{image.name}</span>
                  </div>
                </div>
              ))}
              {!editingService.gallery_images?.length && (
                <p className="col-span-full rounded-lg border border-dashed border-blue-300 p-6 text-center text-sm text-blue-400">
                  No gallery images selected. Click "Select Images" to add images to this service's gallery.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && activePage === 'home' && (
          <div>
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-[#10243d]">Home Testimonials: Review & Posting</h3>
              <p className="text-sm text-blue-400">Approve a testimonial to post it on the Home page. Rejected and pending testimonials are never shown publicly.</p>
            </div>
            <div className="space-y-3">
              {testimonials.map((testimonial) => (
                <article key={testimonial.id} className="rounded-lg border border-blue-200 p-4 bg-white shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[#10243d]">{testimonial.customer_name}</h4>
                    <p className="text-sm text-blue-400">{testimonial.company_name || 'Individual customer'} · {'★'.repeat(testimonial.rating)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${testimonial.status === 'APPROVED' ? 'bg-green-100 text-green-700' : testimonial.status === 'REJECTED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{testimonial.status}</span>
                </div>
                <p className="my-3 text-sm text-blue-700">{testimonial.content}</p>
                <div className="flex flex-wrap gap-2">
                  {testimonial.status !== 'APPROVED' && <button onClick={() => reviewTestimonial(testimonial, 'APPROVED')} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 cursor-pointer">Approve & Post</button>}
                  {testimonial.status !== 'REJECTED' && <button onClick={() => reviewTestimonial(testimonial, 'REJECTED')} className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 cursor-pointer">Reject</button>}
                  <button onClick={() => deleteTestimonial(testimonial.id)} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer">Delete</button>
                            </div>
                          </article>
                        ))}
                        {testimonials.length === 0 && <p className="rounded-lg border border-dashed border-blue-300 p-6 text-center text-sm text-blue-400">No testimonial submissions are waiting for review.</p>}
                      </div>
                    </div>
                  )}

                  {activeTab === 'project-management' && activePage === 'projects' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-lg font-semibold text-[#10243d]">Project Cards & Heat Map</h3>
                        <p className="text-sm text-blue-400">Public project cards come only from Project Management. Add the project, upload activity-gallery photos, set cover image, mark as published, then save its latitude and longitude for the locations map.</p>
                      </div>
                      <a href="/admin/projects/create" className="inline-flex rounded-lg bg-[#1e63b8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a5699] transition-colors">Add a new project</a>
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {managedProjects.map((project) => (
                          <article key={project.id} className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
                            {(project.cover_image || project.cover_image_url) ? (
                              <img 
                                src={project.cover_image || project.cover_image_url} 
                                alt={project.name} 
                                className="h-48 w-full object-cover"
                              />
                            ) : (
                              <div className="grid grid-cols-3 gap-1 bg-blue-100 p-1">
                                {project.gallery_images?.slice(0, 3).map((image) => <img key={image.id} src={image.url} alt={image.caption || project.name} className="h-24 w-full object-cover" />)}
                                {!project.gallery_images?.length && <div className="col-span-3 flex h-24 items-center justify-center text-sm text-blue-400">No gallery images uploaded</div>}
                              </div>
                            )}
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="font-semibold text-[#10243d]">{project.name}</h4>
                                  <p className="text-sm text-blue-400">{project.site_location || 'Location not added'} · {project.service_line.replaceAll('_', ' ')}</p>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${project.is_published ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-600'}`}>
                                  {project.is_published ? 'Published' : 'Draft'}
                                </span>
                              </div>
                              <p className="my-3 text-sm text-blue-700">{project.public_description || project.scope_description || 'No project description added.'}</p>
                              <p className="mb-3 text-xs text-blue-400">Map coordinates: {project.latitude && project.longitude ? `${project.latitude}, ${project.longitude}` : 'Not added yet'}</p>
                              <div className="flex flex-wrap gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingProject(project);
                                    setShowProjectImageSelector(true);
                                    loadMediaAssets();
                                  }}
                                  className="rounded-lg border border-[#1e63b8] px-3 py-2 text-sm text-[#1e63b8] hover:bg-blue-50"
                                >
                                  Change featured image
                                </button>
                                <a href={`/admin/projects/gallery/${project.id}`} className="rounded-lg border border-[#1e63b8] px-3 py-2 text-sm text-[#1e63b8]">Manage gallery</a>
                                <a href={`/admin/projects/details/${project.id}`} className="rounded-lg border border-blue-300 px-3 py-2 text-sm text-blue-700">Edit details & map</a>
                                <button 
                                  onClick={() => toggleProjectPublishing(project)} 
                                  className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${project.is_published ? 'bg-blue-700' : 'bg-green-600'}`}
                                >
                                  {project.is_published ? 'Unpublish' : 'Publish'}
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                        {!managedProjects.length && <p className="rounded-lg border border-dashed border-blue-300 p-6 text-center text-sm text-blue-400">No Project Management records are available yet.</p>}
                      </div>
                    </div>
                  )}

                  {activeTab === 'blog-management' && activePage === 'blog' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-[#10243d]">Blog Management</h3>
                          <p className="text-sm text-blue-400">Manage blog posts, categories, and tags.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingBlogPost(null); setShowBlogEditor(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1e63b8] text-white rounded-lg hover:bg-[#1a5699] transition-colors"
                          >
                            <Plus size={16} />
                            New Article
                          </button>
                          <button
                            onClick={() => { setEditingCategory(null); setShowCategoryEditor(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Plus size={16} />
                            Category
                          </button>
                          <button
                            onClick={() => { setEditingTag(null); setShowTagEditor(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Plus size={16} />
                            Tag
                          </button>
                        </div>
                      </div>

                      {/* Blog Posts */}
                      <div className="mb-8">
                        <h4 className="text-md font-semibold text-[#10243d] mb-4">Articles</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {blogPosts.map((post) => (
                            <div key={post.id} className="border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
                              <div className="flex">
                                {post.featured_image ? (
                                  <div className="w-32 h-32 flex-shrink-0">
                                    <img
                                      src={post.featured_image}
                                      alt={post.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                    <ImageIcon size={32} className="text-blue-300" />
                                  </div>
                                )}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      {post.is_featured && (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Featured</span>
                                      )}
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-600'}`}>
                                        {post.status}
                                      </span>
                                      {post.category && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{post.category}</span>
                                      )}
                                    </div>
                                    <h5 className="font-semibold text-[#10243d] mb-1">{post.title}</h5>
                                    <p className="text-sm text-blue-400 mb-2 line-clamp-2">{post.excerpt}</p>
                                    <div className="flex items-center gap-4 text-xs text-blue-400">
                                      <span>{post.reading_time} min read</span>
                                      {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => { setEditingBlogPost(post); setShowBlogEditor(true); }}
                                      className="p-2 text-[#1e63b8] hover:bg-blue-50 rounded"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBlogPost(post.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          ))}
                          {blogPosts.length === 0 && (
                            <div className="rounded-lg border border-dashed border-blue-300 p-6 text-center text-sm text-blue-400">
                              No articles yet. Click "New Article" to create your first blog post.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="mb-8">
                        <h4 className="text-md font-semibold text-[#10243d] mb-4">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {blogCategories.map((category) => (
                            <div key={category.id} className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
                              <span className="text-sm font-medium text-blue-700">{category.name}</span>
                              <button
                                onClick={() => { setEditingCategory(category); setShowCategoryEditor(true); }}
                                className="p-1 text-[#1e63b8] hover:bg-blue-50 rounded"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          {blogCategories.length === 0 && (
                            <div className="w-full rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                              No categories yet.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <h4 className="text-md font-semibold text-[#10243d] mb-4">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {blogTags.map((tag) => (
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
                              <span className="text-sm text-blue-600">#{tag.name}</span>
                              <button
                                onClick={() => { setEditingTag(tag); setShowTagEditor(true); }}
                                className="p-1 text-[#1e63b8] hover:bg-blue-50 rounded"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteTag(tag.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          {blogTags.length === 0 && (
                            <div className="w-full rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                              No tags yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'values' && activePage === 'about' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#10243d]">Core Values</h3>
                          <p className="text-sm text-slate-500">These are the value cards shown on the About Us page.</p>
                        </div>
                        <button
                          onClick={() => { setEditingCoreValue(null); setShowValueModal(true); }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#1e63b8] text-white rounded-lg hover:bg-[#1a5699] transition-colors"
                        >
                          <Plus size={16} />
                          Add Value
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coreValues.map((value) => (
                          <div key={value.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{value.icon}</span>
                                <div>
                                  <h4 className="font-medium text-[#10243d]">{value.title}</h4>
                                  <p className="text-sm text-slate-500">{value.description}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setEditingCoreValue(value); setShowValueModal(true); }}
                                  className="p-2 text-[#1e63b8] hover:bg-blue-50 rounded"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete('value', value.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'team' && activePage === 'about' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#10243d]">Meet Our Team</h3>
                          <p className="text-sm text-blue-400">Add, edit, or remove the actual people displayed on the public About Us page.</p>
                        </div>
                        <button
                          onClick={() => router.push('/admin/content/website-content/add-team-member')}
                          className="flex items-center gap-2 px-4 py-2 bg-[#1e63b8] text-white rounded-lg hover:bg-[#1a5699] transition-colors"
                        >
                          <Plus size={16} />
                          Add Team Member
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <div className="aspect-square bg-blue-100">
                              {member.photo_url ? (
                                <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <span className="text-4xl">{member.name.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-medium text-[#10243d]">{member.name}</h4>
                              <p className="text-sm text-blue-400 mb-2">{member.role_title}</p>
                              <p className="text-sm text-blue-600 mb-3">{member.bio || 'No biography added yet.'}</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => router.push(`/admin/content/website-content/edit-team-member/${member.id}`)}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1e63b8] text-white rounded-lg hover:bg-[#1a5699] transition-colors text-sm"
                                >
                                  <Edit2 size={14} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete('member', member.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  aria-label={`Delete ${member.name}`}
                                  title={`Delete ${member.name}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {teamMembers.length === 0 && (
                        <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                          No team members yet. Select "Add Team Member" to add the first person.
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === 'service-lines' && activePage === 'services' && !editingService && (
                    <div>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-[#10243d]">Service Lines</h3>
                        <p className="text-sm text-slate-500">Click on a service to view and edit its detailed content.</p>
                      </div>
                      <div className="space-y-2">
                        {services.map((service) => (
                          <div
                            key={service.id}
                            onClick={() => { setEditingService(service); setActiveTab('fields'); }}
                            className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-[#1e63b8] hover:bg-blue-50 transition-colors bg-white shadow-sm"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-[#10243d]">{service.name}</h4>
                              <p className="text-sm text-slate-500">{service.short_description || service.description.substring(0, 80)}...</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span className={service.is_active ? 'text-green-600' : 'text-red-600'}>{service.is_active ? 'Active' : 'Inactive'}</span>
                              <span>•</span>
                              <span>{service.sections.length} sections</span>
                            </div>
                          </div>
                        ))}
                        {services.length === 0 && (
                          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                            No services yet. Go to "Service Lines Edit" to create services.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'service-lines-edit' && activePage === 'services' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#10243d]">Service Lines Management</h3>
                          <p className="text-sm text-slate-500">Create new services or delete existing ones.</p>
                        </div>
                        <button
                          onClick={() => { setSelectedService(newServiceDraft()); }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#1e63b8] text-white rounded-lg hover:bg-[#1a5699] transition-colors"
                        >
                          <Plus size={16} />
                          Create New Service
                        </button>
                      </div>
                      {!selectedService ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {services.map((service) => (
                            <div key={service.id} className="border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
                              {service.hero_image_source && (
                                <div className="aspect-video bg-blue-100">
                                  <img src={service.hero_image_source} alt={service.hero_alt_text} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  {service.icon && <span className="text-2xl">{service.icon}</span>}
                                  <h4 className="font-medium text-[#10243d]">{service.name}</h4>
                                </div>
                                <p className="text-sm text-slate-500 mb-3">{service.short_description || service.description.substring(0, 80)}...</p>
                                <button
                                  onClick={() => handleDeleteService(service.id)}
                                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                  <Trash2 size={14} />
                                  Delete Service
                                </button>
                              </div>
                            </div>
                          ))}
                          {services.length === 0 && (
                            <div className="col-span-3 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                              No services yet. Click "Create New Service" to add your first service.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-2xl mx-auto">
                          <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setSelectedService(null)} className="text-[#1e63b8] hover:text-[#1a5699] text-sm">← Back to Service List</button>
                            <h4 className="text-xl font-semibold text-[#10243d]">Create New Service</h4>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                              <input
                                type="text"
                                value={selectedService.name}
                                onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e63b8] focus:border-[#1e63b8]"
                                placeholder="e.g., Water Treatment"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                              <input
                                type="text"
                                value={selectedService.slug}
                                onChange={(e) => setSelectedService({ ...selectedService, slug: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e63b8] focus:border-[#1e63b8]"
                                placeholder="e.g., water-treatment"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
                              <textarea
                                value={selectedService.short_description}
                                onChange={(e) => setSelectedService({ ...selectedService, short_description: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e63b8] focus:border-[#1e63b8]"
                                rows={2}
                                placeholder="Brief description for service cards"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Full Description</label>
                              <textarea
                                value={selectedService.description}
                                onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e63b8] focus:border-[#1e63b8]"
                                rows={4}
                                placeholder="Detailed service description"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Icon (Emoji)</label>
                              <input
                                type="text"
                                value={selectedService.icon}
                                onChange={(e) => setSelectedService({ ...selectedService, icon: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e63b8] focus:border-[#1e63b8]"
                                placeholder="💧"
                              />
                            </div>
                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-4">
                              <div>
                                <p className="text-sm font-semibold text-blue-950">Hero section</p>
                                <p className="text-xs text-blue-700">This is the content visitors see first on the service page.</p>
                              </div>
                              <input type="text" value={selectedService.hero_eyebrow} onChange={(e) => setSelectedService({ ...selectedService, hero_eyebrow: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e63b8] focus:border-[#1e63b8]" placeholder="Small heading" />
                              <input type="text" value={selectedService.hero_title} onChange={(e) => setSelectedService({ ...selectedService, hero_title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e63b8] focus:border-[#1e63b8]" placeholder="Hero title (defaults to service name)" />
                              <textarea value={selectedService.hero_description} onChange={(e) => setSelectedService({ ...selectedService, hero_description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e63b8] focus:border-[#1e63b8]" rows={3} placeholder="Hero description (defaults to full description)" />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                              <input type="checkbox" checked={selectedService.is_active} onChange={(e) => setSelectedService({ ...selectedService, is_active: e.target.checked })} />
                              Publish this service as soon as it is created
                            </label>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleCreateService(selectedService)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1e63b8] text-white rounded-lg hover:bg-[#1a5699] transition-colors"
                              >
                                <Plus size={16} />
                                Create Service
                              </button>
                              <button
                                onClick={() => setSelectedService(null)}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
        </div>
      </div>

      {/* Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-blue-100">
              <div>
                <h3 className="text-xl font-semibold text-blue-900">{editingField ? 'Edit Field' : 'Add Field'}</h3>
                <p className="text-sm text-blue-400 mt-1">{editingField ? 'Update field properties and content' : 'Create a new editable field'}</p>
              </div>
              <button onClick={() => setShowFieldModal(false)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                <X size={20} className="text-blue-400" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveField(editingField || {}); }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Key</label>
                  <input
                    type="text"
                    defaultValue={editingField?.key}
                    onChange={(e) => setEditingField({ ...editingField, key: e.target.value } as any)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g. hero_headline"
                  />
                  <p className="text-xs text-blue-400 mt-1">Unique identifier for this field</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Label</label>
                  <input
                    type="text"
                    defaultValue={editingField?.label}
                    onChange={(e) => setEditingField({ ...editingField, label: e.target.value } as any)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g. Hero Headline"
                  />
                  <p className="text-xs text-blue-400 mt-1">Human-readable name shown in admin</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Field Type</label>
                  <select
                    defaultValue={editingField?.field_type || 'text'}
                    onChange={(e) => setEditingField({ ...editingField, field_type: e.target.value } as any)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="text">Short Text</option>
                    <option value="richtext">Paragraph</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Value</label>
                  {editingField?.field_type === 'richtext' ? (
                    <textarea
                      defaultValue={editingField?.value}
                      onChange={(e) => setEditingField({ ...editingField, value: e.target.value } as any)}
                      className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      rows={4}
                      placeholder="Enter paragraph content..."
                    />
                  ) : (
                    <input
                      type="text"
                      defaultValue={editingField?.value}
                      onChange={(e) => setEditingField({ ...editingField, value: e.target.value } as any)}
                      className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter text value..."
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    defaultValue={editingField?.display_order || 0}
                    onChange={(e) => setEditingField({ ...editingField, display_order: parseInt(e.target.value) } as any)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-blue-400 mt-1">Lower numbers appear first</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-blue-100 bg-blue-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="px-5 py-2.5 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-900">{editingImage ? 'Edit Image' : 'Add Image'}</h3>
              <button onClick={() => setShowImageModal(false)} className="p-2 hover:bg-blue-50 rounded">
                <X size={20} className="text-blue-400" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); console.log('Form submitted with editingImage:', editingImage); handleSaveImage(editingImage || {}); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Key</label>
                  <input
                    type="text"
                    defaultValue={editingImage?.key}
                    onChange={(e) => setEditingImage({ ...editingImage, key: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. hero_background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Label</label>
                  <input
                    type="text"
                    defaultValue={editingImage?.label}
                    onChange={(e) => setEditingImage({ ...editingImage, label: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Hero Background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      defaultValue={editingImage?.image_url}
                      onChange={(e) => setEditingImage({ ...editingImage, image_url: e.target.value } as any)}
                      className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={openMediaLibrary}
                      className="px-3 py-2 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200"
                      title="Select from Media Library"
                    >
                      <ImageIcon size={20} className="text-blue-600" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Or Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setEditingImage({ ...editingImage, image_file: file } as any);
                    }}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Alt Text</label>
                  <input
                    type="text"
                    defaultValue={editingImage?.alt_text}
                    onChange={(e) => setEditingImage({ ...editingImage, alt_text: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-blue-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Select from Media Library</h3>
                  <p className="text-sm text-blue-400 mt-1">Choose an image to use for this page</p>
                </div>
                <button onClick={() => setShowMediaLibrary(false)} className="p-2 hover:bg-blue-100 rounded-full transition-colors">
                  <X size={24} className="text-blue-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-blue-50 to-white">
              {mediaAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 p-8 mb-6 shadow-inner">
                    <ImageIcon size={64} className="text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-blue-700 mb-2">No images available</h4>
                  <p className="text-blue-400 text-center max-w-md">Upload images to the media library first, then refresh this selector.</p>
                  <button
                    onClick={loadMediaAssets}
                    className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Refresh Library
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => selectMediaAsset(asset)}
                      className="group relative aspect-square rounded-xl border-2 border-blue-200 bg-white overflow-hidden cursor-pointer hover:border-blue-600 hover:shadow-xl transition-all"
                    >
                      <img 
                        src={asset.url} 
                        alt={asset.alt_text || asset.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f1f5f9" width="100" height="100"/%3E%3Ctext fill="%2364748b" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium truncate">{asset.name || asset.alt_text}</p>
                      </div>
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-blue-100 bg-blue-50 flex justify-between items-center">
              <p className="text-sm text-blue-600">{mediaAssets.length} {mediaAssets.length === 1 ? 'image' : 'images'} available</p>
              <div className="flex gap-3">
                <a
                  href="/admin/content/media"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2 px-4 py-2.5"
                >
                  Open full Media Library
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <button
                  onClick={() => setShowMediaLibrary(false)}
                  className="px-5 py-2.5 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Post Editor Modal */}
      {showBlogEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{editingBlogPost ? 'Edit Article' : 'New Article'}</h3>
                  <p className="text-sm text-blue-400 mt-1">{editingBlogPost ? 'Update your blog article' : 'Create a new blog article'}</p>
                </div>
                <button onClick={() => { setShowBlogEditor(false); setEditingBlogPost(null); }} className="p-2 hover:bg-blue-100 rounded-full transition-colors">
                  <X size={24} className="text-blue-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-blue-50">
              <form onSubmit={handleSaveBlogPost} className="space-y-5">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Title</label>
                  <input
                    type="text"
                    defaultValue={editingBlogPost?.title}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, title: e.target.value } as any)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter article title"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Slug (URL)</label>
                    <input
                      type="text"
                      defaultValue={editingBlogPost?.slug}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, slug: e.target.value } as any)}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="article-url-slug"
                      required
                    />
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Reading Time (minutes)</label>
                    <input
                      type="number"
                      defaultValue={editingBlogPost?.reading_time || 5}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, reading_time: parseInt(e.target.value) } as any)}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="5"
                    />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Excerpt</label>
                  <textarea
                    defaultValue={editingBlogPost?.excerpt}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, excerpt: e.target.value } as any)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows={3}
                    placeholder="Brief summary of the article"
                    required
                  />
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Content</label>
                  <textarea
                    defaultValue={editingBlogPost?.content}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, content: e.target.value } as any)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-mono text-sm"
                    rows={10}
                    placeholder="Write your article content here (supports markdown-like formatting)"
                    required
                  />
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Featured Image</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      defaultValue={editingBlogPost?.featured_image || ''}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, featured_image: e.target.value } as any)}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => { setShowBlogImageSelector(true); loadBlogMediaAssets(); }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      <ImageIcon size={16} />
                      Select from Media Library
                    </button>
                    {editingBlogPost?.featured_image && (
                      <div className="mt-2">
                        <img
                          src={editingBlogPost.featured_image}
                          alt="Featured image preview"
                          className="w-full h-32 object-cover rounded-lg border border-blue-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Category</label>
                    <select
                      defaultValue={editingBlogPost?.category_id || ''}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, category_id: e.target.value ? parseInt(e.target.value) : null } as any)}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select category</option>
                      {blogCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Status</label>
                    <select
                      defaultValue={editingBlogPost?.status || 'DRAFT'}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, status: e.target.value } as any)}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={editingBlogPost?.is_featured || false}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, is_featured: e.target.checked } as any)}
                      className="w-5 h-5 rounded border-blue-200 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-sm font-semibold text-blue-700">Featured Article</span>
                  </label>
                  <p className="text-xs text-blue-400 mt-1 ml-8">Featured articles appear prominently on the blog page</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-3">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {blogTags.map(tag => (
                      <label key={tag.id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors border border-blue-200">
                        <input
                          type="checkbox"
                          defaultChecked={editingBlogPost?.tag_ids?.includes(tag.id)}
                          onChange={(e) => {
                            const currentIds = editingBlogPost?.tag_ids || [];
                            if (e.target.checked) {
                              setEditingBlogPost({ ...editingBlogPost, tag_ids: [...currentIds, tag.id] } as any);
                            } else {
                              setEditingBlogPost({ ...editingBlogPost, tag_ids: currentIds.filter(id => id !== tag.id) } as any);
                            }
                          }}
                          className="w-4 h-4 rounded border-blue-200 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="text-sm font-medium text-blue-700">{tag.name}</span>
                      </label>
                    ))}
                    {blogTags.length === 0 && (
                      <p className="text-sm text-blue-400 italic">No tags available. Create tags first.</p>
                    )}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Meta Description</label>
                  <textarea
                    defaultValue={editingBlogPost?.meta_description || ''}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, meta_description: e.target.value } as any)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows={2}
                    placeholder="SEO meta description"
                  />
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Meta Keywords</label>
                  <input
                    type="text"
                    defaultValue={editingBlogPost?.meta_keywords || ''}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, meta_keywords: e.target.value } as any)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-blue-100 bg-white">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => { setShowBlogEditor(false); setEditingBlogPost(null); }}
                  className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBlogPost}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                  {saving ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Editor Modal */}
      {showCategoryEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                  <p className="text-sm text-blue-400 mt-1">{editingCategory ? 'Update blog category' : 'Create a new blog category'}</p>
                </div>
                <button onClick={() => { setShowCategoryEditor(false); setEditingCategory(null); }} className="p-2 hover:bg-blue-200 rounded-full transition-colors">
                  <X size={24} className="text-blue-600" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-blue-50">
              <form onSubmit={handleSaveCategory} className="space-y-5">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Name</label>
                  <input
                    type="text"
                    defaultValue={editingCategory?.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value } as any)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Category name"
                    required
                  />
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Slug (URL)</label>
                  <input
                    type="text"
                    defaultValue={editingCategory?.slug}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value } as any)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="category-slug"
                    required
                  />
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Description</label>
                  <textarea
                    defaultValue={editingCategory?.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value } as any)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows={3}
                    placeholder="Category description"
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-blue-100 bg-white">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => { setShowCategoryEditor(false); setEditingCategory(null); }}
                  className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Editor Modal */}
      {showTagEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{editingTag ? 'Edit Tag' : 'New Tag'}</h3>
                  <p className="text-sm text-blue-400 mt-1">{editingTag ? 'Update blog tag' : 'Create a new blog tag'}</p>
                </div>
                <button onClick={() => { setShowTagEditor(false); setEditingTag(null); }} className="p-2 hover:bg-blue-200 rounded-full transition-colors">
                  <X size={24} className="text-blue-600" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-blue-50">
              <form onSubmit={handleSaveTag} className="space-y-5">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Name</label>
                  <input
                    type="text"
                    defaultValue={editingTag?.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value } as any)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Tag name"
                    required
                  />
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Slug (URL)</label>
                  <input
                    type="text"
                    defaultValue={editingTag?.slug}
                    onChange={(e) => setEditingTag({ ...editingTag, slug: e.target.value } as any)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="tag-slug"
                    required
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-blue-100 bg-white">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => { setShowTagEditor(false); setEditingTag(null); }}
                  className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTag}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                  {saving ? 'Saving...' : 'Save Tag'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Image Selector Modal */}
      {showBlogImageSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Select Featured Image</h3>
                  <p className="text-sm text-blue-400 mt-1">Choose an image from the blog media library</p>
                </div>
                <button onClick={() => setShowBlogImageSelector(false)} className="p-2 hover:bg-blue-100 rounded-full transition-colors">
                  <X size={24} className="text-blue-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-blue-50 to-white">
              {blogMediaAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 p-8 mb-6 shadow-inner">
                    <ImageIcon size={64} className="text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-blue-700 mb-2">No images available</h4>
                  <p className="text-blue-400 text-center max-w-md">Upload images to the 'blog' folder in the media library first, then refresh this selector.</p>
                  <button
                    onClick={loadBlogMediaAssets}
                    className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Refresh Library
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {blogMediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectBlogImage(asset.url)}
                      className="relative aspect-square rounded-xl border-2 border-blue-200 bg-white overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all group"
                    >
                      <img 
                        src={asset.url} 
                        alt={asset.alt_text || asset.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e0f2fe" width="100" height="100"/%3E%3Ctext fill="%230ea5e9" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium truncate">{asset.name || asset.alt_text}</p>
                      </div>
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-blue-100 bg-blue-50 flex justify-between items-center">
              <p className="text-sm text-blue-600">{blogMediaAssets.length} {blogMediaAssets.length === 1 ? 'image' : 'images'} available</p>
              <button
                onClick={() => setShowBlogImageSelector(false)}
                className="px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Selector Modal */}
      {showGallerySelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Select Gallery Images for {editingService?.name}</h3>
                  <p className="text-sm text-blue-400 mt-1">Choose images to add to this service's gallery</p>
                </div>
                <button onClick={() => setShowGallerySelector(false)} className="p-2 hover:bg-blue-100 rounded-full transition-colors">
                  <X size={24} className="text-blue-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-blue-50 to-white">
              {availableMediaAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 p-8 mb-6 shadow-inner">
                    <ImageIcon size={64} className="text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-blue-700 mb-2">No images available</h4>
                  <p className="text-blue-400 text-center max-w-md">Upload images to the media library first, then refresh this selector.</p>
                  <button
                    onClick={() => { loadMediaAssets(); }}
                    className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Refresh Library
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {availableMediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleToggleGalleryImage(asset.id.toString())}
                      className={`relative aspect-square rounded-xl border-2 bg-white overflow-hidden cursor-pointer transition-all group ${
                        selectedGalleryImages.has(asset.id.toString())
                          ? 'border-blue-600 ring-2 ring-blue-500 ring-offset-2 shadow-lg'
                          : 'border-blue-200 hover:border-blue-500 hover:shadow-xl'
                      }`}
                    >
                      <img 
                        src={asset.url} 
                        alt={asset.alt_text || asset.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e0f2fe" width="100" height="100"/%3E%3Ctext fill="%230ea5e9" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium truncate">{asset.name || asset.alt_text}</p>
                      </div>
                      {selectedGalleryImages.has(asset.id.toString()) && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow-md">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-blue-100 bg-blue-50 flex justify-between items-center">
              <p className="text-sm text-blue-600">
                {selectedGalleryImages.size} image{selectedGalleryImages.size !== 1 ? 's' : ''} selected · {availableMediaAssets.length} available
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGallerySelector(false)}
                  className="px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGalleryImages}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Image Selector Modal */}
      {showProjectImageSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Select Featured Image</h3>
                  <p className="text-sm text-blue-400 mt-1">Choose an image for {editingProject?.name}</p>
                </div>
                <button onClick={() => { setShowProjectImageSelector(false); setEditingProject(null); }} className="p-2 hover:bg-blue-100 rounded-full transition-colors">
                  <X size={24} className="text-blue-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-blue-50 to-white">
              {mediaAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 p-8 mb-6 shadow-inner">
                    <ImageIcon size={64} className="text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-blue-700 mb-2">No images available</h4>
                  <p className="text-blue-400 text-center max-w-md">Upload images to the media library first, then refresh this selector.</p>
                  <button
                    onClick={loadMediaAssets}
                    className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Refresh Library
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => selectProjectImage(asset)}
                      className="group relative aspect-square rounded-xl border-2 border-blue-200 bg-white overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all"
                    >
                      <img
                        src={asset.url}
                        alt={asset.alt_text || asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e0f2fe" width="100" height="100"/%3E%3Ctext fill="%230ea5e9" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium truncate">{asset.name || asset.alt_text}</p>
                      </div>
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-blue-100 bg-blue-50 flex justify-between items-center">
              <p className="text-sm text-blue-600">{mediaAssets.length} {mediaAssets.length === 1 ? 'image' : 'images'} available</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowProjectImageSelector(false); setEditingProject(null); }}
                  className="px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Core Value Modal */}
      {showValueModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-900">{editingCoreValue ? 'Edit Core Value' : 'Add Core Value'}</h3>
              <button onClick={() => setShowValueModal(false)} className="p-2 hover:bg-blue-100 rounded text-blue-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveValue(editingCoreValue || {}); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Title</label>
                  <input
                    type="text"
                    defaultValue={editingCoreValue?.title}
                    onChange={(e) => setEditingCoreValue({ ...editingCoreValue, title: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Description</label>
                  <textarea
                    defaultValue={editingCoreValue?.description}
                    onChange={(e) => setEditingCoreValue({ ...editingCoreValue, description: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Icon (Emoji)</label>
                  <input
                    type="text"
                    defaultValue={editingCoreValue?.icon}
                    onChange={(e) => setEditingCoreValue({ ...editingCoreValue, icon: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. ✓"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    defaultValue={editingCoreValue?.display_order || 0}
                    onChange={(e) => setEditingCoreValue({ ...editingCoreValue, display_order: parseInt(e.target.value) } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowValueModal(false)}
                  className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFAQModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-900">{editingFAQ ? 'Edit FAQ' : 'Add FAQ'}</h3>
              <button onClick={() => setShowFAQModal(false)} className="p-2 hover:bg-blue-100 rounded text-blue-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveServiceFAQ(editingService?.id || 0, editingFAQ || { id: 0, question: '', answer: '', display_order: 0, is_enabled: true }); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Question</label>
                  <input
                    type="text"
                    defaultValue={editingFAQ?.question}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Answer</label>
                  <textarea
                    defaultValue={editingFAQ?.answer}
                    onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFAQModal(false)}
                  className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-900">{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button onClick={() => { setShowMemberModal(false); setMemberPhotoPreview(null); }} className="p-2 hover:bg-blue-100 rounded text-blue-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveMember(editingMember || {}); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Link to Employee (Optional)</label>
                  <select
                    defaultValue={editingMember?.employee || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, employee: e.target.value ? parseInt(e.target.value) : null } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Employee (Optional) --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-blue-400">Link to an existing employee to use their photo and basic info. Can be overridden below.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Name {editingMember?.employee ? '(Override)' : ''}</label>
                  <input
                    type="text"
                    defaultValue={editingMember?.name || editingMember?.employee_name || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={editingMember?.employee_name || 'Enter name'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    defaultValue={editingMember?.role_title}
                    onChange={(e) => setEditingMember({ ...editingMember, role_title: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Bio</label>
                  <textarea
                    defaultValue={editingMember?.bio}
                    onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">{editingMember ? 'Replace photo' : 'Upload photo'} {editingMember?.employee ? '(Override employee photo)' : ''}</label>
                  {memberPhotoPreview && (
                    <img src={memberPhotoPreview} alt="Selected team member preview" className="mb-3 h-28 w-28 rounded-full border border-blue-200 object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditingMember({ ...editingMember, photo_file: file } as any);
                        setMemberPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-blue-400">Choose an image when creating a member, or select a new file here to replace the existing photo.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    defaultValue={editingMember?.display_order || 0}
                    onChange={(e) => setEditingMember({ ...editingMember, display_order: parseInt(e.target.value) } as any)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowMemberModal(false); setMemberPhotoPreview(null); }}
                  className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function WebsiteContentPage() {
  return (
    <Suspense fallback={
      <AdminLayout
        title="Website Content"
        subtitle="Loading..."
        activePath="/admin/content/website-content"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading...</div>
        </div>
      </AdminLayout>
    }>
      <WebsiteContentPageContent />
    </Suspense>
  );
}
