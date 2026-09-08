from django.contrib import admin
from .models import SystemActivity, Alert, MetricSnapshot, SavedReport, ScheduledReport


@admin.register(SystemActivity)
class SystemActivityAdmin(admin.ModelAdmin):
    list_display = ['module', 'action', 'performed_by_name', 'created_at']
    list_filter = ['module', 'created_at']
    search_fields = ['action', 'description', 'performed_by_name']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'priority', 'status', 'created_at']
    list_filter = ['priority', 'status', 'category', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(MetricSnapshot)
class MetricSnapshotAdmin(admin.ModelAdmin):
    list_display = ['metric_key', 'value', 'snapshot_date']
    list_filter = ['snapshot_date']
    search_fields = ['metric_key']
    date_hierarchy = 'snapshot_date'


@admin.register(SavedReport)
class SavedReportAdmin(admin.ModelAdmin):
    list_display = ['name', 'module', 'created_by', 'created_at']
    list_filter = ['module', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at']


@admin.register(ScheduledReport)
class ScheduledReportAdmin(admin.ModelAdmin):
    list_display = ['saved_report', 'frequency', 'is_active', 'last_run_at']
    list_filter = ['frequency', 'is_active']
    readonly_fields = ['last_run_at']
