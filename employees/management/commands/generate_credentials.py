from django.core.management.base import BaseCommand
from employees.models import Employee, Credential


class Command(BaseCommand):
    help = 'Generate credentials for all existing employees who don\'t have them'

    def handle(self, *args, **options):
        employees_without_credentials = Employee.objects.filter(credential__isnull=True)
        count = 0

        for employee in employees_without_credentials:
            try:
                Credential.objects.create(employee=employee)
                count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created credentials for {employee.full_name}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to create credentials for {employee.full_name}: {e}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully generated credentials for {count} employees')
        )
