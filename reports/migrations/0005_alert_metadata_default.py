from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('reports', '0004_systemactivity_action_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='alert',
            name='metadata',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
