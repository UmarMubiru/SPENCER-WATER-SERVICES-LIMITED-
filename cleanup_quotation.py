import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core_pages.models import PageField, PageImage

# Keep only these Quotation page fields
quotation_fields_to_keep = [
    'hero_headline',
    'hero_subheadline', 
    'form_intro',
]

# Keep only these Quotation page images  
quotation_images_to_keep = [
    'hero_background',
]

# Delete unwanted Quotation page fields
deleted_fields = PageField.objects.filter(page='quotation').exclude(key__in=quotation_fields_to_keep)
field_count = deleted_fields.count()
deleted_fields.delete()

# Delete unwanted Quotation page images
deleted_images = PageImage.objects.filter(page='quotation').exclude(key__in=quotation_images_to_keep)
image_count = deleted_images.count()
deleted_images.delete()

print(f'Successfully cleaned up Quotation page: deleted {field_count} text fields and {image_count} images')
