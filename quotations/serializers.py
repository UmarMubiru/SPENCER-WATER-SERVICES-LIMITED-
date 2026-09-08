from rest_framework import serializers
from .models import Customer, Lead, LeadAttachment, LeadActivity, Task, Notification, SiteVisit, QuotationTemplate, QuotationTemplateItem, Quotation, QuotationItem, LeadDetail, LeadService, QuotationService
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.username', read_only=True)
    lead_number = serializers.CharField(source='lead.lead_number', read_only=True)
    quotation_number = serializers.CharField(source='quotation.quotation_number', read_only=True)
    task_number = serializers.CharField(source='task.task_number', read_only=True)
    project_reference = serializers.CharField(source='project.project_reference', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'read_at']
        extra_kwargs = {
            'recipient': {'required': True},
        }


class LeadDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadDetail
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeadServiceSerializer(serializers.ModelSerializer):
    service_display = serializers.CharField(source='get_service_display', read_only=True)

    class Meta:
        model = LeadService
        fields = '__all__'
        read_only_fields = ['id', 'service_name_snapshot', 'created_at', 'updated_at']


class CustomerSerializer(serializers.ModelSerializer):
    portal_user_name = serializers.CharField(source='portal_user.username', read_only=True)
    
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['id', 'customer_number', 'created_at', 'updated_at']


class LeadActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    lead_customer_name = serializers.CharField(source='lead.customer_name', read_only=True)
    lead_number = serializers.CharField(source='lead.lead_number', read_only=True)
    
    class Meta:
        model = LeadActivity
        fields = '__all__'
        read_only_fields = ['id', 'timestamp']
        extra_kwargs = {
            'user': {'required': False, 'allow_null': True}
        }


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    lead_number = serializers.CharField(source='lead.lead_number', read_only=True)
    quotation_number = serializers.CharField(source='quotation.quotation_number', read_only=True)
    project_reference = serializers.CharField(source='project.project_reference', read_only=True)
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['id', 'task_number', 'created_at', 'updated_at']
        extra_kwargs = {
            'assigned_to': {'required': False, 'allow_null': True},
            'created_by': {'required': False, 'allow_null': True},
            'lead': {'required': False, 'allow_null': True},
            'quotation': {'required': False, 'allow_null': True},
            'project': {'required': False, 'allow_null': True},
        }


class LeadSerializer(serializers.ModelSerializer):
    details = LeadDetailSerializer(read_only=True)
    lead_services = LeadServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ['id', 'lead_number', 'created_at', 'updated_at']


class LeadAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = LeadAttachment
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'uploaded_by': {'required': False, 'allow_null': True}
        }


class LeadActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = LeadActivity
        fields = '__all__'
        read_only_fields = ['id', 'timestamp']
        extra_kwargs = {
            'user': {'required': False, 'allow_null': True}
        }


class SiteVisitSerializer(serializers.ModelSerializer):
    engineer_name = serializers.CharField(source='engineer.username', read_only=True)
    lead_customer = serializers.CharField(source='lead.customer_name', read_only=True)
    
    class Meta:
        model = SiteVisit
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'engineer': {'required': False, 'allow_null': True}
        }


class PublicLeadSerializer(serializers.ModelSerializer):
    """Serializer for public lead submission - excludes internal fields"""
    service_specific_answers = serializers.JSONField(required=False, write_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'lead_number', 'customer_name', 'company', 'phone', 'email', 'preferred_contact',
            'district', 'subcounty', 'village', 'address', 'gps',
            'service', 'description', 'budget_range', 'timeline', 'service_specific_answers',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'lead_number', 'created_at', 'updated_at']


class QuotationTemplateItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationTemplateItem
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuotationTemplateSerializer(serializers.ModelSerializer):
    items = QuotationTemplateItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuotationTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = '__all__'
        read_only_fields = ['id', 'line_total', 'vat_amount', 'discount_amount', 'final_total', 'created_at', 'updated_at']


class QuotationServiceSerializer(serializers.ModelSerializer):
    service_display = serializers.CharField(source='get_service_display', read_only=True)
    items = QuotationItemSerializer(many=True, read_only=True)

    class Meta:
        model = QuotationService
        fields = '__all__'
        read_only_fields = ['id', 'service_name_snapshot', 'created_at', 'updated_at']


class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    quotation_services = QuotationServiceSerializer(many=True, read_only=True)
    lead_customer_name = serializers.CharField(source='lead.customer_name', read_only=True, allow_null=True)
    lead_company = serializers.CharField(source='lead.company', read_only=True, allow_null=True)
    lead_number = serializers.CharField(source='lead.lead_number', read_only=True, allow_null=True)
    lead_services = LeadServiceSerializer(source='lead.lead_services', many=True, read_only=True)
    submitted_by_name = serializers.CharField(source='submitted_by.username', read_only=True, allow_null=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True, allow_null=True)
    template_name = serializers.CharField(source='template.name', read_only=True, allow_null=True)

    class Meta:
        model = Quotation
        fields = '__all__'
        read_only_fields = ['id', 'quotation_number', 'subtotal', 'vat_total', 'discount_total', 'grand_total', 'created_at', 'updated_at']
        extra_kwargs = {
            'lead': {'required': False, 'allow_null': True},
        }
