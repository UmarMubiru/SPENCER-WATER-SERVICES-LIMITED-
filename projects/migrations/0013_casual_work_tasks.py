import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0012_casual_worker_piece_and_daily_rates'),
        ('users', '0006_userprofile_account_status_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='CasualWorkTask',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('arrangement', models.CharField(choices=[('individual', 'Individual'), ('group', 'Group')], default='individual', max_length=20)),
                ('payment_rule', models.CharField(choices=[('completion', 'Pay on approved completion'), ('progress', 'Pay for approved progress'), ('daily', 'Daily service')], default='progress', max_length=20)),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('target_quantity', models.DecimalField(decimal_places=2, default=1, max_digits=12)),
                ('unit', models.CharField(default='units', max_length=50)),
                ('status', models.CharField(choices=[('planned', 'Planned'), ('in_progress', 'In progress'), ('completed', 'Completed'), ('approved', 'Approved')], default='planned', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='casual_work_tasks', to='projects.project')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='CasualWorkAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('share_percentage', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('casual_worker', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='work_assignments', to='projects.casualworker')),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='projects.casualworktask')),
            ],
            options={'unique_together': {('task', 'casual_worker')}},
        ),
        migrations.CreateModel(
            name='CasualWorkProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('work_date', models.DateField(default=django.utils.timezone.localdate)),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=12)),
                ('notes', models.TextField(blank=True)),
                ('is_approved', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='users.userprofile')),
                ('assignment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='progress_entries', to='projects.casualworkassignment')),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='progress_entries', to='projects.casualworktask')),
            ],
            options={'ordering': ['-work_date', '-created_at']},
        ),
    ]
