from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("inventory", "0001_initial")]

    operations = [
        migrations.AlterField(
            model_name="salesquotation",
            name="status",
            field=models.CharField(
                choices=[
                    ("DRAFT", "Draft"),
                    ("SENT", "Sent"),
                    ("ACCEPTED", "Accepted"),
                    ("REJECTED", "Rejected"),
                    ("EXPIRED", "Expired"),
                ],
                default="DRAFT",
                max_length=16,
            ),
        ),
    ]
