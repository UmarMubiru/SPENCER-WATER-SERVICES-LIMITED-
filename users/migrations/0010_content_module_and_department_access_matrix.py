from django.db import migrations, models


ACCESS_MATRIX = {
    'human_resource': {
        'dashboard': 'view', 'employees': 'full', 'crm': 'full',
        'content': 'full', 'reports': 'view',
    },
    'project management': {
        'dashboard': 'view', 'projects': 'full', 'content': 'full',
        'reports': 'view',
    },
    'technical': {
        'dashboard': 'view', 'content': 'full', 'reports': 'view',
    },
}


def apply_access_matrix(apps, schema_editor):
    ModulePermission = apps.get_model('users', 'ModulePermission')
    for department, permissions in ACCESS_MATRIX.items():
        ModulePermission.objects.filter(role=department, job_title__isnull=True).delete()
        for module, permission in permissions.items():
            ModulePermission.objects.create(
                role=department, module=module, permission=permission,
            )

    ModulePermission.objects.update_or_create(
        role='technical', module='inventory', job_title='Inventory Manager',
        defaults={'permission': 'full'},
    )


def reverse_access_matrix(apps, schema_editor):
    # Permission policy is business configuration; do not restore superseded rows.
    pass


class Migration(migrations.Migration):
    dependencies = [('users', '0009_userprofile_job_title')]

    operations = [
        migrations.AlterField(
            model_name='modulepermission',
            name='module',
            field=models.CharField(
                choices=[
                    ('dashboard', 'Dashboard'), ('leads', 'Leads'), ('crm', 'CRM'),
                    ('quotations', 'Quotations'), ('projects', 'Projects'),
                    ('tenders', 'Tenders'), ('inventory', 'Inventory'),
                    ('employees', 'Employees'), ('users', 'Users'), ('reports', 'Reports'),
                    ('content', 'Content Management'), ('settings', 'Settings'),
                ],
                max_length=50,
            ),
        ),
        migrations.RunPython(apply_access_matrix, reverse_access_matrix),
    ]
