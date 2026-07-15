from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Testimonial(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    customer_name = models.CharField(max_length=150)
    company_name = models.CharField(max_length=150, blank=True)
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)], default=5)
    content = models.TextField()
    project_reference = models.CharField(max_length=200, blank=True, help_text="Related project name")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_testimonials')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Testimonial"
        verbose_name_plural = "Testimonials"

    def __str__(self):
        return f"{self.customer_name} - {self.rating} stars"
