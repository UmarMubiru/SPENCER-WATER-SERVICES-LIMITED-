from django.db import migrations


def repair_role_allocation_table(apps, schema_editor):
    model = apps.get_model("projects", "ProjectRoleAllocation")
    table_name = model._meta.db_table
    columns = {
        column.name
        for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), table_name
        )
    }

    for field_name in ("job_title", "is_active"):
        field = model._meta.get_field(field_name)
        if field.column not in columns:
            schema_editor.add_field(model, field)

    if "status" in columns:
        schema_editor.execute(
            "ALTER TABLE projects_projectroleallocation "
            "ALTER COLUMN status SET DEFAULT 'assigned'"
        )


class Migration(migrations.Migration):
    """Restore fields absent from legacy project role-allocation tables."""

    dependencies = [
        ("projects", "0008_repair_casual_worker_attendance_table"),
    ]

    operations = [
        migrations.RunPython(repair_role_allocation_table, migrations.RunPython.noop),
    ]
