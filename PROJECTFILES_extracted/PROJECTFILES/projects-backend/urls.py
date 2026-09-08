from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    ProjectMilestoneViewSet,
    ProjectDocumentViewSet,
    ProjectCostLineViewSet,
    ProjectHistoryViewSet,
    ProjectTeamAssignmentHistoryViewSet,
    ProjectFieldHistoryViewSet,
    ActivityUpdateHistoryViewSet,
    ProjectActivityViewSet,
)

router = DefaultRouter()
router.register(r"documents", ProjectDocumentViewSet, basename="project-documents")
router.register(r"milestones", ProjectMilestoneViewSet, basename="project-milestones")
router.register(r"cost-lines", ProjectCostLineViewSet, basename="project-cost-lines")
router.register(r"history", ProjectHistoryViewSet, basename="project-history")
router.register(r"assignments", ProjectTeamAssignmentHistoryViewSet, basename="project-assignments")
router.register(r"field-history", ProjectFieldHistoryViewSet, basename="project-field-history")
router.register(r"activity-updates", ActivityUpdateHistoryViewSet, basename="activity-updates")
router.register(r"activities", ProjectActivityViewSet, basename="project-activities")
router.register(r"", ProjectViewSet, basename="projects")

urlpatterns = [
    path("", include(router.urls)),
]
