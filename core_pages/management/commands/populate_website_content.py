from django.core.management.base import BaseCommand
from core_pages.models import PageField, PageImage, CoreValue, TeamMember


class Command(BaseCommand):
    help = 'Populate website content with realistic data for Spencer Water Services'

    def handle(self, *args, **options):
        self.stdout.write('Populating website content...')

        # Clear existing data
        PageField.objects.all().delete()
        PageImage.objects.all().delete()
        CoreValue.objects.all().delete()
        TeamMember.objects.all().delete()

        # ===== HOME PAGE =====
        home_fields = [
            {
                'page': 'home',
                'key': 'hero_eyebrow',
                'label': 'Hero Eyebrow',
                'field_type': 'text',
                'value': 'Water engineering across Uganda',
                'display_order': 1
            },
            {
                'page': 'home',
                'key': 'hero_headline',
                'label': 'Hero Headline',
                'field_type': 'text',
                'value': 'Reliable Water. Sustainable Future.',
                'display_order': 2
            },
            {
                'page': 'home',
                'key': 'hero_description',
                'label': 'Hero Description',
                'field_type': 'richtext',
                'value': 'Professional water engineering solutions for boreholes, solar water pumping, treatment, pipelines, plumbing, storage, and technical project support.',
                'display_order': 3
            },
        ]

        for field_data in home_fields:
            PageField.objects.create(**field_data)

        home_images = [
            {
                'page': 'home',
                'key': 'hero_image_1',
                'label': 'Hero Image 1',
                'image_url': 'https://images.unsplash.com/photo-1541544741-fa0b16e32b3d?w=1920&h=1080&fit=crop',
                'alt_text': 'Water treatment facility with blue water tanks'
            },
            {
                'page': 'home',
                'key': 'hero_image_2',
                'label': 'Hero Image 2',
                'image_url': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&h=1080&fit=crop',
                'alt_text': 'Solar water pumping installation'
            },
            {
                'page': 'home',
                'key': 'hero_image_3',
                'label': 'Hero Image 3',
                'image_url': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=1080&fit=crop',
                'alt_text': 'Borehole drilling project'
            },
        ]

        for img_data in home_images:
            PageImage.objects.create(**img_data)

        # ===== ABOUT PAGE =====
        about_fields = [
            {
                'page': 'about',
                'key': 'hero_headline',
                'label': 'Hero Headline',
                'field_type': 'text',
                'value': 'About Spencer Water Services Ltd',
                'display_order': 1
            },
            {
                'page': 'about',
                'key': 'hero_subheadline',
                'label': 'Hero Subheadline',
                'field_type': 'richtext',
                'value': 'Leading water solutions provider committed to delivering excellence in water supply, engineering, and infrastructure services across Uganda since 2010.',
                'display_order': 2
            },
            {
                'page': 'about',
                'key': 'company_overview_title',
                'label': 'Company Overview Title',
                'field_type': 'text',
                'value': 'Our Story',
                'display_order': 3
            },
            {
                'page': 'about',
                'key': 'company_overview',
                'label': 'Company Overview',
                'field_type': 'richtext',
                'value': 'Spencer Water Services Limited was established with a vision to provide reliable and sustainable water solutions to communities and businesses across Uganda. Over the years, we have grown from a small local operation to a leading water services company, serving residential, commercial, and industrial clients.\n\nOur team of experienced engineers and technicians ensures that every project meets the highest standards of quality and safety. We are committed to innovation, sustainability, and customer satisfaction in everything we do.',
                'display_order': 4
            },
            {
                'page': 'about',
                'key': 'mission_title',
                'label': 'Mission Title',
                'field_type': 'text',
                'value': 'Our Mission',
                'display_order': 5
            },
            {
                'page': 'about',
                'key': 'mission',
                'label': 'Mission Statement',
                'field_type': 'richtext',
                'value': 'To provide safe, reliable, and sustainable water solutions that improve lives and support economic growth in Uganda through innovation, excellence, and environmental stewardship.',
                'display_order': 6
            },
            {
                'page': 'about',
                'key': 'vision_title',
                'label': 'Vision Title',
                'field_type': 'text',
                'value': 'Our Vision',
                'display_order': 7
            },
            {
                'page': 'about',
                'key': 'vision',
                'label': 'Vision Statement',
                'field_type': 'richtext',
                'value': 'To be Uganda\'s leading water services provider, recognized for excellence, innovation, and commitment to sustainable water management practices.',
                'display_order': 8
            },
            {
                'page': 'about',
                'key': 'team_section_title',
                'label': 'Team Section Title',
                'field_type': 'text',
                'value': 'Meet Our Team',
                'display_order': 9
            },
            {
                'page': 'about',
                'key': 'team_section_description',
                'label': 'Team Section Description',
                'field_type': 'richtext',
                'value': 'Our dedicated team of professionals brings years of experience and expertise to deliver exceptional water solutions.',
                'display_order': 10
            },
        ]

        for field_data in about_fields:
            PageField.objects.create(**field_data)

        about_images = [
            {
                'page': 'about',
                'key': 'hero_background',
                'label': 'Hero Background',
                'alt_text': 'Water infrastructure and pipeline'
            },
            {
                'page': 'about',
                'key': 'company_image',
                'label': 'Company Overview Featured Image',
                'alt_text': 'Water engineering team at work'
            },
        ]

        for img_data in about_images:
            PageImage.objects.create(**img_data)

        # Core Values
        core_values = [
            {
                'title': 'Reliability',
                'description': 'Consistent and dependable service delivery you can trust',
                'icon': '💧',
                'display_order': 1
            },
            {
                'title': 'Quality',
                'description': 'Excellence in every project, meeting international standards',
                'icon': '⭐',
                'display_order': 2
            },
            {
                'title': 'Innovation',
                'description': 'Embracing modern technology for better solutions',
                'icon': '🚀',
                'display_order': 3
            },
            {
                'title': 'Sustainability',
                'description': 'Environmentally responsible water management practices',
                'icon': '🌱',
                'display_order': 4
            },
            {
                'title': 'Customer Focus',
                'description': 'Putting our clients\' needs first in everything we do',
                'icon': '🤝',
                'display_order': 5
            },
            {
                'title': 'Integrity',
                'description': 'Honest, transparent, and ethical business practices',
                'icon': '🛡️',
                'display_order': 6
            },
        ]

        for value_data in core_values:
            CoreValue.objects.create(**value_data)

        # Team Members
        team_members = [
            {
                'name': 'John Spencer',
                'role_title': 'Managing Director',
                'bio': 'Leading the company with over 20 years of experience in water engineering and infrastructure development across East Africa.',
                'display_order': 1
            },
            {
                'name': 'Sarah Namukasa',
                'role_title': 'Operations Manager',
                'bio': 'Overseeing daily operations with expertise in project management and quality control systems.',
                'display_order': 2
            },
            {
                'name': 'David Okello',
                'role_title': 'Lead Engineer',
                'bio': 'Specializing in water treatment systems and pipeline engineering with 15 years of technical experience.',
                'display_order': 3
            },
            {
                'name': 'Grace Nambi',
                'role_title': 'Finance Director',
                'bio': 'Managing financial operations and strategic planning with a background in corporate finance.',
                'display_order': 4
            },
        ]

        for member_data in team_members:
            TeamMember.objects.create(**member_data)

        # ===== SERVICES PAGE =====
        services_fields = [
            {
                'page': 'services',
                'key': 'hero_headline',
                'label': 'Hero Headline',
                'field_type': 'text',
                'value': 'Our Services',
                'display_order': 1
            },
            {
                'page': 'services',
                'key': 'hero_subheadline',
                'label': 'Hero Subheadline',
                'field_type': 'richtext',
                'value': 'Professional water engineering solutions for boreholes, solar water pumping, treatment, pipelines, plumbing, storage, and technical project support.',
                'display_order': 2
            },
            {
                'page': 'services',
                'key': 'services_list',
                'label': 'Services List',
                'field_type': 'richtext',
                'value': 'Borehole Drilling\nSolar Water Pumping Systems\nWater Treatment\nPlumbing Services\nPipeline Installation\nWater Storage Solutions\nWater Taps & Accessories\nWater Engineering Consultancy',
                'display_order': 3
            },
        ]

        for field_data in services_fields:
            PageField.objects.create(**field_data)

        services_images = [
            {
                'page': 'services',
                'key': 'hero_background',
                'label': 'Hero Background',
                'alt_text': 'Water supply and installation services'
            },
        ]

        for img_data in services_images:
            PageImage.objects.create(**img_data)

        # ===== CONTACT PAGE =====
        contact_fields = [
            {
                'page': 'contact',
                'key': 'hero_headline',
                'label': 'Hero Headline',
                'field_type': 'text',
                'value': 'Contact Us',
                'display_order': 1
            },
            {
                'page': 'contact',
                'key': 'hero_subheadline',
                'label': 'Hero Subheadline',
                'field_type': 'richtext',
                'value': 'Get in touch with us for inquiries, quotes, or support. We\'re here to help with all your water needs.',
                'display_order': 2
            },
            {
                'page': 'contact',
                'key': 'company_name',
                'label': 'Company Name',
                'field_type': 'text',
                'value': 'Spencer Water Services Limited',
                'display_order': 3
            },
            {
                'page': 'contact',
                'key': 'address',
                'label': 'Physical Address',
                'field_type': 'text',
                'value': 'Plot 123, Industrial Area, Kampala, Uganda',
                'display_order': 4
            },
            {
                'page': 'contact',
                'key': 'phone',
                'label': 'Phone Number',
                'field_type': 'text',
                'value': '+256 700 123 456',
                'display_order': 5
            },
            {
                'page': 'contact',
                'key': 'email',
                'label': 'Email Address',
                'field_type': 'text',
                'value': 'info@spencerwaterservices.co.ug',
                'display_order': 6
            },
            {
                'page': 'contact',
                'key': 'business_hours',
                'label': 'Business Hours',
                'field_type': 'richtext',
                'value': 'Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday: Closed',
                'display_order': 7
            },
            {
                'page': 'contact',
                'key': 'form_title',
                'label': 'Contact Form Title',
                'field_type': 'text',
                'value': 'Send Us a Message',
                'display_order': 8
            },
        ]

        for field_data in contact_fields:
            PageField.objects.create(**field_data)

        contact_images = [
            {
                'page': 'contact',
                'key': 'hero_background',
                'label': 'Hero Background',
                'alt_text': 'Contact us for water services'
            },
            {
                'page': 'contact',
                'key': 'map_image',
                'label': 'Map Location Image',
                'alt_text': 'Location map'
            },
        ]

        for img_data in contact_images:
            PageImage.objects.create(**img_data)

        # ===== PROJECTS PAGE =====
        projects_fields = [
            {
                'page': 'projects',
                'key': 'hero_headline',
                'label': 'Hero Headline',
                'field_type': 'text',
                'value': 'Our Projects',
                'display_order': 1
            },
            {
                'page': 'projects',
                'key': 'hero_subheadline',
                'label': 'Hero Subheadline',
                'field_type': 'richtext',
                'value': 'Explore our portfolio of successful water projects across Uganda, showcasing our expertise and commitment to excellence.',
                'display_order': 2
            },
            {
                'page': 'projects',
                'key': 'projects_intro',
                'label': 'Projects Introduction',
                'field_type': 'richtext',
                'value': 'We have successfully completed numerous water supply, treatment, and infrastructure projects for residential, commercial, and industrial clients. Each project demonstrates our commitment to quality and customer satisfaction.',
                'display_order': 3
            },
        ]

        for field_data in projects_fields:
            PageField.objects.create(**field_data)

        projects_images = [
            {
                'page': 'projects',
                'key': 'hero_background',
                'label': 'Hero Background',
                'alt_text': 'Water infrastructure projects'
            },
        ]

        for img_data in projects_images:
            PageImage.objects.create(**img_data)

        # ===== BLOG PAGE =====
        blog_fields = [
            {
                'page': 'blog',
                'key': 'hero_headline',
                'label': 'Hero Headline',
                'field_type': 'text',
                'value': 'Our Blog',
                'display_order': 1
            },
            {
                'page': 'blog',
                'key': 'hero_subheadline',
                'label': 'Hero Subheadline',
                'field_type': 'richtext',
                'value': 'Stay updated with the latest news, insights, and tips about water services, conservation, and industry trends.',
                'display_order': 2
            },
        ]

        for field_data in blog_fields:
            PageField.objects.create(**field_data)

        blog_images = [
            {
                'page': 'blog',
                'key': 'hero_background',
                'label': 'Hero Background',
                'alt_text': 'Water services blog'
            },
        ]

        for img_data in blog_images:
            PageImage.objects.create(**img_data)

        # ===== QUOTATION PAGE =====
        quotation_fields = [
            {
                'page': 'quotation',
                'key': 'hero_headline',
                'label': 'Hero Headline',
                'field_type': 'text',
                'value': 'Request a Quote',
                'display_order': 1
            },
            {
                'page': 'quotation',
                'key': 'hero_subheadline',
                'label': 'Hero Subheadline',
                'field_type': 'richtext',
                'value': 'Get a free, no-obligation quote for your water project. Fill out the form below and our team will get back to you within 24 hours.',
                'display_order': 2
            },
            {
                'page': 'quotation',
                'key': 'form_intro',
                'label': 'Form Introduction',
                'field_type': 'richtext',
                'value': 'Please provide as much detail as possible about your project requirements so we can give you an accurate quote.',
                'display_order': 3
            },
        ]

        for field_data in quotation_fields:
            PageField.objects.create(**field_data)

        quotation_images = [
            {
                'page': 'quotation',
                'key': 'hero_background',
                'label': 'Hero Background',
                'alt_text': 'Request quotation for water services'
            },
        ]

        for img_data in quotation_images:
            PageImage.objects.create(**img_data)

        self.stdout.write(self.style.SUCCESS('Successfully populated website content!'))
        self.stdout.write(f'Created {PageField.objects.count()} page fields')
        self.stdout.write(f'Created {PageImage.objects.count()} page images')
        self.stdout.write(f'Created {CoreValue.objects.count()} core values')
        self.stdout.write(f'Created {TeamMember.objects.count()} team members')
