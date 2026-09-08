from django.db import migrations


class Migration(migrations.Migration):
    """Repair databases whose migration history was recorded before the
    Material Request number-sequence table was physically created."""

    dependencies = [
        ("inventory", "0012_category_is_archived_inventoryitem_inventory_type_and_more"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                CREATE TABLE IF NOT EXISTS inventory_requestnumbersequence (
                    id BIGSERIAL PRIMARY KEY,
                    date DATE NOT NULL UNIQUE,
                    last_number INTEGER NOT NULL DEFAULT 0
                );
            """,
            reverse_sql="DROP TABLE IF EXISTS inventory_requestnumbersequence;",
        ),
    ]
