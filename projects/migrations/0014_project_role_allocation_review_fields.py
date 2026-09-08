import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('projects', '0013_casual_work_tasks')]
    operations = [
        migrations.AddField(model_name='projectroleallocation', name='reviewed_at', field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name='projectroleallocation', name='reviewed_by', field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reviewed_project_allocations', to='users.userprofile')),
    ]
