from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('services', '0004_add_all_service_page_fields')]

    operations = [
        migrations.RunSQL(
            "DROP TABLE IF EXISTS services_servicesection CASCADE;"
        ),
        migrations.CreateModel(
            name='ServiceSection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(help_text='Editor name, e.g. Installation process', max_length=120)),
                ('heading', models.CharField(blank=True, max_length=200)),
                ('content', models.TextField(blank=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='service_images/sections/')),
                ('image_url', models.URLField(blank=True)),
                ('alt_text', models.CharField(blank=True, max_length=200)),
                ('display_order', models.PositiveIntegerField(default=0)),
                ('is_enabled', models.BooleanField(default=True)),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sections', to='services.service')),
            ],
            options={'ordering': ['display_order', 'id'], 'unique_together': {('service', 'label')}},
        ),
    ]
