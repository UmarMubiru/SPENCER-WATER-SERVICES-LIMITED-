from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('reports', '0003_create_missing_tables'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemactivity',
            name='action_type',
            field=models.CharField(db_index=True, default='updated', max_length=30),
        ),
    ]
