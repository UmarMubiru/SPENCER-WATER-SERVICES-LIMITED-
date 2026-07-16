from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class PortfolioProject(models.Model):
    class Status(models.TextChoices):
        COMPLETED = "COMPLETED", "Completed"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        ON_HOLD = "ON_HOLD", "On Hold"

    class ProjectType(models.TextChoices):
        RESIDENTIAL = "RESIDENTIAL", "Residential"
        COMMERCIAL = "COMMERCIAL", "Commercial"
        INDUSTRIAL = "INDUSTRIAL", "Industrial"
        GOVERNMENT = "GOVERNMENT", "Government"

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200)
    description = models.TextField()
    client_name = models.CharField(max_length=150)
    location = models.CharField(max_length=200)
    project_type = models.CharField(max_length=30, choices=ProjectType.choices)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.COMPLETED)
    completion_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    cover_image = models.URLField()
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Portfolio Project"
        verbose_name_plural = "Portfolio Projects"

    def __str__(self):
        return self.title


class PortfolioImage(models.Model):
    project = models.ForeignKey(PortfolioProject, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()
    caption = models.CharField(max_length=200, blank=True)
    is_cover = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = "Portfolio Image"
        verbose_name_plural = "Portfolio Images"

    def __str__(self):
        return f"{self.project.title} - Image {self.order}"
