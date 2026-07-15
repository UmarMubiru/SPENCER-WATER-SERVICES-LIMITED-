from django.core.management.base import BaseCommand
from roles.models import Permission
from roles.fixtures.permissions import PERMISSIONS

class Command(BaseCommand):
    help = 'Seed permissions into the database'

    def handle(self, *args, **kwargs):
        for code, module, desc in PERMISSIONS:
            Permission.objects.update_or_create(
                code=code,
                defaults={
                    "module": module,
                    "description": desc
                }
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(PERMISSIONS)} permissions"))
