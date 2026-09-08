from django.db import models
from PIL import Image
import os
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings


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


# ── Generic Page-Driven Content Management ─────────────────────────────────

class PageField(models.Model):
    """Every piece of editable text on the site — headlines, descriptions, contact details."""
    FIELD_TYPE_CHOICES = [
        ('text', 'Short Text'),
        ('richtext', 'Paragraph'),
    ]

    page = models.CharField(max_length=100, help_text='Page identifier (e.g., home, about, service-water-treatment)')
    key = models.CharField(max_length=100, help_text='e.g. hero_headline, phone, business_hours')
    label = models.CharField(max_length=150, help_text='Human-readable label shown to admin')
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES, default='text')
    value = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('page', 'key')
        ordering = ['page', 'display_order']
        verbose_name = "Page Field"
        verbose_name_plural = "Page Fields"

    def __str__(self):
        return f"{self.page} - {self.label}"


class PageImage(models.Model):
    """Every image placeholder on the site."""

    page = models.CharField(max_length=100, help_text='Page identifier (e.g., home, about, service-water-treatment)')
    key = models.CharField(max_length=100, help_text='e.g. hero_background, company_image')
    label = models.CharField(max_length=150, help_text='Human-readable label shown to admin')
    image = models.ImageField(upload_to='website_images/', null=True, blank=True)
    image_url = models.URLField(blank=True, null=True, help_text='External image URL as alternative to upload')
    alt_text = models.CharField(max_length=200, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('page', 'key')
        verbose_name = "Page Image"
        verbose_name_plural = "Page Images"

    def __str__(self):
        return f"{self.page} - {self.label}"

    @property
    def image_source(self):
        return self.image.url if self.image else self.image_url


class CoreValue(models.Model):
    """Core values for About page - repeatable card content."""
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=10, blank=True, help_text='Emoji or icon identifier')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = "Core Value"
        verbose_name_plural = "Core Values"

    def __str__(self):
        return self.title


class TeamMember(models.Model):
    """Team members for About page - repeatable card content."""
    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='team_member_profile',
        help_text="Link to existing employee (optional). If set, will use employee's photo and basic info."
    )
    name = models.CharField(max_length=150, help_text="Override employee name if needed")
    role_title = models.CharField(max_length=150, help_text="Override employee role for website display")
    bio = models.TextField(blank=True, help_text="Professional bio for website")
    photo = models.ImageField(upload_to='team_photos/', null=True, blank=True, help_text="Override employee photo if needed")
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order']
        verbose_name = "Team Member"
        verbose_name_plural = "Team Members"

    def __str__(self):
        return f"{self.name} - {self.role_title}"

    @property
    def display_name(self):
        """Use employee name if available and no override, otherwise use name field"""
        if self.employee and not self.name:
            return self.employee.full_name
        return self.name

    @property
    def display_photo(self):
        """Use employee photo if available and no override, otherwise use photo field"""
        if self.employee and not self.photo:
            return self.employee.photo
        return self.photo
