from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from employees.models import Employee, Credential
from users.models import UserProfile
from roles.models import Role, Permission


class Command(BaseCommand):
    help = 'Setup administrator account with full permissions'

    def handle(self, *args, **options):
        # Get the employee record for MUBIRU UMAR
        try:
            employee = Employee.objects.get(full_name='MUBIRU UMAR')
        except Employee.DoesNotExist:
            self.stdout.write(self.style.ERROR('Employee MUBIRU UMAR not found'))
            return

        # Get or create the credential
        credential, created = Credential.objects.get_or_create(
            employee=employee,
            defaults={'status': 'approved'}
        )
        
        if created:
            credential.generate_username()
            credential.generate_temporary_password()
            credential.save()
            self.stdout.write(self.style.SUCCESS(f'Created credentials for {employee.full_name}'))
        else:
            credential.status = 'approved'
            credential.save()
            self.stdout.write(self.style.SUCCESS(f'Updated credential status to approved'))

        # Get or create the user
        user, created = User.objects.get_or_create(
            username=credential.username,
            defaults={'email': employee.email or ''}
        )
        
        user.set_password(credential.temporary_password)
        user.is_staff = True
        user.is_superuser = True
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created user: {user.username}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Updated user: {user.username}'))

        # Create or update profile using raw SQL with all columns
        from django.db import connection
        with connection.cursor() as cursor:
            # Delete any existing broken profiles for this user
            cursor.execute("DELETE FROM user_profiles WHERE user_id = %s", [user.id])
            
            # Insert a complete profile with all columns using default values
            cursor.execute("""
                INSERT INTO user_profiles 
                (user_id, account_status, is_administrator, must_change_password, custom_permissions, 
                 email_notifications, employee_changes, inventory_alerts, language, project_updates, 
                 push_notifications, theme, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, [user.id, 'active', True, False, '{}', False, False, False, 'en', False, False, 'light'])
            
            self.stdout.write(self.style.SUCCESS('Created user profile via raw SQL'))
        
        # Create or get Administrator role
        admin_role, created = Role.objects.get_or_create(
            name='Administrator',
            defaults={
                'description': 'Full system administrator with all permissions',
                'default_landing_path': '/admin/dashboard'
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created Administrator role'))
        
        # Assign all permissions to Administrator role
        all_permissions = Permission.objects.all()
        admin_role.permissions.set(all_permissions)
        admin_role.save()
        
        self.stdout.write(self.style.SUCCESS(f'Assigned {all_permissions.count()} permissions to Administrator role'))

        # Assign Administrator role to user using raw SQL (ensure only one role)
        with connection.cursor() as cursor:
            # First, remove any existing role assignment to prevent conflicts
            cursor.execute("""
                UPDATE user_profiles 
                SET role_id = NULL, updated_at = NOW()
                WHERE user_id = %s
            """, [user.id])
            
            # Then assign the Administrator role
            cursor.execute("""
                UPDATE user_profiles 
                SET role_id = %s, updated_at = NOW()
                WHERE user_id = %s
            """, [admin_role.id, user.id])
        
        self.stdout.write(self.style.SUCCESS('Assigned Administrator role to user via raw SQL (role conflict prevented)'))
        
        # Ensure employee has proper job title for role consistency
        # Create or get a default Administrator job title
        from employees.models import JobTitle
        admin_job_title, created = JobTitle.objects.get_or_create(
            title='Administrator',
            defaults={'description': 'System Administrator role'}
        )
        employee.job_title = admin_job_title
        employee.save()
        self.stdout.write(self.style.SUCCESS('Assigned Administrator job title to employee'))
        
        # Verify the assignment using raw SQL to avoid ORM issues
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT r.name 
                FROM user_profiles up
                LEFT JOIN roles_role r ON up.role_id = r.id
                WHERE up.user_id = %s
            """, [user.id])
            result = cursor.fetchone()
            if result and result[0]:
                self.stdout.write(self.style.SUCCESS(f'Verified: User has role {result[0]}'))
                
                # Get permission count
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM roles_role_permissions
                    WHERE role_id = (SELECT role_id FROM user_profiles WHERE user_id = %s)
                """, [user.id])
                perm_count = cursor.fetchone()[0]
                self.stdout.write(self.style.SUCCESS(f'Role has {perm_count} permissions'))
            else:
                self.stdout.write(self.style.ERROR('Role not found after assignment'))

        # Output credentials
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('ADMINISTRATOR CREDENTIALS'))
        self.stdout.write('='*50)
        self.stdout.write(f'Username: {credential.username}')
        self.stdout.write(f'Password: {credential.temporary_password}')
        self.stdout.write(f'Status: {credential.status}')
        self.stdout.write('='*50)
        self.stdout.write('\nPlease change your password after first login.')
