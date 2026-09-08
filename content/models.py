from django.conf import settings
from django.db import models


class WebsitePage(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        REVIEW = "REVIEW", "In review"
        APPROVED = "APPROVED", "Approved"
        SCHEDULED = "SCHEDULED", "Scheduled"
        PUBLISHED = "PUBLISHED", "Published"
        ARCHIVED = "ARCHIVED", "Archived"

    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    page_type = models.CharField(max_length=30, default="CUSTOM")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    sections = models.JSONField(default=list, blank=True)
    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)
    canonical_url = models.URLField(blank=True)
    og_image = models.URLField(blank=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class MediaFolder(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        ordering = ["name"]
        verbose_name = "Media Folder"
        verbose_name_plural = "Media Folders"

    def __str__(self):
        return self.name


class MediaAsset(models.Model):
    class Kind(models.TextChoices):
        IMAGE = "IMAGE", "Image"
        VIDEO = "VIDEO", "Video"
        DOCUMENT = "DOCUMENT", "Document"

    file = models.FileField(upload_to="website_media/%Y/%m/")
    kind = models.CharField(max_length=12, choices=Kind.choices, default=Kind.IMAGE)
    folder = models.CharField(max_length=100, blank=True)
    alt_text = models.CharField(max_length=200, blank=True)
    caption = models.CharField(max_length=300, blank=True)
    project = models.ForeignKey("projects.Project", null=True, blank=True, on_delete=models.SET_NULL, related_name="media_assets")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.file.name


class ContentActivity(models.Model):
    action = models.CharField(max_length=100)
    target = models.CharField(max_length=200)
    detail = models.CharField(max_length=500, blank=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action}: {self.target}"
