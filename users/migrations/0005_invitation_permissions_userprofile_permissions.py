from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('roles', '0001_initial'),
        ('users', '0004_invitation'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile', name='permissions',
            field=models.ManyToManyField(blank=True, related_name='assigned_users', to='roles.permission'),
        ),
        migrations.AddField(
            model_name='invitation', name='permissions',
            field=models.ManyToManyField(blank=True, related_name='invitations', to='roles.permission'),
        ),
    ]
