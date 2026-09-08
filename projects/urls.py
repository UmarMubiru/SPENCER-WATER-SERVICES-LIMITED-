from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    ProjectMilestoneViewSet,
    ProjectDocumentViewSet,
    ProjectCostLineViewSet,
    ProjectHistoryViewSet,
    ProjectTeamAssignmentHistoryViewSet,
    ProjectRoleAllocationViewSet,
    ProjectRoleViewSet,
    CasualWorkerViewSet,
    CasualWorkerAttendanceViewSet,
    CasualWorkTaskViewSet,
    CasualWorkAssignmentViewSet,
    CasualWorkProgressViewSet,
    ProjectFieldHistoryViewSet,
    ProjectActivityViewSet,
    ActivityResourceViewSet,
    ActivityImageViewSet,
    ProjectResourceAllocationViewSet,
    ProjectFundTransactionViewSet,
    public_projects,
    public_project_detail,
)

router = DefaultRouter()
router.register(r"milestones", ProjectMilestoneViewSet, basename="project-milestones")
router.register(r"documents", ProjectDocumentViewSet, basename="project-documents")
router.register(r"cost-lines", ProjectCostLineViewSet, basename="project-cost-lines")
router.register(r"history", ProjectHistoryViewSet, basename="project-history")
router.register(r"assignments", ProjectTeamAssignmentHistoryViewSet, basename="project-assignments")
router.register(r"role_allocations", ProjectRoleAllocationViewSet, basename="role-allocations")
router.register(r"roles", ProjectRoleViewSet, basename="project-roles")
router.register(r"casual_workers", CasualWorkerViewSet, basename="casual-workers")
router.register(r"casual_attendance", CasualWorkerAttendanceViewSet, basename="casual-attendance")
router.register(r"casual_work_tasks", CasualWorkTaskViewSet, basename="casual-work-tasks")
router.register(r"casual_work_assignments", CasualWorkAssignmentViewSet, basename="casual-work-assignments")
router.register(r"casual_work_progress", CasualWorkProgressViewSet, basename="casual-work-progress")
router.register(r"field_history", ProjectFieldHistoryViewSet, basename="project-field-history")
router.register(r"activities", ProjectActivityViewSet, basename="project-activities")
router.register(r"activity_resources", ActivityResourceViewSet, basename="activity-resources")
router.register(r"activity_images", ActivityImageViewSet, basename="activity-images")
router.register(r"resource_allocations", ProjectResourceAllocationViewSet, basename="resource-allocations")
router.register(r"fund_transactions", ProjectFundTransactionViewSet, basename="fund-transactions")
# Register the catch-all project routes last.  Its detail route (/<pk>/) would
# otherwise treat named resources such as /casual_workers/ as a project ID.
router.register(r"", ProjectViewSet, basename="projects")

urlpatterns = [
    path("public/", public_projects, name="public-projects"),
    path("public/<uuid:project_id>/", public_project_detail, name="public-project-detail"),
    # Keep the earlier hyphenated URL working for open browser tabs while the
    # current router action uses Django REST Framework's underscore form.
    path("<uuid:pk>/fund-summary/", ProjectViewSet.as_view({"get": "fund_summary"}), name="projects-fund-summary-legacy"),
    path("", include(router.urls)),
]
