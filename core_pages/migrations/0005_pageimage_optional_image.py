from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('core_pages', '0004_corevalue_teammember_pagefield_pageimage')]

    operations = [
        migrations.AlterField(
            model_name='pageimage', name='image',
            field=models.ImageField(blank=True, null=True, upload_to='website_images/'),
        ),
    ]
