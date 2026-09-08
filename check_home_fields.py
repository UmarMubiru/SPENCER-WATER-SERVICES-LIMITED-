import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core_pages.models import PageField, PageImage

print("=== HOME PAGE FIELDS ===")
home_fields = PageField.objects.filter(page='home').order_by('key')
print(f"Total home fields: {home_fields.count()}")
for field in home_fields:
    print(f"  {field.key} - {field.label}")

print("\n=== HOME PAGE IMAGES ===")
home_images = PageImage.objects.filter(page='home').order_by('key')
print(f"Total home images: {home_images.count()}")
for image in home_images:
    print(f"  {image.key} - {image.label}")
