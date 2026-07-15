from django.db import models
from PIL import Image
import os
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile


def upload_to(instance, filename):
    return f'website_images/{instance.page_type}/{instance.section_name}/{filename}'


def process_image(image, section_type):
    """Process image based on section type requirements"""
    img = Image.open(image)
    
    # Define image specifications per section type
    specs = {
        'HERO': {'max_width': 1920, 'max_height': 1080, 'quality': 85, 'format': 'JPEG'},
        'FEATURE': {'max_width': 800, 'max_height': 600, 'quality': 85, 'format': 'JPEG'},
        'BACKGROUND': {'max_width': 1920, 'max_height': 1200, 'quality': 80, 'format': 'JPEG'},
        'GALLERY': {'max_width': 1200, 'max_height': 800, 'quality': 85, 'format': 'JPEG'},
        'BANNER': {'max_width': 1600, 'max_height': 400, 'quality': 85, 'format': 'JPEG'},
        'THUMBNAIL': {'max_width': 400, 'max_height': 300, 'quality': 85, 'format': 'JPEG'},
        'TEAM': {'max_width': 300, 'max_height': 300, 'quality': 85, 'format': 'JPEG'},
        'VALUES': {'max_width': 600, 'max_height': 400, 'quality': 85, 'format': 'JPEG'},
        'SERVICE_ICON': {'max_width': 200, 'max_height': 200, 'quality': 85, 'format': 'JPEG'},
        'MAP': {'max_width': 1200, 'max_height': 600, 'quality': 85, 'format': 'JPEG'},
        'CONTACT_INFO': {'max_width': 800, 'max_height': 400, 'quality': 85, 'format': 'JPEG'},
    }
    
    spec = specs.get(section_type, specs['BACKGROUND'])
    
    # Convert to RGB if necessary (for JPEG compatibility)
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')
    
    # Resize while maintaining aspect ratio
    img.thumbnail((spec['max_width'], spec['max_height']), Image.Resampling.LANCZOS)
    
    # Save to memory
    output = BytesIO()
    img.save(output, format=spec['format'], quality=spec['quality'], optimize=True)
    output.seek(0)
    
    # Create new InMemoryUploadedFile
    ext = 'jpg' if spec['format'] == 'JPEG' else 'png'
    filename = f"processed_{os.path.splitext(image.name)[0]}.{ext}"
    
    return InMemoryUploadedFile(
        output,
        'ImageField',
        filename,
        f'image/{spec["format"].lower()}',
        output.getbuffer().nbytes,
        None
    )


class CorePage(models.Model):
    class PageType(models.TextChoices):
        HOME = "HOME", "Home"
        ABOUT_US = "ABOUT_US", "About Us"
        SERVICES = "SERVICES", "Services"
        CONTACT = "CONTACT", "Contact"
        PROJECTS = "PROJECTS", "Projects"
        BLOG = "BLOG", "Blog"
        QUOTATIONS = "QUOTATIONS", "Quotations"

    class SectionType(models.TextChoices):
        HERO = "HERO", "Hero Section"
        FEATURE = "FEATURE", "Feature Section"
        BACKGROUND = "BACKGROUND", "Background"
        GALLERY = "GALLERY", "Gallery"
        BANNER = "BANNER", "Banner"
        THUMBNAIL = "THUMBNAIL", "Thumbnail"
        TEAM = "TEAM", "Team Section"
        VALUES = "VALUES", "Values Section"
        SERVICE_ICON = "SERVICE_ICON", "Service Icon"
        MAP = "MAP", "Map Section"
        CONTACT_INFO = "CONTACT_INFO", "Contact Info"

    page_type = models.CharField(max_length=20, choices=PageType.choices)
    section_name = models.CharField(max_length=100)
    section_type = models.CharField(max_length=20, choices=SectionType.choices, default=SectionType.BACKGROUND)
    section_order = models.IntegerField(default=0)
    content = models.TextField(blank=True, help_text="Optional text content for this section")
    image = models.ImageField(upload_to=upload_to, blank=True, null=True, help_text="Upload image for this section")
    image_url = models.URLField(blank=True, null=True, help_text="Alternative: use external image URL")
    alt_text = models.CharField(max_length=200, blank=True, help_text="Alt text for accessibility")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['page_type', 'section_order']
        verbose_name = "Core Page"
        verbose_name_plural = "Core Pages"
        unique_together = ['page_type', 'section_name']

    def __str__(self):
        return f"{self.get_page_type_display()} - {self.section_name} ({self.get_section_type_display()})"
    
    @property
    def image_source(self):
        return self.image.url if self.image else self.image_url
    
    def save(self, *args, **kwargs):
        # Process image before saving
        if self.image:
            self.image = process_image(self.image, self.section_type)
        super().save(*args, **kwargs)
