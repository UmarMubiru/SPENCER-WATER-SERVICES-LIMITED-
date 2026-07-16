# Generated manually for the invitation workflow.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('roles', '0001_initial'),
        ('users', '0003_alter_userprofile_role'),
    ]

    operations = [
        migrations.CreateModel(
            name='Invitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('full_name', models.CharField(max_length=150)),
                ('phone_number', models.CharField(blank=True, max_length=20)),
                ('token', models.CharField(max_length=128, unique=True)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('ACCEPTED', 'Accepted'), ('EXPIRED', 'Expired'), ('REVOKED', 'Revoked')], default='PENDING', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
                ('accepted_at', models.DateTimeField(blank=True, null=True)),
                ('invited_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='invitations_sent', to='users.userprofile')),
                ('role', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='invitations', to='roles.role')),
            ],
        ),
    ]
