from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("project_reference", "name", "status", "planned_start_date", "planned_end_date")
    search_fields = ("project_reference", "name", "site_location")
    list_filter = ("status", "service_line", "is_portfolio_candidate")

from .models_extras import ProjectMilestone, ProjectDocument, ProjectCostLine


class ProjectMilestoneInline(admin.TabularInline):
    model = ProjectMilestone
    extra = 0


class ProjectCostLineInline(admin.TabularInline):
    model = ProjectCostLine
    extra = 0


class ProjectDocumentInline(admin.TabularInline):
    model = ProjectDocument
    extra = 0


ProjectAdmin.inlines = [ProjectMilestoneInline, ProjectCostLineInline, ProjectDocumentInline]
