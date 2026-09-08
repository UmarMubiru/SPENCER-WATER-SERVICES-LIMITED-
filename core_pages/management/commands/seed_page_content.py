from django.core.management.base import BaseCommand
from core_pages.models import PageField, PageImage, CoreValue, TeamMember


class Command(BaseCommand):
    help = 'Seed initial page content data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding page content data...')

        # Seed PageFields
        page_fields_data = [
            # Home
            {'page': 'home', 'key': 'hero_eyebrow', 'label': 'Hero — Eyebrow Text', 'value': 'Water engineering across Uganda', 'field_type': 'text', 'display_order': 1},
            {'page': 'home', 'key': 'hero_headline', 'label': 'Hero — Headline', 'value': 'Reliable Water. Sustainable Future.', 'field_type': 'text', 'display_order': 2},
            {'page': 'home', 'key': 'hero_description', 'label': 'Hero — Description', 'value': 'Providing comprehensive water solutions for residential, commercial, and industrial needs across Uganda.', 'field_type': 'richtext', 'display_order': 3},

            # About
            {'page': 'about', 'key': 'hero_headline', 'label': 'Hero — Headline', 'value': 'About Spencer Water Services Ltd', 'field_type': 'text', 'display_order': 1},
            {'page': 'about', 'key': 'company_overview_text', 'label': 'Company Overview', 'value': 'Spencer Water Services Limited is a leading water engineering company in Uganda, dedicated to providing innovative and sustainable water solutions.', 'field_type': 'richtext', 'display_order': 2},
            {'page': 'about', 'key': 'mission_text', 'label': 'Mission Statement', 'value': 'To deliver exceptional water engineering solutions that improve lives and protect the environment through innovation and sustainability.', 'field_type': 'richtext', 'display_order': 3},
            {'page': 'about', 'key': 'vision_text', 'label': 'Vision Statement', 'value': 'To be the leading water services provider in East Africa, known for excellence, reliability, and environmental stewardship.', 'field_type': 'richtext', 'display_order': 4},

            # Contact
            {'page': 'contact', 'key': 'phone', 'label': 'Phone Number', 'value': '+256 700 123 456', 'field_type': 'text', 'display_order': 1},
            {'page': 'contact', 'key': 'email', 'label': 'Email Address', 'value': 'info@spencerwaterservices.co.ug', 'field_type': 'text', 'display_order': 2},
            {'page': 'contact', 'key': 'office_address', 'label': 'Office Address', 'value': 'Kampala, Uganda', 'field_type': 'text', 'display_order': 3},
            {'page': 'contact', 'key': 'business_hours', 'label': 'Business Hours', 'value': 'Monday to Saturday, 8:00 AM - 6:00 PM', 'field_type': 'text', 'display_order': 4},
            {'page': 'contact', 'key': 'emergency_contact', 'label': 'Emergency Contact', 'value': '+256 700 123 456', 'field_type': 'text', 'display_order': 5},

            # Projects
            {'page': 'projects', 'key': 'hero_headline', 'label': 'Hero — Headline', 'value': 'Our Projects', 'field_type': 'text', 'display_order': 1},
            {'page': 'projects', 'key': 'hero_description', 'label': 'Hero — Description', 'value': 'Explore our portfolio of successful water engineering projects across Uganda.', 'field_type': 'richtext', 'display_order': 2},

            # Quotation
            {'page': 'quotation', 'key': 'hero_headline', 'label': 'Hero — Headline', 'value': 'Request a Quotation', 'field_type': 'text', 'display_order': 1},
            {'page': 'quotation', 'key': 'hero_description', 'label': 'Hero — Description', 'value': 'Get a customized quote for your water engineering needs.', 'field_type': 'richtext', 'display_order': 2},

            # Services
            {'page': 'services', 'key': 'hero_headline', 'label': 'Hero — Headline', 'value': 'Our Services', 'field_type': 'text', 'display_order': 1},
            {'page': 'services', 'key': 'hero_description', 'label': 'Hero — Description', 'value': 'Comprehensive water engineering services tailored to your needs.', 'field_type': 'richtext', 'display_order': 2},

            # Blog
            {'page': 'blog', 'key': 'hero_headline', 'label': 'Hero — Headline', 'value': 'Our Blog', 'field_type': 'text', 'display_order': 1},
            {'page': 'blog', 'key': 'hero_description', 'label': 'Hero — Description', 'value': 'Latest news and insights about water engineering and sustainability.', 'field_type': 'richtext', 'display_order': 2},
        ]

        for field_data in page_fields_data:
            PageField.objects.get_or_create(
                page=field_data['page'],
                key=field_data['key'],
                defaults={
                    'label': field_data['label'],
                    'value': field_data['value'],
                    'field_type': field_data['field_type'],
                    'display_order': field_data['display_order'],
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(page_fields_data)} page fields'))

        # Seed CoreValues
        core_values_data = [
            {'title': 'Reliability', 'description': 'Consistent and dependable service delivery', 'icon': '✓', 'display_order': 1},
            {'title': 'Innovation', 'description': 'Cutting-edge solutions for modern challenges', 'icon': '💡', 'display_order': 2},
            {'title': 'Sustainability', 'description': 'Environmentally responsible practices', 'icon': '🌱', 'display_order': 3},
            {'title': 'Quality', 'description': 'Excellence in every project we undertake', 'icon': '⭐', 'display_order': 4},
        ]

        for value_data in core_values_data:
            CoreValue.objects.get_or_create(
                title=value_data['title'],
                defaults={
                    'description': value_data['description'],
                    'icon': value_data['icon'],
                    'display_order': value_data['display_order'],
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(core_values_data)} core values'))

        # Seed TeamMembers
        team_members_data = [
            {'name': 'John Spencer', 'role_title': 'Managing Director', 'bio': 'Leading the company with over 20 years of experience in water engineering.', 'display_order': 1},
            {'name': 'Sarah Namukasa', 'role_title': 'Technical Director', 'bio': 'Expert in water treatment and distribution systems.', 'display_order': 2},
            {'name': 'David Kato', 'role_title': 'Operations Manager', 'bio': 'Ensuring smooth project execution and client satisfaction.', 'display_order': 3},
        ]

        for member_data in team_members_data:
            TeamMember.objects.get_or_create(
                name=member_data['name'],
                defaults={
                    'role_title': member_data['role_title'],
                    'bio': member_data['bio'],
                    'display_order': member_data['display_order'],
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(team_members_data)} team members'))

        self.stdout.write(self.style.SUCCESS('Page content seeding completed successfully'))
