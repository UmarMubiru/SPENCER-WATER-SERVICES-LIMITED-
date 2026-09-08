from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q, Sum
from datetime import timedelta, date
from core.mixins import AuditLogMixin
from .models import (
    Department, JobTitle, EmploymentType, Employee, ContractDocument,
    EmployeeDocument, EmployeeHistory, Attendance, Credential, Skill, EmployeeSkill, ProjectAssignment
)
from .serializers import (
    DepartmentSerializer, JobTitleSerializer, EmploymentTypeSerializer,
    EmployeeListSerializer, EmployeeDetailSerializer, EmployeeSerializer,
    ContractDocumentSerializer,
    EmployeeDocumentSerializer, EmployeeHistorySerializer, AttendanceSerializer,
    CredentialSerializer, SkillSerializer, EmployeeSkillSerializer, ProjectAssignmentSerializer
)


class DashboardViewSet(viewsets.ViewSet):
    def list(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        total_full_time = Employee.objects.filter(employee_type='full_time').count()
        total_part_time = Employee.objects.filter(employee_type='part_time').count()
        total_employees = total_full_time + total_part_time

        active_full_time = Employee.objects.filter(employee_type='full_time', status='active_not_assigned').count()
        active_part_time = Employee.objects.filter(employee_type='part_time', status='active_assigned').count()
        active_employees = active_full_time + active_part_time

        assigned_part_time = Employee.objects.filter(employee_type='part_time', status='active_assigned').count()

        not_active = Employee.objects.filter(status='not_active').count()

        new_this_month = Employee.objects.filter(created_at__gte=thirty_days_ago).count()

        department_distribution = list(
            Employee.objects.values('department__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        recent_activities = list(
            EmployeeHistory.objects.filter(timestamp__gte=thirty_days_ago)
            .order_by('-timestamp')[:10]
            .values('action', 'description', 'timestamp', 'employee__full_name')
        )

        return Response({
            'total_employees': total_employees,
            'total_full_time': total_full_time,
            'total_part_time': total_part_time,
            'active_employees': active_employees,
            'assigned_part_time': assigned_part_time,
            'not_active': not_active,
            'contracts_expiring_soon': 0,
            'contracts_expired': 0,
            'new_this_month': new_this_month,
            'department_distribution': department_distribution,
            'recent_activities': recent_activities
        })

    @action(detail=False, methods=['get'])
    def full_time(self, request):
        """Get list of full-time employees"""
        employees = Employee.objects.filter(employee_type='full_time')
        serializer = EmployeeListSerializer(employees, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def part_time(self, request):
        """Get list of part-time employees"""
        employees = Employee.objects.filter(employee_type='part_time')
        serializer = EmployeeListSerializer(employees, many=True)
        return Response(serializer.data)


class EmployeeViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.AllowAny]
    audit_log_module = 'HR'
    audit_log_record_name_field = 'full_name'

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        employee_id = response.data.get('id')
        if employee_id:
            try:
                employee = Employee.objects.get(id=employee_id)
                Credential.objects.create(employee=employee)

                from reports.audit import log_activity
                log_activity(
                    module='employment',
                    action='Employee Registered',
                    entity_type='Employee',
                    entity_id=employee.id,
                    reference_number=employee.employee_number or '',
                    action_type='created',
                    description=f'Employee registered: {employee.full_name}',
                    performed_by=request.user if request.user.is_authenticated else None,
                    new_data={'full_name': employee.full_name, 'employee_type': employee.employee_type},
                    request=request,
                )
            except Exception as e:
                print(f"Error creating credentials: {e}")
        return response

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_data = {
            'full_name': old_instance.full_name,
            'status': old_instance.status,
            'employee_type': old_instance.employee_type,
        }
        super().perform_update(serializer)
        new_instance = self.get_object()
        new_data = {
            'full_name': new_instance.full_name,
            'status': new_instance.status,
            'employee_type': new_instance.employee_type,
        }

        if old_data['status'] != new_data['status']:
            from reports.audit import log_activity
            log_activity(
                module='employment',
                action='Employee Status Changed',
                entity_type='Employee',
                entity_id=new_instance.id,
                reference_number=new_instance.employee_number or '',
                action_type='updated',
                description=f'Employee status changed: {new_instance.full_name} from {old_data["status"]} to {new_data["status"]}',
                performed_by=self.request.user if self.request.user.is_authenticated else None,
                old_data={'status': old_data['status']},
                new_data={'status': new_data['status']},
                request=self.request,
            )

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        elif self.action == 'retrieve':
            return EmployeeDetailSerializer
        return EmployeeSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_type = self.request.query_params.get('type', None)
        employee_status = self.request.query_params.get('status', None)
        show_archived = self.request.query_params.get('show_archived', 'false').lower() == 'true'

        # Don't filter by archived status for detail actions (archive, unarchive, etc.)
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'archive', 'unarchive']:
            pass  # Don't apply archived filter for detail actions
        elif show_archived:
            queryset = queryset.filter(is_archived=True)
        else:
            queryset = queryset.filter(is_archived=False)

        if employee_type:
            queryset = queryset.filter(employee_type=employee_type)
        if employee_status:
            queryset = queryset.filter(status=employee_status)
        return queryset

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        employee = self.get_object()
        new_status = request.data.get('status')
        reason = request.data.get('reason', '')
        valid_statuses = {value for value, _ in Employee.STATUS_CHOICES}
        if new_status not in valid_statuses:
            return Response({'error': 'Select a valid employment status.'}, status=status.HTTP_400_BAD_REQUEST)
        old_status = employee.status
        employee.status = new_status
        employee.save(update_fields=['status'])
        EmployeeHistory.objects.create(
            employee=employee,
            action='status_changed',
            description=reason or f'Employment status changed from {old_status} to {new_status}.',
            previous_value=old_status,
            new_value=new_status,
            performed_by=request.user.get_username() if request.user.is_authenticated else 'Manager',
        )
        return Response(EmployeeDetailSerializer(employee).data)

    @action(detail=False, methods=['get'])
    def full_time(self, request):
        queryset = self.get_queryset().filter(employee_type='full_time')
        show_archived = request.query_params.get('show_archived', 'false').lower() == 'true'
        print(f"full_time endpoint called with show_archived={show_archived}")
        print(f"Total full_time employees before filter: {queryset.count()}")
        if show_archived:
            queryset = queryset.filter(is_archived=True)
        else:
            queryset = queryset.filter(is_archived=False)
        print(f"Full-time employees after filter: {queryset.count()}")
        serializer = EmployeeListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def part_time(self, request):
        queryset = self.get_queryset().filter(employee_type='part_time')
        show_archived = request.query_params.get('show_archived', 'false').lower() == 'true'
        print(f"part_time endpoint called with show_archived={show_archived}")
        print(f"Total part_time employees before filter: {queryset.count()}")
        if show_archived:
            queryset = queryset.filter(is_archived=True)
        else:
            queryset = queryset.filter(is_archived=False)
        print(f"Part-time employees after filter: {queryset.count()}")
        serializer = EmployeeListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        print(f"Archive action called for employee pk={pk}")
        employee = self.get_object()
        print(f"Employee found: {employee.full_name}, is_archived={employee.is_archived}")
        if employee.is_archived:
            return Response(
                {'error': 'Employee is already archived'},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee.is_archived = True
        employee.archived_at = timezone.now()
        if request.user and request.user.is_authenticated:
            try:
                from users.models import UserProfile
                employee.archived_by = UserProfile.objects.get(user=request.user)
            except UserProfile.DoesNotExist:
                pass
        employee.save()
        print(f"Employee archived successfully: {employee.full_name}")

        serializer = self.get_serializer(employee)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        print(f"Unarchive action called for employee pk={pk}")
        employee = self.get_object()
        print(f"Employee found: {employee.full_name}, is_archived={employee.is_archived}")
        if not employee.is_archived:
            return Response(
                {'error': 'Employee is not archived'},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee.is_archived = False
        employee.archived_at = None
        employee.archived_by = None
        employee.save()
        print(f"Employee unarchived successfully: {employee.full_name}")

        serializer = self.get_serializer(employee)
        return Response(serializer.data)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class JobTitleViewSet(viewsets.ModelViewSet):
    queryset = JobTitle.objects.all()
    serializer_class = JobTitleSerializer


class EmploymentTypeViewSet(viewsets.ModelViewSet):
    queryset = EmploymentType.objects.all()
    serializer_class = EmploymentTypeSerializer


class ContractDocumentViewSet(viewsets.ModelViewSet):
    queryset = ContractDocument.objects.all()
    serializer_class = ContractDocumentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee', None)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        return queryset


class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    queryset = EmployeeDocument.objects.all()
    serializer_class = EmployeeDocumentSerializer
    permission_classes = [permissions.AllowAny]


class EmployeeHistoryViewSet(viewsets.ModelViewSet):
    queryset = EmployeeHistory.objects.all()
    serializer_class = EmployeeHistorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee', None)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        return queryset


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee', None)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        return queryset

    @action(detail=False, methods=['post'])
    def clock_in(self, request):
        employee_id = request.data.get('employee')
        if not employee_id:
            return Response({'error': 'Employee ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if employee has an active clock-in (no clock_out)
        active_attendance = Attendance.objects.filter(
            employee=employee,
            clock_out__isnull=True
        ).first()

        if active_attendance:
            return Response({'error': 'Employee already clocked in'}, status=status.HTTP_400_BAD_REQUEST)

        # Create new attendance record
        now = timezone.now()
        attendance = Attendance.objects.create(
            employee=employee,
            clock_in=now,
            date=now.date()
        )

        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def clock_out(self, request, pk=None):
        try:
            attendance = Attendance.objects.get(pk=pk)
        except Attendance.DoesNotExist:
            return Response({'error': 'Attendance record not found'}, status=status.HTTP_404_NOT_FOUND)

        if attendance.clock_out:
            return Response({'error': 'Already clocked out'}, status=status.HTTP_400_BAD_REQUEST)

        attendance.clock_out = timezone.now()
        attendance.save()

        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        employee_id = request.query_params.get('employee', None)
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month', timezone.now().month)

        if not employee_id:
            return Response({'error': 'Employee ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

        queryset = Attendance.objects.filter(
            employee=employee,
            date__year=year,
            date__month=month
        )

        total_hours = queryset.aggregate(total=Sum('hours_worked'))['total'] or 0
        total_earnings = 0
        if employee.hourly_rate:
            total_earnings = total_hours * employee.hourly_rate

        serializer = AttendanceSerializer(queryset, many=True)
        return Response({
            'employee_id': employee_id,
            'employee_name': employee.full_name,
            'year': year,
            'month': month,
            'total_hours': total_hours,
            'total_earnings': total_earnings,
            'hourly_rate': employee.hourly_rate,
            'records': serializer.data
        })


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        return qs


class JobTitleViewSet(viewsets.ModelViewSet):
    queryset = JobTitle.objects.all()
    serializer_class = JobTitleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        department = self.request.query_params.get('department')
        if department:
            qs = qs.filter(department__id=department)
        return qs


class CredentialViewSet(viewsets.ModelViewSet):
    queryset = Credential.objects.all()
    serializer_class = CredentialSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        credential = self.get_object()
        if credential.status != 'pending':
            return Response(
                {'error': 'Only pending credentials can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        credential.status = 'approved'
        if request.user and request.user.is_authenticated:
            try:
                from users.models import UserProfile
                credential.approved_by = UserProfile.objects.get(user=request.user)
            except UserProfile.DoesNotExist:
                pass
        credential.approved_at = timezone.now()
        credential.save()

        # Create corresponding User account
        from django.contrib.auth.models import User
        username = credential.username
        temp_password = credential.temporary_password

        user, _ = User.objects.get_or_create(
            username=username,
            defaults={
                'email': credential.employee.email or '',
                'first_name': credential.employee.full_name.split(' ', 1)[0] if credential.employee.full_name else '',
                'last_name': credential.employee.full_name.split(' ', 1)[1] if credential.employee.full_name and ' ' in credential.employee.full_name else '',
            }
        )
        user.email = credential.employee.email or user.email
        user.set_password(temp_password)
        user.save(update_fields=['email', 'password'])

        # Link to UserProfile with appropriate role assignment
        from users.models import UserProfile
        from roles.models import Role
        from django.db import connection

        # Create UserProfile with all required fields
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO user_profiles
                (user_id, account_status, is_administrator, must_change_password, custom_permissions,
                 email_notifications, employee_changes, inventory_alerts, language, project_updates,
                 push_notifications, theme, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, [user.id, 'active', False, True, '{}', False, False, False, 'en', False, False, 'light'])

        # Assign role based on department's default_role
        role = None
        employee = credential.employee

        # Use department's default role if set
        if employee.department and employee.department.default_role:
            role = employee.department.default_role
        else:
            # Fallback to department-based role assignment for backward compatibility
            if employee.department:
                dept_name = employee.department.name.lower()
                if 'technical' in dept_name:
                    role = Role.objects.filter(name='Technician').first()
                elif 'project' in dept_name:
                    role = Role.objects.filter(name='Project Manager').first()
                elif 'human_resource' in dept_name or 'hr' in dept_name:
                    role = Role.objects.filter(name='HR Manager').first()
                elif 'administration' in dept_name or 'admin' in dept_name:
                    role = Role.objects.filter(name='Administrator').first()

            # Fallback to job title-based role
            if not role and employee.job_title:
                job_title = employee.job_title.title.lower()
                if 'technician' in job_title or 'engineer' in job_title:
                    role = Role.objects.filter(name='Technician').first()
                elif 'manager' in job_title:
                    role = Role.objects.filter(name='Project Manager').first()
                elif 'hr' in job_title or 'human' in job_title:
                    role = Role.objects.filter(name='HR Manager').first()
                elif 'administrator' in job_title or 'admin' in job_title:
                    role = Role.objects.filter(name='Administrator').first()

        # Default to a basic employee role if no specific role found
        if not role:
            role, _ = Role.objects.get_or_create(
                name='Employee',
                defaults={
                    'description': 'Basic employee access',
                    'default_landing_path': '/admin/dashboard'
                }
            )

        # Assign the role (ensure only one role to prevent conflicts)
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE user_profiles
                SET role_id = %s, updated_at = NOW()
                WHERE user_id = %s
            """, [role.id, user.id])

        serializer = self.get_serializer(credential)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        credential = self.get_object()
        if credential.status != 'pending':
            return Response(
                {'error': 'Only pending credentials can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )

        credential.status = 'rejected'
        credential.save()

        # Regenerate credentials for retry
        credential.generate_username()
        credential.generate_temporary_password()
        credential.status = 'pending'
        credential.save()

        serializer = self.get_serializer(credential)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        credential = self.get_object()
        credential.generate_temporary_password()
        credential.password_changed = False
        credential.save()

        serializer = self.get_serializer(credential)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def disable(self, request, pk=None):
        credential = self.get_object()
        if credential.status != 'approved':
            return Response(
                {'error': 'Only approved credentials can be disabled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        credential.status = 'disabled'
        credential.save()

        # Disable the corresponding User account
        from django.contrib.auth.models import User
        try:
            user = User.objects.get(username=credential.username)
            user.is_active = False
            user.save()
        except User.DoesNotExist:
            pass

        serializer = self.get_serializer(credential)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def enable(self, request, pk=None):
        credential = self.get_object()
        if credential.status != 'disabled':
            return Response(
                {'error': 'Only disabled credentials can be enabled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        credential.status = 'approved'
        credential.save()

        # Enable the corresponding User account
        from django.contrib.auth.models import User
        try:
            user = User.objects.get(username=credential.username)
            user.is_active = True
            user.save()
        except User.DoesNotExist:
            pass

        serializer = self.get_serializer(credential)
        return Response(serializer.data)


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    def get_queryset(self):
        queryset = Skill.objects.all()
        category = self.request.query_params.get('category')
        is_active = self.request.query_params.get('is_active')

        if category:
            queryset = queryset.filter(category=category)
        if is_active:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset


class EmployeeSkillViewSet(viewsets.ModelViewSet):
    queryset = EmployeeSkill.objects.all()
    serializer_class = EmployeeSkillSerializer

    def get_queryset(self):
        queryset = EmployeeSkill.objects.all()
        employee = self.request.query_params.get('employee')
        skill = self.request.query_params.get('skill')

        if employee:
            queryset = queryset.filter(employee_id=employee)
        if skill:
            queryset = queryset.filter(skill_id=skill)

        return queryset


class ProjectAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ProjectAssignment.objects.all()
    serializer_class = ProjectAssignmentSerializer

    def get_queryset(self):
        queryset = ProjectAssignment.objects.all()
        employee = self.request.query_params.get('employee')
        project_reference = self.request.query_params.get('project_reference')
        status_filter = self.request.query_params.get('status')

        if employee:
            queryset = queryset.filter(employee_id=employee)
        if project_reference:
            queryset = queryset.filter(project_reference=project_reference)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start project assignment"""
        assignment = self.get_object()
        assignment.status = 'active'
        assignment.started_at = timezone.now()
        assignment.save()

        return Response({'status': 'active'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete project assignment"""
        assignment = self.get_object()
        assignment.status = 'completed'
        assignment.ended_at = timezone.now()
        assignment.save()

        return Response({'status': 'completed'})

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        """Withdraw from project assignment"""
        assignment = self.get_object()
        assignment.status = 'withdrawn'
        assignment.ended_at = timezone.now()
        assignment.save()

        return Response({'status': 'withdrawn'})
