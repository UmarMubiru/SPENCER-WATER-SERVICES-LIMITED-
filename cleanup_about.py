import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core_pages.models import PageField, PageImage

# Keep only these About page fields
about_fields_to_keep = [
    'hero_eyebrow',
    'hero_headline', 
    'hero_subheadline',
    'company_overview_title',
    'company_overview',
    'mission_eyebrow',
    'mission_title',
    'mission',
    'vision_title',
    'vision',
    'values_heading',
    'team_section_title',
    'team_section_description',
]

# Keep only these About page images  
about_images_to_keep = [
    'hero_image_1',
    'hero_image_2',
    'hero_image_3',
    'company_image',
    'mission_image',
]

# Delete unwanted About page fields
deleted_fields = PageField.objects.filter(page='about').exclude(key__in=about_fields_to_keep)
field_count = deleted_fields.count()
deleted_fields.delete()

# Delete unwanted About page images
deleted_images = PageImage.objects.filter(page='about').exclude(key__in=about_images_to_keep)
image_count = deleted_images.count()
deleted_images.delete()

print(f'Successfully cleaned up About page: deleted {field_count} text fields and {image_count} images')
