from django.contrib import admin
from .models import UserProfile, ModulePermission

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'phone', 'user_is_active', 'created_at']
    list_filter = ['role', 'user__is_active', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'role']

    def user_is_active(self, obj):
        return obj.user.is_active
    user_is_active.boolean = True
    user_is_active.short_description = 'Active'

@admin.register(ModulePermission)
class ModulePermissionAdmin(admin.ModelAdmin):
    list_display = ['role', 'module', 'permission', 'created_at']
    list_filter = ['role', 'module', 'permission']
    search_fields = ['role', 'module']
