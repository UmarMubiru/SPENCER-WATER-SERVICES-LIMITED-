from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('services', '0002_service_page_content')]

    operations = [
        migrations.AddField(
            model_name='service',
            name='short_description',
            field=models.TextField(blank=True, help_text='Short summary shown on service cards'),
        ),
    ]
