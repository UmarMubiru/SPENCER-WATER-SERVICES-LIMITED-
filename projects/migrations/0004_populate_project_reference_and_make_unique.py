from django.db import migrations, models


def populate_project_reference(apps, schema_editor):
    # Use raw SQL to avoid ORM UUID conversion issues during migration.
    conn = schema_editor.connection
    cursor = conn.cursor()
    cursor.execute('SELECT rowid, id, project_reference FROM projects_project')
    rows = cursor.fetchall()
    for row in rows:
        rowid, pk = row[0], row[1]
        # create a unique reference from pk (string-safe)
        key = str(pk)
        ref = f"PR-{key.replace('-', '')[:8]}"
        safe_ref = ref.replace("'", "''")
        sql = f"UPDATE projects_project SET project_reference = '{safe_ref}' WHERE rowid = {rowid}"
        cursor.execute(sql)


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0003_rename_end_date_project_actual_completion_date_and_more'),
    ]

    operations = [
        migrations.RunPython(populate_project_reference, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='project',
            name='project_reference',
            field=models.CharField(max_length=100, unique=True),
        ),
    ]
