from rest_framework import serializers
from .models import (
    Department, JobTitle, EmploymentType, Employee, ContractDocument,
    EmployeeDocument, EmployeeHistory, Attendance, Credential, Skill, EmployeeSkill, ProjectAssignment
)


class DepartmentSerializer(serializers.ModelSerializer):
    department_head_name = serializers.CharField(source='department_head.full_name', read_only=True)
    employee_count = serializers.SerializerMethodField()
    default_role_name = serializers.CharField(source='default_role.name', read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'department_head', 'department_head_name', 'default_role', 'default_role_name', 'is_active', 'employee_count', 'created_at', 'updated_at']

    def get_employee_count(self, obj):
        return obj.employee_set.filter(status='available').count()

    def validate(self, attrs):
        department_head = attrs.get('department_head')
        # A head is meaningful only when they are a member of this department.
        # New departments have no members yet, so a head can be selected after
        # staff are assigned and the department is edited.
        if department_head and self.instance and department_head.department_id != self.instance.id:
            raise serializers.ValidationError({
                'department_head': 'The department head must be an employee in this department.'
            })
        if department_head and not self.instance:
            raise serializers.ValidationError({
                'department_head': 'Assign employees to the department before selecting its head.'
            })
        return attrs


class JobTitleSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_is_active = serializers.BooleanField(source='department.is_active', read_only=True)

    class Meta:
        model = JobTitle
        fields = ['id', 'title', 'description', 'department', 'department_name', 'department_is_active', 'created_at', 'updated_at']


class EmploymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentType
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']


# Employee Serializers
class EmployeeListSerializer(serializers.ModelSerializer):
    department = serializers.IntegerField(source='department_id', read_only=True, allow_null=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    job_title_name = serializers.CharField(source='job_title.title', read_only=True)
    total_monthly_earnings = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id', 'full_name', 'email', 'phone', 'employee_type',
            'department', 'department_name', 'job_title_name', 'management_category',
            'gross_monthly_salary', 'daily_rate', 'hourly_rate', 'pay_basis',
            'contract_start_date', 'contract_end_date',
            'total_monthly_earnings', 'photo', 'status', 'created_at'
        ]

    def get_total_monthly_earnings(self, obj):
        if obj.employee_type == 'part_time' and obj.hourly_rate:
            from django.utils import timezone
            from django.db.models import Sum
            from datetime import timedelta
            from .models import Attendance

            now = timezone.now()
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            total_hours = Attendance.objects.filter(
                employee=obj,
                clock_in__gte=month_start,
                clock_out__isnull=False
            ).aggregate(total=Sum('hours_worked'))['total'] or 0

            return total_hours * obj.hourly_rate
        return None


class EmployeeDetailSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    job_title = serializers.PrimaryKeyRelatedField(read_only=True)
    job_title_name = serializers.CharField(source='job_title.title', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'full_name', 'phone', 'email',
            'id_type', 'id_number', 'id_document',
            'employee_type', 'department', 'department_name', 'management_category',
            'job_title', 'job_title_name', 'gross_monthly_salary',
            'pay_basis', 'daily_rate', 'hourly_rate',
            'contract_start_date', 'contract_end_date',
            'photo', 'status', 'created_at', 'updated_at'
        ]


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

    def to_internal_value(self, data):
        # Handle department string conversion before validation
        if isinstance(data, dict) and isinstance(data.get('department'), str):
            dept_name = data['department']
            try:
                dept = Department.objects.get(name=dept_name)
                data['department'] = dept.id
            except Department.DoesNotExist:
                raise serializers.ValidationError({'department': f'Department "{dept_name}" does not exist'})

        return super().to_internal_value(data)

    def validate(self, data):
        # Get the instance if this is an update (PATCH/PUT)
        instance = self.instance if hasattr(self, 'instance') else None

        # For partial updates, use instance values for missing fields
        employee_type = data.get('employee_type', instance.employee_type if instance else None)

        if employee_type == Employee.FULL_TIME:
            # For full-time employees, validate job_title and gross_monthly_salary
            job_title = data.get('job_title', instance.job_title if instance else None)
            gross_monthly_salary = data.get('gross_monthly_salary', instance.gross_monthly_salary if instance else None)
            if not job_title:
                raise serializers.ValidationError({'job_title': 'Required for full-time staff.'})
            if not gross_monthly_salary:
                raise serializers.ValidationError({'gross_monthly_salary': 'Required for full-time staff.'})
        elif employee_type == Employee.PART_TIME:
            # For part-time employees, validate pay_basis and rates
            pay_basis = data.get('pay_basis', instance.pay_basis if instance else None)
            if not pay_basis:
                raise serializers.ValidationError({'pay_basis': 'Required for part-time staff.'})

            if pay_basis == 'daily_fixed':
                daily_rate = data.get('daily_rate', instance.daily_rate if instance else None)
                if not daily_rate:
                    raise serializers.ValidationError({'daily_rate': 'Required for daily_fixed pay basis.'})
            elif pay_basis in ('hourly_daily', 'hourly_monthly'):
                hourly_rate = data.get('hourly_rate', instance.hourly_rate if instance else None)
                if not hourly_rate:
                    raise serializers.ValidationError({'hourly_rate': 'Required for hourly pay basis.'})

        return data


class ContractDocumentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = ContractDocument
        fields = ['id', 'employee', 'employee_name', 'title', 'doc_type', 'file', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = EmployeeDocument
        fields = ['id', 'employee', 'employee_name', 'document_type', 'file', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class EmployeeHistorySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = EmployeeHistory
        fields = ['id', 'employee', 'employee_name', 'action', 'description', 'previous_value', 'new_value', 'performed_by', 'timestamp']
        read_only_fields = ['timestamp']


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)
    job_title_name = serializers.CharField(source='employee.job_title.title', read_only=True)
    hourly_rate = serializers.DecimalField(source='employee.hourly_rate', max_digits=12, decimal_places=2, read_only=True)
    total_earnings = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'department_name', 'job_title_name',
            'clock_in', 'clock_out', 'date', 'hours_worked', 'hourly_rate',
            'total_earnings', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['hours_worked', 'created_at', 'updated_at']

    def get_total_earnings(self, obj):
        if obj.hours_worked and obj.employee.hourly_rate:
            return obj.hours_worked * obj.employee.hourly_rate
        return None


class CredentialSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_department = serializers.CharField(source='employee.department.name', read_only=True)
    employee_job_title = serializers.CharField(source='employee.job_title.title', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)

    class Meta:
        model = Credential
        fields = [
            'id', 'employee', 'employee_name', 'employee_department', 'employee_job_title',
            'username', 'temporary_password', 'status', 'approved_by', 'approved_by_name',
            'approved_at', 'password_changed', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['username', 'temporary_password', 'created_at', 'updated_at']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeSkillSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)

    class Meta:
        model = EmployeeSkill
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectAssignmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_department = serializers.CharField(source='employee.department.name', read_only=True)

    class Meta:
        model = ProjectAssignment
        fields = '__all__'
        read_only_fields = ['id', 'assigned_at', 'created_at', 'updated_at']
