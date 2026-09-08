"""Current public-site copy exposed as clear, editor-friendly CMS fields."""

DEFAULT_PAGE_FIELDS = [
    # Home
    ('home', 'hero_eyebrow', 'Hero banner — small heading', 'Water engineering across Uganda'),
    ('home', 'hero_headline', 'Hero banner — main heading', 'Reliable Water. Sustainable Future.'),
    ('home', 'hero_description', 'Hero banner — description', 'Professional water engineering solutions for boreholes, solar water pumping, treatment, pipelines, plumbing, storage, and technical project support.'),
    ('home', 'featured_projects_heading', 'Featured projects — heading', 'Featured Projects'),
    ('home', 'testimonials_heading', 'Testimonials — heading', 'Testimonials'),
    # About
    ('about', 'hero_eyebrow', 'Hero banner — small heading', 'Company profile'),
    ('about', 'hero_headline', 'Hero banner — main heading', 'About Spencer Water Services Ltd'),
    ('about', 'hero_description', 'Hero banner — description', 'A water engineering company supporting homes, institutions, farms, businesses, and communities with practical water systems across Uganda.'),
    ('about', 'overview_eyebrow', 'Company overview — small heading', 'Company overview'),
    ('about', 'overview_heading', 'Company overview — heading', 'Built around dependable water access'),
    ('about', 'company_overview_text', 'Company overview — paragraph', 'Spencer Water Services Ltd provides borehole drilling, solar water pumping, water treatment, pipeline installation, plumbing, storage solutions, accessories, and water engineering consultancy.'),
    ('about', 'mission_eyebrow', 'Mission and vision — small heading', 'Mission and vision'),
    ('about', 'mission_heading', 'Mission and vision — heading', 'Practical solutions, lasting service'),
    ('about', 'mission_text', 'Mission statement', 'Our mission is to deliver technically sound water systems that solve real needs.'),
    ('about', 'vision_text', 'Vision statement', 'Our vision is to be a trusted water-services partner for reliable, sustainable water infrastructure across Uganda.'),
    ('about', 'values_heading', 'Core values — heading', 'Core Values'),
    ('about', 'team_heading', 'Management team — heading', 'Management Team'),
    # Contact
    ('contact', 'hero_eyebrow', 'Hero banner — small heading', 'Get in touch'),
    ('contact', 'hero_headline', 'Hero banner — main heading', 'Contact Us'),
    ('contact', 'hero_description', 'Hero banner — description', 'Reach Spencer Water Services for project quotations, site visits, maintenance support, and technical water-service enquiries.'),
    ('contact', 'office_heading', 'Office details — heading', 'Office Details'),
    ('contact', 'phone', 'Office details — phone number', '+256 700 123 456'),
    ('contact', 'email', 'Office details — email address', 'info@spencerwaterservices.co.ug'),
    ('contact', 'office_address', 'Office details — address', 'Kampala, Uganda'),
    ('contact', 'business_hours', 'Office details — business hours', 'Monday to Saturday, 8:00 AM - 6:00 PM'),
    ('contact', 'emergency_contact', 'Office details — emergency contact', '+256 700 123 456'),
    # Services index
    ('services', 'hero_eyebrow', 'Hero banner — small heading', 'What we do'),
    ('services', 'hero_headline', 'Hero banner — main heading', 'Water Engineering Services'),
    ('services', 'hero_description', 'Hero banner — description', 'Complete water services covering boreholes, solar water pumping, treatment, plumbing, pipelines, storage, accessories, and technical consultancy.'),
    ('services', 'overview_eyebrow', 'Service overview — small heading', 'Service overview'),
    ('services', 'overview_heading', 'Service overview — heading', 'Practical systems for reliable water supply'),
    ('services', 'overview_text', 'Service overview — paragraph', 'Each service is planned around source conditions, water demand, site constraints, durability, maintenance, and the long-term value of the installation.'),
    ('services', 'overview_button', 'Service overview — quotation button', 'Request Quotation'),
    ('services', 'list_heading', 'Service list — heading', 'Explore Services'),
    ('services', 'cta_eyebrow', 'Bottom call-to-action — small heading', 'Need a site-specific recommendation?'),
    ('services', 'cta_heading', 'Bottom call-to-action — heading', 'Request a project quotation'),
    ('services', 'cta_button', 'Bottom call-to-action — button', 'Start Request'),
    # Blog
    ('blog', 'hero_eyebrow', 'Hero banner — small heading', 'Articles and updates'),
    ('blog', 'hero_headline', 'Hero banner — main heading', 'Blog'),
    ('blog', 'hero_description', 'Hero banner — description', 'Practical notes about water systems, project planning, maintenance, and choosing the right solution for each site.'),
    ('blog', 'search_eyebrow', 'Article search — small heading', 'Search articles'),
    ('blog', 'search_heading', 'Article search — heading', 'Find guidance by topic'),
    ('blog', 'search_text', 'Article search — paragraph', 'Blog search and categories can connect to the CMS when the backend content workflow is ready.'),
    ('blog', 'latest_heading', 'Latest articles — heading', 'Latest Articles'),
    # Projects
    ('projects', 'hero_eyebrow', 'Hero banner — small heading', 'Portfolio'),
    ('projects', 'hero_headline', 'Hero banner — main heading', 'Projects'),
    ('projects', 'hero_description', 'Hero banner — description', 'Selected water engineering work across drilling, pumping, treatment, distribution, and maintenance support.'),
    ('projects', 'categories_heading', 'Project categories — heading', 'Project Categories'),
    ('projects', 'cards_heading', 'Project cards — heading', 'Project Cards'),
    ('projects', 'locations_eyebrow', 'Locations — small heading', 'Locations'),
    ('projects', 'locations_heading', 'Locations — heading', 'Work across Uganda'),
    ('projects', 'locations_text', 'Locations — paragraph', 'Project locations can be expanded into a map, district list, and individual project-detail pages as real media and client approvals are added.'),
    # Quotation
    ('quotation', 'hero_eyebrow', 'Hero banner small heading', 'Project enquiry'),
    ('quotation', 'hero_headline', 'Hero banner main heading', 'Request Consultation & Quotation'),
    ('quotation', 'hero_subheadline', 'Hero banner description', 'Need a water solution? Tell us about your project and our engineers will review your requirements.'),
    ('quotation', 'form_intro', 'Quotation form introduction', 'Complete the form below and we will prepare a professional quotation for your project.'),
    # Quotation
    ('quotation', 'hero_eyebrow', 'Hero banner small heading', 'Project enquiry'),
    ('quotation', 'hero_headline', 'Hero banner main heading', 'Request Consultation & Quotation'),
    ('quotation', 'hero_subheadline', 'Hero banner description', 'Need a water solution? Tell us about your project and our engineers will review your requirements.'),
    ('quotation', 'form_intro', 'Quotation form introduction', 'Complete the form below and we will prepare a professional quotation for your project.'),
]


