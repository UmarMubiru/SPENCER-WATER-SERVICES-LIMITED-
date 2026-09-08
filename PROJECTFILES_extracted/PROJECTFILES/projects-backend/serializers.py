from rest_framework import serializers
from .models import Project
from .models_extras import ProjectMilestone, ProjectDocument, ProjectCostLine, ProjectHistory, ProjectTeamAssignmentHistory, ProjectFieldHistory, ProjectActivity, ActivityUpdateHistory, ActivityResource, ActivityImage, ProjectResourceAllocation


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMilestone
        fields = "__all__"


class ProjectDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDocument
        fields = "__all__"
    
    def validate_file(self, value):
        """Validate that uploaded files are PDF, JPG, or PNG only"""
        if value:
            allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
            file_extension = value.name.lower().split('.')[-1]
            if f'.{file_extension}' not in allowed_extensions:
                raise serializers.ValidationError("Only PDF, JPG, JPEG, and PNG files are allowed.")
        return value


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
    changed_by_name = serializers.SerializerMethodField()
    changed_by_email = serializers.SerializerMethodField()

    class Meta:
        model = ProjectFieldHistory
        fields = "__all__"

    def get_changed_by_name(self, obj):
        if obj.changed_by and hasattr(obj.changed_by, 'user'):
            return obj.changed_by.user.username
        return 'System'

    def get_changed_by_email(self, obj):
        if obj.changed_by and hasattr(obj.changed_by, 'user'):
            return obj.changed_by.user.email
        return 'system@example.com'


class ProjectSerializer(serializers.ModelSerializer):
    computed_progress = serializers.ReadOnlyField()
    documents = ProjectDocumentSerializer(many=True, read_only=True)
    resource_allocations = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = "__all__"
    
    def get_resource_allocations(self, obj):
        """Return resource allocations with remaining balances"""
        allocations = obj.resource_allocations.all()
        return ProjectResourceAllocationSerializer(allocations, many=True).data


class ProjectResourceAllocationSerializer(serializers.ModelSerializer):
    remaining_quantity = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    allocated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectResourceAllocation
        fields = "__all__"

    def get_allocated_by_name(self, obj):
        if obj.allocated_by:
            return obj.allocated_by.username
        return None

    def validate(self, data):
        resource_type = data.get('resource_type', getattr(self.instance, 'resource_type', None))

        if resource_type == 'hired_tool':
            required_fields = {
                'tool_name': 'Tool name',
                'allocated_quantity': 'Quantity',
                'hired_from': 'Source',
                'hired_tool_cost': 'Cost',
            }
            errors = {}
            for field, label in required_fields.items():
                value = data.get(field, getattr(self.instance, field, None))
                if value is None or value == '':
                    errors[field] = f'{label} is required for a hired tool.'
            if errors:
                raise serializers.ValidationError(errors)

        return data


class ActivityResourceSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(source='inventory_item.name', read_only=True, allow_null=True)
    remaining_quantity = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityResource
        fields = "__all__"
    
    def get_remaining_quantity(self, obj):
        """Get remaining quantity from project allocation"""
        if obj.project_allocation:
            return obj.project_allocation.remaining_quantity
        return None
    
    def get_remaining_amount(self, obj):
        """Get remaining amount from project allocation"""
        if obj.project_allocation:
            return obj.project_allocation.remaining_amount
        return None
    
    def validate(self, data):
        resource_type = data.get('resource_type')
        
        if resource_type == 'company_tool':
            if not data.get('inventory_item'):
                raise serializers.ValidationError({"inventory_item": "Inventory item is required for company_tool type."})
            if not data.get('quantity'):
                raise serializers.ValidationError({"quantity": "Quantity is required for company_tool type."})
            # Auto-resolve project_allocation from inventory_item if not provided
            if not data.get('project_allocation') and data.get('inventory_item'):
                activity = data.get('activity')
                if activity and activity.project:
                    allocation = activity.project.resource_allocations.filter(
                        resource_type='company_tool',
                        tool_name=data['inventory_item'].name
                    ).first()
                    if allocation:
                        data['project_allocation'] = allocation
            # Validate quantity doesn't exceed remaining if allocation exists
            if data.get('project_allocation') and data.get('quantity'):
                remaining = data['project_allocation'].remaining_quantity
                if remaining is not None and data['quantity'] > remaining:
                    raise serializers.ValidationError({"quantity": f"Cannot draw {data['quantity']}. Only {remaining} remaining in allocation."})
            if any(data.get(field) for field in ['hired_tool_name', 'hired_from', 'hired_tool_cost', 'money_amount', 'money_purpose']):
                raise serializers.ValidationError("Only inventory_item, project_allocation, and quantity should be set for company_tool type.")
        
        elif resource_type == 'hired_tool':
            if not data.get('hired_tool_name'):
                raise serializers.ValidationError({"hired_tool_name": "Hired tool name is required for hired_tool type."})
            if not data.get('quantity'):
                raise serializers.ValidationError({"quantity": "Quantity is required for hired_tool type."})
            if not data.get('hired_from'):
                raise serializers.ValidationError({"hired_from": "Hired from is required for hired_tool type."})
            if not data.get('hired_tool_cost'):
                raise serializers.ValidationError({"hired_tool_cost": "Hired tool cost is required for hired_tool type."})
            if any(data.get(field) for field in ['inventory_item', 'project_allocation', 'money_amount', 'money_purpose']):
                raise serializers.ValidationError("Only hired_tool_name, hired_from, quantity, and hired_tool_cost should be set for hired_tool type.")
        
        elif resource_type == 'money':
            if not data.get('money_amount'):
                raise serializers.ValidationError({"money_amount": "Money amount is required for money type."})
            # Auto-resolve project_allocation if money_purpose is provided
            if not data.get('project_allocation') and data.get('money_purpose'):
                activity = data.get('activity')
                if activity and activity.project:
                    allocation = activity.project.resource_allocations.filter(
                        resource_type='money',
                        money_purpose=data['money_purpose']
                    ).first()
                    if allocation:
                        data['project_allocation'] = allocation
            # Validate amount doesn't exceed remaining if allocation exists
            if data.get('project_allocation') and data.get('money_amount'):
                remaining = data['project_allocation'].remaining_amount
                if remaining is not None and data['money_amount'] > remaining:
                    raise serializers.ValidationError({"money_amount": f"Cannot draw {data['money_amount']}. Only {remaining} remaining in allocation."})
            if any(data.get(field) for field in ['inventory_item', 'quantity', 'hired_tool_name', 'hired_from', 'hired_tool_cost']):
                raise serializers.ValidationError("Only project_allocation, money_amount, and money_purpose should be set for money type.")
        
        return data


class ActivityImageSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True, allow_null=True)
    image_url = serializers.ImageField(source='image', read_only=True)
    
    class Meta:
        model = ActivityImage
        fields = "__all__"


class ActivityUpdateHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()
    changed_by_email = serializers.SerializerMethodField()
    activity_name = serializers.SerializerMethodField()

    class Meta:
        model = ActivityUpdateHistory
        fields = "__all__"

    def get_changed_by_name(self, obj):
        if obj.changed_by and hasattr(obj.changed_by, 'user'):
            return obj.changed_by.user.username
        return 'System'

    def get_changed_by_email(self, obj):
        if obj.changed_by and hasattr(obj.changed_by, 'user'):
            return obj.changed_by.user.email
        return 'system@example.com'

    def get_activity_name(self, obj):
        if obj.activity:
            return obj.activity.activity_name
        return 'Unknown Activity'


class ProjectActivitySerializer(serializers.ModelSerializer):
    resources = ActivityResourceSerializer(many=True, required=False)
    images = ActivityImageSerializer(many=True, required=False)
    update_history = ActivityUpdateHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = ProjectActivity
        fields = "__all__"
    
    def create(self, validated_data):
        resources_data = validated_data.pop('resources', [])
        images_data = validated_data.pop('images', [])
        activity = ProjectActivity.objects.create(**validated_data)
        
        for resource_data in resources_data:
            ActivityResource.objects.create(activity=activity, **resource_data)
        
        for image_data in images_data:
            ActivityImage.objects.create(activity=activity, **image_data)
        
        return activity
    
    def update(self, instance, validated_data):
        resources_data = validated_data.pop('resources', None)
        images_data = validated_data.pop('images', None)
        
        # Update activity fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle resources
        if resources_data is not None:
            # Delete existing resources
            instance.resources.all().delete()
            
            # Create new resources
            for resource_data in resources_data:
                ActivityResource.objects.create(activity=instance, **resource_data)
        
        # Handle images
        if images_data is not None:
            # Delete existing images
            instance.images.all().delete()
            
            # Create new images
            for image_data in images_data:
                ActivityImage.objects.create(activity=instance, **image_data)
        
        return instance
