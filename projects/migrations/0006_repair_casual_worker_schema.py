from django.db import migrations


class Migration(migrations.Migration):
    """Repair databases where the legacy casual-worker table predates migration 0004."""

    dependencies = [
        ("projects", "0005_remove_projectroleallocation_assigned_role_and_more"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE projects_casualworker
                    ADD COLUMN IF NOT EXISTS phone varchar(20) NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS id_number varchar(50) NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS hourly_rate numeric(10, 2) NOT NULL DEFAULT 0,
                    ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT NOW(),
                    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
                    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

                UPDATE projects_casualworker
                SET phone = phone_number
                WHERE phone = '' AND phone_number IS NOT NULL;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
