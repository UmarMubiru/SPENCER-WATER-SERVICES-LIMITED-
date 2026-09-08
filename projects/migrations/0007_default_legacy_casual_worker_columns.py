from django.db import migrations


class Migration(migrations.Migration):
    """Allow the current CasualWorker model to insert into legacy tables."""

    dependencies = [
        ("projects", "0006_repair_casual_worker_schema"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'projects_casualworker'
                          AND column_name = 'status'
                    ) THEN
                        ALTER TABLE projects_casualworker
                            ALTER COLUMN status SET DEFAULT 'available',
                            ALTER COLUMN daily_rate SET DEFAULT 0,
                            ALTER COLUMN is_archived SET DEFAULT false;
                    END IF;
                END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
