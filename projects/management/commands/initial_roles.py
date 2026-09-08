from django.core.management.base import BaseCommand
from projects.models import ProjectRole


class Command(BaseCommand):
    help = 'Seed initial project roles'

    def handle(self, *args, **options):
        roles = [
            {'name': 'Clerk of Works', 'description': 'Project clerk of works responsible for overall project coordination'},
            {'name': 'Site Engineer', 'description': 'Site engineer responsible for technical operations and supervision'},
        ]

        for role_data in roles:
            role, created = ProjectRole.objects.get_or_create(
                name=role_data['name'],
                defaults={'description': role_data['description']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role: {role.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Role already exists: {role.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Role already exists: {role.name}'))

        self.stdout.write(self.style.SUCCESS('Initial roles seeded successfully'))
