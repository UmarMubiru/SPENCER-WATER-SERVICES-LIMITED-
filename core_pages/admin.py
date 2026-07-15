from django.contrib import admin
from .models import CorePage


@admin.register(CorePage)
class CorePageAdmin(admin.ModelAdmin):
    list_display = ['page_type', 'section_name', 'section_type', 'section_order', 'is_active', 'updated_at']
    list_filter = ['page_type', 'section_type', 'is_active']
    search_fields = ['section_name', 'content', 'alt_text']
    list_editable = ['section_order', 'is_active']
    ordering = ['page_type', 'section_order']
    fieldsets = (
        ('Page Information', {
            'fields': ('page_type', 'section_name', 'section_type', 'section_order')
        }),
        ('Content', {
            'fields': ('content', 'alt_text')
        }),
        ('Images', {
            'fields': ('image', 'image_url'),
            'description': 'Upload an image or provide an external URL'
        }),
        ('Settings', {
            'fields': ('is_active',)
        }),
    )
