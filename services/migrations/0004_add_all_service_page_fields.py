from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('services', '0003_add_missing_service_fields')]

    operations = [
        migrations.AddField(
            model_name='service',
            name='hero_eyebrow',
            field=models.CharField(default='Water engineering service', max_length=120),
        ),
        migrations.AddField(
            model_name='service',
            name='hero_title',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='service',
            name='hero_description',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='service',
            name='hero_image',
            field=models.ImageField(blank=True, null=True, upload_to='service_images/heroes/'),
        ),
        migrations.AddField(
            model_name='service',
            name='hero_image_url',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='service',
            name='hero_alt_text',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='service',
            name='meta_title',
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name='service',
            name='meta_description',
            field=models.CharField(blank=True, max_length=320),
        ),
    ]
