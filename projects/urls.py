from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    ProjectMilestoneViewSet,
    ProjectDocumentViewSet,
    ProjectCostLineViewSet,
    ProjectHistoryViewSet,
    ProjectTeamAssignmentHistoryViewSet,
)

router = DefaultRouter()
router.register(r"", ProjectViewSet, basename="projects")
router.register(r"milestones", ProjectMilestoneViewSet, basename="project-milestones")
router.register(r"documents", ProjectDocumentViewSet, basename="project-documents")
router.register(r"cost-lines", ProjectCostLineViewSet, basename="project-cost-lines")
router.register(r"history", ProjectHistoryViewSet, basename="project-history")
router.register(r"assignments", ProjectTeamAssignmentHistoryViewSet, basename="project-assignments")

urlpatterns = [
    path("", include(router.urls)),
]
