from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['report_type', 'category', 'status', 'file_format', 'generated_by', 'requested_at', 'completed_at']
    list_filter = ['category', 'status', 'file_format']
    search_fields = ['report_type', 'generated_by__username']
    readonly_fields = ['requested_at', 'completed_at', 'error_message']
    date_hierarchy = 'requested_at'
    
    fieldsets = (
        ('Report Information', {
            'fields': ('category', 'report_type', 'status', 'file_format')
        }),
        ('Date Range', {
            'fields': ('date_range_start', 'date_range_end')
        }),
        ('Generation Details', {
            'fields': ('generated_by', 'requested_at', 'completed_at', 'error_message')
        }),
        ('File', {
            'fields': ('file',)
        }),
    )
    
    def has_add_permission(self, request):
        # Reports are generated via API, not manually created in admin
        return False
    
    def has_change_permission(self, request, obj=None):
        # Only allow changing status for retrying failed reports
        if obj and obj.status == 'FAILED':
            return True
        return False
