from django.db import migrations


def add_about_hero_image_slots(apps, schema_editor):
    PageImage = apps.get_model('core_pages', 'PageImage')
    for key, label in (
        ('hero_image_1', 'Hero banner - background image 1'),
        ('hero_image_2', 'Hero banner - background image 2'),
        ('hero_image_3', 'Hero banner - background image 3'),
    ):
        PageImage.objects.get_or_create(
            page='about',
            key=key,
            defaults={'label': label, 'alt_text': ''},
        )


class Migration(migrations.Migration):
    dependencies = [('core_pages', '0006_pageimage_image_url')]

    operations = [migrations.RunPython(add_about_hero_image_slots, migrations.RunPython.noop)]
