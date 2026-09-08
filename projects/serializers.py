from rest_framework import serializers
from .models import Project, ProjectAssignment, ProjectRoleAllocation, ProjectRole, CasualWorker, CasualWorkerAttendance, CasualWorkTask, CasualWorkAssignment, CasualWorkProgress
from .models_extras import (
    ProjectMilestone, ProjectDocument, ProjectCostLine, ProjectHistory, ProjectTeamAssignmentHistory,
    ProjectActivity, ActivityResource, ActivityImage, ProjectResourceAllocation, ProjectFieldHistory,
    ProjectFundTransaction
)


class ProjectRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectRole
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']


class ProjectRoleAllocationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_department = serializers.CharField(source='employee.department.name', read_only=True)
    employee_job_title = serializers.CharField(source='employee.job_title.title', read_only=True)
    employee_status = serializers.CharField(source='employee.status', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    job_title_name = serializers.CharField(source='job_title.title', read_only=True)
    job_title_department = serializers.CharField(source='job_title.department.name', read_only=True)
    project_role_name = serializers.CharField(source='project_role.name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.full_name', read_only=True)

    class Meta:
        model = ProjectRoleAllocation
        fields = [
            'id', 'employee', 'employee_name', 'employee_department', 'employee_job_title',
            'employee_status', 'project', 'project_name', 'job_title', 'job_title_name',
            'job_title_department', 'project_role', 'project_role_name', 'assigned_date', 'end_date',
            'assigned_by', 'assigned_by_name', 'is_active', 'reviewed_at', 'reviewed_by'
        ]


class ProjectAssignmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = ProjectAssignment
        fields = ['id', 'employee', 'employee_name', 'project', 'project_name', 'assigned_date', 'end_date', 'is_active']


class CasualWorkerSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = CasualWorker
        fields = [
            'id', 'project', 'project_name', 'full_name', 'phone', 'next_of_kin',
            'payment_type', 'piece_rate', 'daily_rate', 'village',
            'id_type', 'id_number', 'id_document', 'lc1_letter', 'hourly_rate',
            'created_at', 'updated_at', 'is_active'
        ]
        extra_kwargs = {
            'next_of_kin': {'required': True, 'allow_blank': False},
        }

    def validate(self, attrs):
        payment_type = attrs.get('payment_type', getattr(self.instance, 'payment_type', None))
        piece_rate = attrs.get('piece_rate', getattr(self.instance, 'piece_rate', 0))
        daily_rate = attrs.get('daily_rate', getattr(self.instance, 'daily_rate', 0))

        requires_piece_rate = self.instance is None or 'payment_type' in attrs or 'piece_rate' in attrs
        requires_daily_rate = self.instance is None or 'payment_type' in attrs or 'daily_rate' in attrs
        if payment_type == 'piece_rate' and requires_piece_rate and piece_rate <= 0:
            raise serializers.ValidationError({'piece_rate': 'Enter a rate greater than zero.'})
        if payment_type == 'daily_rate' and requires_daily_rate and daily_rate <= 0:
            raise serializers.ValidationError({'daily_rate': 'Enter a rate greater than zero.'})
        return attrs


class CasualWorkerAttendanceSerializer(serializers.ModelSerializer):
    casual_worker_name = serializers.CharField(source='casual_worker.full_name', read_only=True)
    project_name = serializers.CharField(source='casual_worker.project.name', read_only=True)
    clocked_in_by_name = serializers.CharField(source='clocked_in_by.full_name', read_only=True)
    clocked_out_by_name = serializers.CharField(source='clocked_out_by.full_name', read_only=True)

    class Meta:
        model = CasualWorkerAttendance
        fields = [
            'id', 'casual_worker', 'casual_worker_name', 'project_name',
            'clock_in', 'clock_out', 'clocked_in_by', 'clocked_in_by_name',
            'clocked_out_by', 'clocked_out_by_name', 'hours_worked',
            'pieces_completed', 'daily_wage', 'notes', 'created_at', 'updated_at'
        ]


class CasualWorkAssignmentSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='casual_worker.full_name', read_only=True)
    earned_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CasualWorkAssignment
        fields = ['id', 'task', 'casual_worker', 'worker_name', 'share_percentage', 'earned_amount']


class CasualWorkProgressSerializer(serializers.ModelSerializer):
    assignment_name = serializers.CharField(source='assignment.casual_worker.full_name', read_only=True)

    class Meta:
        model = CasualWorkProgress
        fields = ['id', 'task', 'assignment', 'assignment_name', 'work_date', 'quantity', 'notes', 'is_approved', 'approved_by', 'created_at']
        read_only_fields = ['approved_by']


class CasualWorkTaskSerializer(serializers.ModelSerializer):
    assignments = CasualWorkAssignmentSerializer(many=True, read_only=True)
    approved_quantity = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    agreed_rate = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    earned_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CasualWorkTask
        fields = ['id', 'project', 'title', 'description', 'arrangement', 'payment_rule', 'total_amount', 'target_quantity', 'unit', 'status', 'approved_quantity', 'agreed_rate', 'earned_amount', 'assignments', 'created_at', 'updated_at']

    def validate(self, attrs):
        if attrs.get('target_quantity', getattr(self.instance, 'target_quantity', 0)) <= 0:
            raise serializers.ValidationError({'target_quantity': 'Target coverage must be greater than zero.'})
        return attrs


class ProjectSerializer(serializers.ModelSerializer):
    employee_assignments = ProjectAssignmentSerializer(many=True, read_only=True, source='projectassignment_set')
    gallery_images = serializers.SerializerMethodField()
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)

    def get_gallery_images(self, obj):
        request = self.context.get('request')
        images = []
        for activity in obj.activities.prefetch_related('images'):
            for item in activity.images.all():
                image_url = item.image.url if item.image else ''
                images.append({
                    'id': str(item.id),
                    'url': request.build_absolute_uri(image_url) if request and image_url else image_url,
                    'caption': item.caption,
                })
        return images

    class Meta:
        model = Project
        fields = "__all__"


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMilestone
        fields = "__all__"


class ProjectDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDocument
        fields = "__all__"


class ProjectCostLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCostLine
        fields = "__all__"


class ProjectHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectHistory
        fields = "__all__"


class ProjectTeamAssignmentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTeamAssignmentHistory
        fields = "__all__"


class ProjectFieldHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFieldHistory
        fields = "__all__"


class ProjectActivitySerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    resources_count = serializers.SerializerMethodField()
    images_count = serializers.SerializerMethodField()

    class Meta:
        model = ProjectActivity
        fields = "__all__"

    def get_resources_count(self, obj):
        try:
            return obj.resources.count()
        except Exception as e:
            print(f"Error getting resources count: {e}")
            return 0

    def get_images_count(self, obj):
        try:
            return obj.images.count()
        except Exception as e:
            print(f"Error getting images count: {e}")
            return 0


class ActivityResourceSerializer(serializers.ModelSerializer):
    activity_name = serializers.CharField(source='activity.activity_name', read_only=True)
    inventory_item_name = serializers.CharField(source='inventory_item.name', read_only=True)
    project_allocation_tool_name = serializers.CharField(source='project_allocation.tool_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = ActivityResource
        fields = "__all__"


class ActivityImageSerializer(serializers.ModelSerializer):
    activity_name = serializers.CharField(source='activity.activity_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = ActivityImage
        fields = "__all__"
        extra_kwargs = {
            'uploaded_by': {'required': False, 'allow_null': True},
            'image': {'required': False, 'allow_null': True},
            'image_url': {'required': False, 'allow_null': True},
            'activity': {'required': False, 'allow_null': True}
        }


class ProjectDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = ProjectDocument
        fields = "__all__"
        extra_kwargs = {
            'uploaded_by': {'required': False, 'allow_null': True}
        }


class ProjectResourceAllocationSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    allocated_by_name = serializers.CharField(source='allocated_by.username', read_only=True)
    remaining_quantity = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()

    class Meta:
        model = ProjectResourceAllocation
        fields = "__all__"

    def validate(self, attrs):
        if attrs.get('resource_type', getattr(self.instance, 'resource_type', None)) != 'money':
            return attrs
        project = attrs.get('project', getattr(self.instance, 'project', None))
        amount = attrs.get('money_amount', getattr(self.instance, 'money_amount', None))
        if amount is None or amount <= 0:
            raise serializers.ValidationError({'money_amount': 'Enter an allocation amount greater than zero.'})
        if not project:
            return attrs
        existing = ProjectResourceAllocation.objects.filter(project=project, resource_type='money')
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        committed = sum(item.money_amount or 0 for item in existing)
        if committed + amount > project.contract_value:
            available = project.contract_value - committed
            raise serializers.ValidationError({
                'money_amount': f'Only {available} remains available from the project contract value for working-budget allocation.'
            })
        return attrs


class ProjectFundTransactionSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    activity_name = serializers.CharField(source='activity.activity_name', read_only=True, default="")
    spent_by_name = serializers.CharField(source='spent_by.get_full_name', read_only=True, default="")
    remaining_allocation = serializers.SerializerMethodField()

    class Meta:
        model = ProjectFundTransaction
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def get_remaining_allocation(self, obj):
        """Calculate remaining amount in the associated allocation"""
        if obj.resource_allocation:
            return obj.resource_allocation.remaining_amount
        return None

    def validate(self, attrs):
        project = attrs.get('project', getattr(self.instance, 'project', None))
        activity = attrs.get('activity', getattr(self.instance, 'activity', None))
        allocation = attrs.get('resource_allocation', getattr(self.instance, 'resource_allocation', None))
        amount = attrs.get('amount', getattr(self.instance, 'amount', None))

        if amount is not None and amount <= 0:
            raise serializers.ValidationError({'amount': 'Amount must be greater than zero.'})
        if activity and project and activity.project_id != project.id:
            raise serializers.ValidationError({'activity': 'The activity must belong to this project.'})
        if allocation:
            if allocation.resource_type != 'money':
                raise serializers.ValidationError({'resource_allocation': 'Select a money allocation.'})
            if project and allocation.project_id != project.id:
                raise serializers.ValidationError({'resource_allocation': 'The allocation must belong to this project.'})
        return attrs

    def to_internal_value(self, data):
        data = data.copy()
        key_map = {
            "projectId": "project_id", "activityId": "activity_id",
            "resourceAllocationId": "resource_allocation_id",
            "expenseType": "expense_type", "transactionDate": "transaction_date",
            "supplierOrPayee": "supplier_or_payee",
            "referenceNumber": "reference_number",
            "receiptOrDocument": "receipt_or_document",
        }
        for old_key, new_key in key_map.items():
            if old_key in data and new_key not in data:
                data[new_key] = data.pop(old_key)
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.update({
            "projectId": data.get("project"),
            "projectName": data.get("project_name"),
            "activityId": data.get("activity"),
            "activityName": data.get("activity_name"),
            "resourceAllocationId": data.get("resource_allocation"),
            "expenseType": data.get("expense_type"),
            "transactionDate": data.get("transaction_date"),
            "supplierOrPayee": data.get("supplier_or_payee"),
            "referenceNumber": data.get("reference_number"),
            "receiptOrDocument": data.get("receipt_or_document"),
            "spentBy": data.get("spent_by"),
            "spentByName": data.get("spent_by_name"),
            "createdAt": data.get("created_at"),
            "updatedAt": data.get("updated_at"),
        })
        return data
