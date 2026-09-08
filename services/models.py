from django.db import models
from content.models import MediaAsset


class Service(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200)
    description = models.TextField()
    short_description = models.TextField(blank=True, help_text="Short summary shown on service cards")
    icon = models.CharField(max_length=50, blank=True, help_text="Emoji or icon identifier")
    hero_eyebrow = models.CharField(max_length=120, default="Water engineering service")
    hero_title = models.CharField(max_length=200, blank=True)
    hero_description = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to='service_images/heroes/', null=True, blank=True)
    hero_image_url = models.URLField(blank=True)
    hero_alt_text = models.CharField(max_length=200, blank=True)
    hero_image_2 = models.ImageField(upload_to='service_images/heroes/', null=True, blank=True)
    hero_image_url_2 = models.URLField(blank=True)
    hero_alt_text_2 = models.CharField(max_length=200, blank=True)
    hero_image_3 = models.ImageField(upload_to='service_images/heroes/', null=True, blank=True)
    hero_image_url_3 = models.URLField(blank=True)
    hero_alt_text_3 = models.CharField(max_length=200, blank=True)
    gallery_images = models.ManyToManyField(MediaAsset, blank=True, related_name='services', help_text="Images to display in the service gallery")
    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name = "Service"
        verbose_name_plural = "Services"

    def __str__(self):
        return self.name

    @property
    def hero_image_source(self):
        return self.hero_image.url if self.hero_image else self.hero_image_url

    @property
    def hero_image_source_2(self):
        return self.hero_image_2.url if self.hero_image_2 else self.hero_image_url_2

    @property
    def hero_image_source_3(self):
        return self.hero_image_3.url if self.hero_image_3 else self.hero_image_url_3


class ServiceSection(models.Model):
    """An editor-friendly block that appears on one service's public page."""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='sections')
    label = models.CharField(max_length=120, help_text="Editor name, e.g. Installation process")
    heading = models.CharField(max_length=200, blank=True)
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to='service_images/sections/', null=True, blank=True)
    image_url = models.URLField(blank=True)
    alt_text = models.CharField(max_length=200, blank=True)
    image_2 = models.ImageField(upload_to='service_images/sections/', null=True, blank=True)
    image_url_2 = models.URLField(blank=True)
    alt_text_2 = models.CharField(max_length=200, blank=True)
    image_3 = models.ImageField(upload_to='service_images/sections/', null=True, blank=True)
    image_url_3 = models.URLField(blank=True)
    alt_text_3 = models.CharField(max_length=200, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'id']
        unique_together = ['service', 'label']

    def __str__(self):
        return f"{self.service.name}: {self.label}"

    @property
    def image_source(self):
        return self.image.url if self.image else self.image_url

    @property
    def image_source_2(self):
        return self.image_2.url if self.image_2 else self.image_url_2

    @property
    def image_source_3(self):
        return self.image_3.url if self.image_3 else self.image_url_3


class ServiceFAQ(models.Model):
    """Frequently asked questions for a service."""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=300)
    answer = models.TextField()
    display_order = models.PositiveIntegerField(default=0)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'id']
        verbose_name = "Service FAQ"
        verbose_name_plural = "Service FAQs"

    def __str__(self):
        return f"{self.service.name}: {self.question}"