def ensure_default_page_fields():
    from .models import PageField
    existing = set(PageField.objects.values_list('page', 'key'))
    try:
        PageField.objects.bulk_create([
            PageField(page=page, key=key, label=label, value=value,
                      field_type='richtext' if len(value) > 120 else 'text', display_order=index)
            for index, (page, key, label, value) in enumerate(DEFAULT_PAGE_FIELDS, start=1)
            if (page, key) not in existing
        ], ignore_conflicts=True)
    except Exception as e:
        print(f"Error creating default page fields: {e}")


DEFAULT_PAGE_IMAGE_SLOTS = [
    ('about', 'hero_image_1', 'Hero banner - background image 1'),
    ('about', 'hero_image_2', 'Hero banner - background image 2'),
    ('about', 'hero_image_3', 'Hero banner - background image 3'),
    ('blog', 'hero_image_1', 'Hero banner - background image 1'),
    ('blog', 'hero_image_2', 'Hero banner - background image 2'),
    ('blog', 'hero_image_3', 'Hero banner - background image 3'),
    ('contact', 'hero_image_1', 'Hero banner - background image 1'),
    ('contact', 'hero_image_2', 'Hero banner - background image 2'),
    ('contact', 'hero_image_3', 'Hero banner - background image 3'),
    ('projects', 'hero_image_1', 'Hero banner - background image 1'),
    ('projects', 'hero_image_2', 'Hero banner - background image 2'),
    ('projects', 'hero_image_3', 'Hero banner - background image 3'),
    ('home', 'hero_image_1', 'Hero banner — background image 1'),
    ('home', 'hero_image_2', 'Hero banner — background image 2'),
    ('home', 'hero_image_3', 'Hero banner — background image 3'),
    ('about', 'company_image', 'Company overview — featured image'),
    ('about', 'mission_image', 'Mission and vision — featured image'),
    ('contact', 'map_image', 'Location map — image'),
    ('services', 'overview_image', 'Service overview — featured image'),
    ('projects', 'locations_image', 'Locations — map or featured image'),
    ('blog', 'search_image', 'Article search — featured image'),
    ('services', 'hero_image_1', 'Hero banner background image 1'),
    ('services', 'hero_image_2', 'Hero banner background image 2'),
    ('services', 'hero_image_3', 'Hero banner background image 3'),
    ('quotation', 'hero_background', 'Hero banner background image'),
]


def ensure_default_page_images():
    from .models import PageImage
    existing = set(PageImage.objects.values_list('page', 'key'))
    try:
        PageImage.objects.bulk_create([
            PageImage(page=page, key=key, label=label, alt_text='')
            for page, key, label in DEFAULT_PAGE_IMAGE_SLOTS if (page, key) not in existing
        ], ignore_conflicts=True)
    except Exception as e:
        print(f"Error creating default page images: {e}")
