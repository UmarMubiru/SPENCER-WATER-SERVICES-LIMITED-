from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('employees', '0022_department_description_employee_archived_at_and_more')]
    operations = [
        migrations.AlterField(
            model_name='employee',
            name='status',
            field=models.CharField(choices=[('available', 'Available'), ('assigned', 'Assigned'), ('suspended', 'Suspended'), ('on_leave', 'On Leave'), ('contract_expired', 'Contract Expired'), ('deceased', 'Deceased')], default='available', max_length=25),
        ),
    ]
