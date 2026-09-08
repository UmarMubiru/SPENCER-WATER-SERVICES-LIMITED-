from django.contrib import admin
from core.models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['module', 'record_name', 'action', 'performed_by', 'timestamp']
    list_filter = ['module', 'action', 'timestamp']
    search_fields = ['record_name', 'performed_by__username', 'description']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']
