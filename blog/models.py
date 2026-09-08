from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()


class BlogCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Blog Category"
        verbose_name_plural = "Blog Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Blog Tag"
        verbose_name_plural = "Blog Tags"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogPost(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"
        ARCHIVED = "ARCHIVED", "Archived"

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200)
    excerpt = models.TextField(help_text="Short summary for card previews")
    content = models.TextField()
    featured_image = models.URLField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='blog_posts')
    category = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    tags = models.ManyToManyField(BlogTag, blank=True, related_name='posts')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField(default=False)
    meta_description = models.TextField(blank=True, null=True, help_text="SEO meta description")
    meta_keywords = models.CharField(max_length=255, blank=True, null=True, help_text="SEO keywords (comma-separated)")
    reading_time = models.IntegerField(default=0, help_text="Estimated reading time in minutes")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)

        # Calculate reading time (average 200 words per minute)
        if self.content and not self.reading_time:
            word_count = len(self.content.split())
            self.reading_time = max(1, round(word_count / 200))

        super().save(*args, **kwargs)
