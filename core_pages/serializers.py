from rest_framework import serializers
from .models import PageField, PageImage, CoreValue, TeamMember


class PageFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageField
        fields = ['id', 'page', 'key', 'label', 'field_type', 'value', 'display_order', 'updated_by', 'updated_at']
        read_only_fields = ['updated_by', 'updated_at']


class PageImageSerializer(serializers.ModelSerializer):
    image_url_display = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    image_url = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = PageImage
        fields = ['id', 'page', 'key', 'label', 'image', 'image_url', 'image_url_display', 'alt_text', 'updated_by', 'updated_at']
        read_only_fields = ['updated_by', 'updated_at']

    def get_image_url_display(self, obj):
        # Prioritize uploaded image over external URL
        if obj.image:
            try:
                return self.context['request'].build_absolute_uri(obj.image.url)
            except:
                return None
        if obj.image_url:
            return obj.image_url
        return None

    def update(self, instance, validated_data):
        # Handle image_url update explicitly
        image_url = validated_data.pop('image_url', None)
        if image_url is not None:
            instance.image_url = image_url
            # Clear the uploaded image if URL is provided
            if image_url:
                instance.image = None
        
        # Handle image file upload
        image = validated_data.pop('image', None)
        if image is not None:
            instance.image = image
            # Clear the URL if file is uploaded
            if image:
                instance.image_url = None
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class CoreValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreValue
        fields = ['id', 'title', 'description', 'icon', 'display_order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class TeamMemberSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    display_name = serializers.ReadOnlyField()
    employee_name = serializers.SerializerMethodField()
    employee_id = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = ['id', 'employee', 'employee_id', 'employee_name', 'name', 'display_name', 'role_title', 'bio', 'photo', 'photo_url', 'display_order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_photo_url(self, obj):
        # Use display_photo property which falls back to employee photo
        photo = obj.display_photo
        if photo:
            try:
                return self.context['request'].build_absolute_uri(photo.url)
            except:
                return None
        return None

    def get_employee_name(self, obj):
        if obj.employee:
            return obj.employee.full_name
        return None

    def get_employee_id(self, obj):
        if obj.employee:
            return obj.employee.id
        return None
