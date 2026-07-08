from rest_framework import serializers
from .models import (
    Department, JobTitle, EmploymentType, Employee, Contract,
    EmployeeDocument, EmployeeAssignment, EmployeeHistory
)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']


class JobTitleSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = JobTitle
        fields = ['id', 'title', 'description', 'department', 'department_name', 'created_at', 'updated_at']


class EmploymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentType
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']


class EmployeeListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    job_title_name = serializers.CharField(source='job_title.title', read_only=True)
    employment_type_name = serializers.CharField(source='employment_type.name', read_only=True)
    contract_expiry = serializers.SerializerMethodField()
    contract_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'full_name', 'email', 'phone',
            'department_name', 'job_title_name', 'employment_type_name',
            'status', 'joining_date', 'contract_expiry', 'contract_status'
        ]
    
    def get_contract_expiry(self, obj):
        active_contract = obj.active_contract
        return active_contract.end_date if active_contract else None
    
    def get_contract_status(self, obj):
        active_contract = obj.active_contract
        if not active_contract:
            return 'No Contract'
        if active_contract.is_expiring_soon:
            return 'Expiring Soon'
        return active_contract.get_status_display()


class EmployeeDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    department = DepartmentSerializer(read_only=True)
    job_title = JobTitleSerializer(read_only=True)
    employment_type = EmploymentTypeSerializer(read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.full_name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'address', 'emergency_contact', 'emergency_phone',
            'department', 'job_title', 'employment_type', 'supervisor', 'supervisor_name',
            'joining_date', 'status', 'profile_picture', 'created_at', 'updated_at'
        ]


class EmployeeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'employee_id', 'first_name', 'last_name', 'email', 'phone',
            'address', 'emergency_contact', 'emergency_phone',
            'department', 'job_title', 'employment_type', 'supervisor',
            'joining_date', 'status'
        ]


class ContractSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    is_expiring_soon = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Contract
        fields = [
            'id', 'employee', 'employee_name', 'employee_id',
            'contract_type', 'start_date', 'end_date', 'status',
            'salary', 'currency', 'document', 'notes',
            'is_expiring_soon', 'created_at', 'updated_at'
        ]


class ContractCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = [
            'employee', 'contract_type', 'start_date', 'end_date',
            'salary', 'currency', 'document', 'notes'
        ]


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    
    class Meta:
        model = EmployeeDocument
        fields = [
            'id', 'employee', 'employee_name', 'employee_id',
            'document_type', 'title', 'file', 'description', 'uploaded_at'
        ]


class EmployeeDocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDocument
        fields = ['employee', 'document_type', 'title', 'file', 'description']


class EmployeeAssignmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    
    class Meta:
        model = EmployeeAssignment
        fields = [
            'id', 'employee', 'employee_name', 'employee_id',
            'project_name', 'role', 'start_date', 'end_date',
            'is_current', 'description', 'created_at', 'updated_at'
        ]


class EmployeeAssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeAssignment
        fields = [
            'employee', 'project_name', 'role', 'start_date',
            'end_date', 'is_current', 'description'
        ]


class EmployeeHistorySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = EmployeeHistory
        fields = [
            'id', 'employee', 'employee_name', 'employee_id',
            'action', 'action_display', 'description',
            'previous_value', 'new_value', 'performed_by', 'timestamp'
        ]


class DashboardStatsSerializer(serializers.Serializer):
    total_employees = serializers.IntegerField()
    active_employees = serializers.IntegerField()
    on_contract = serializers.IntegerField()
    exited = serializers.IntegerField()
    contracts_expiring_soon = serializers.IntegerField()
    contracts_expired = serializers.IntegerField()
    new_this_month = serializers.IntegerField()
    department_distribution = serializers.ListField()
    recent_activities = serializers.ListField()


class DepartmentReportSerializer(serializers.Serializer):
    department = serializers.CharField()
    count = serializers.IntegerField()


class RecentActivitySerializer(serializers.Serializer):
    action = serializers.CharField()
    description = serializers.CharField()
    timestamp = serializers.DateTimeField()
    employee_name = serializers.CharField()
