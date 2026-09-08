import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core_pages.models import PageField, PageImage

# Keep only these home page fields
home_fields_to_keep = ['hero_eyebrow', 'hero_headline', 'hero_description', 'featured_projects_heading', 'testimonials_heading']

# Keep only these home page images  
home_images_to_keep = ['hero_image_1', 'hero_image_2', 'hero_image_3', 'hero_background']

# Delete unwanted home page fields
deleted_fields = PageField.objects.filter(page='home').exclude(key__in=home_fields_to_keep)
field_count = deleted_fields.count()
deleted_fields.delete()

# Delete unwanted home page images
deleted_images = PageImage.objects.filter(page='home').exclude(key__in=home_images_to_keep)
image_count = deleted_images.count()
deleted_images.delete()

print(f'Successfully cleaned up home page: deleted {field_count} text fields and {image_count} images')
