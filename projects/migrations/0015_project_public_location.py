from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('projects', '0014_project_role_allocation_review_fields')]

    operations = [
        migrations.AddField(model_name='project', name='latitude', field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
        migrations.AddField(model_name='project', name='longitude', field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
    ]
