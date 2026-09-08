from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("inventory", "0006_category_is_active")]

    operations = [
        migrations.CreateModel(
            name="PurchaseNumberSequence",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date", models.DateField(unique=True)),
                ("last_number", models.PositiveIntegerField(default=0)),
            ],
        ),
    ]
