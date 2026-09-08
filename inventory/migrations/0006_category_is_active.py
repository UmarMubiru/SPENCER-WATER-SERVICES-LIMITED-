from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("inventory", "0005_remove_materialrequest_project_and_more")]

    operations = [
        migrations.AddField(model_name="category", name="is_active", field=models.BooleanField(default=True)),
    ]
