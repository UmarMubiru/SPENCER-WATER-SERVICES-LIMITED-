from django.db import migrations


def create_attendance_table_if_missing(apps, schema_editor):
    table_name = "projects_casualworkerattendance"
    if table_name not in schema_editor.connection.introspection.table_names():
        CasualWorkerAttendance = apps.get_model("projects", "CasualWorkerAttendance")
        schema_editor.create_model(CasualWorkerAttendance)


class Migration(migrations.Migration):
    """Restore the attendance table on databases with incomplete project migrations."""

    dependencies = [
        ("projects", "0007_default_legacy_casual_worker_columns"),
    ]

    operations = [
        migrations.RunPython(create_attendance_table_if_missing, migrations.RunPython.noop),
    ]
