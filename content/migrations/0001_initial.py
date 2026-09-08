from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name="WebsitePage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=160)),
                ("slug", models.SlugField(max_length=180, unique=True)),
                ("page_type", models.CharField(default="CUSTOM", max_length=30)),
                ("status", models.CharField(choices=[("DRAFT", "Draft"), ("REVIEW", "In review"), ("APPROVED", "Approved"), ("SCHEDULED", "Scheduled"), ("PUBLISHED", "Published"), ("ARCHIVED", "Archived")], default="DRAFT", max_length=20)),
                ("sections", models.JSONField(blank=True, default=list)),
                ("meta_title", models.CharField(blank=True, max_length=160)),
                ("meta_description", models.CharField(blank=True, max_length=320)),
                ("canonical_url", models.URLField(blank=True)),
                ("og_image", models.URLField(blank=True)),
                ("scheduled_for", models.DateTimeField(blank=True, null=True)),
                ("published_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["title"]},
        ),
        migrations.CreateModel(
            name="MediaAsset",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file", models.FileField(upload_to="website_media/%Y/%m/")),
                ("kind", models.CharField(choices=[("IMAGE", "Image"), ("VIDEO", "Video"), ("DOCUMENT", "Document")], default="IMAGE", max_length=12)),
                ("folder", models.CharField(blank=True, max_length=100)),
                ("alt_text", models.CharField(blank=True, max_length=200)),
                ("caption", models.CharField(blank=True, max_length=300)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("uploaded_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="ContentActivity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("action", models.CharField(max_length=100)),
                ("target", models.CharField(max_length=200)),
                ("detail", models.CharField(blank=True, max_length=500)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("actor", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
