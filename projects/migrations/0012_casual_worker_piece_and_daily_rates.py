from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0011_project_archived_at_project_archived_by_and_more'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE projects_casualworker
                            ADD COLUMN IF NOT EXISTS next_of_kin varchar(200) NOT NULL DEFAULT '',
                            ADD COLUMN IF NOT EXISTS payment_type varchar(20) NOT NULL DEFAULT 'daily_rate',
                            ADD COLUMN IF NOT EXISTS piece_rate numeric(10, 2) NOT NULL DEFAULT 0,
                            ADD COLUMN IF NOT EXISTS daily_rate numeric(10, 2) NOT NULL DEFAULT 0;
                        ALTER TABLE projects_casualworkerattendance
                            ADD COLUMN IF NOT EXISTS pieces_completed numeric(10, 2) NOT NULL DEFAULT 0;
                        UPDATE projects_casualworker
                        SET daily_rate = hourly_rate
                        WHERE daily_rate = 0;
                    """,
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='casualworker',
                    name='next_of_kin',
                    field=models.CharField(blank=True, max_length=200),
                ),
                migrations.AddField(
                    model_name='casualworker',
                    name='payment_type',
                    field=models.CharField(choices=[('piece_rate', 'Piece rate'), ('daily_rate', 'Daily rate')], default='daily_rate', max_length=20),
                ),
                migrations.AddField(
                    model_name='casualworker',
                    name='piece_rate',
                    field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                migrations.AddField(
                    model_name='casualworker',
                    name='daily_rate',
                    field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                migrations.AddField(
                    model_name='casualworkerattendance',
                    name='pieces_completed',
                    field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
            ],
        ),
    ]
