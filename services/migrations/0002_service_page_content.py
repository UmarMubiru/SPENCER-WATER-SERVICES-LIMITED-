from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('services', '0001_initial')]

    operations = [
        migrations.AddField(model_name='service', name='hero_alt_text', field=models.CharField(blank=True, max_length=200)),
        migrations.AddField(model_name='service', name='hero_description', field=models.TextField(blank=True)),
        migrations.AddField(model_name='service', name='hero_eyebrow', field=models.CharField(default='Water engineering service', max_length=120)),
        migrations.AddField(model_name='service', name='hero_image', field=models.ImageField(blank=True, null=True, upload_to='service_images/heroes/')),
        migrations.AddField(model_name='service', name='hero_image_url', field=models.URLField(blank=True)),
        migrations.AddField(model_name='service', name='hero_title', field=models.CharField(blank=True, max_length=200)),
        migrations.AddField(model_name='service', name='meta_description', field=models.CharField(blank=True, max_length=320)),
        migrations.AddField(model_name='service', name='meta_title', field=models.CharField(blank=True, max_length=160)),
        migrations.AddField(model_name='service', name='short_description', field=models.TextField(blank=True, help_text='Short summary shown on service cards')),
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
