from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SystemActivityView, SecurityStatsView, AlertViewSet, ResolveAlertView,
    ExecutiveOverviewView, AnalyticsView,
    SavedReportViewSet, ScheduledReportViewSet, GenerateReportView, InsightsView,
)

router = DefaultRouter()
router.register('alerts', AlertViewSet)
router.register('saved-reports', SavedReportViewSet)
router.register('scheduled-reports', ScheduledReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('activity/', SystemActivityView.as_view()),
    path('activities/', SystemActivityView.as_view()),  # alias for /activity/
    path('security-stats/', SecurityStatsView.as_view()),
    path('alerts/<int:alert_id>/resolve/', ResolveAlertView.as_view()),
    path('executive-overview/', ExecutiveOverviewView.as_view()),
    path('analytics/', AnalyticsView.as_view()),
    path('generate/', GenerateReportView.as_view()),
    path('insights/', InsightsView.as_view()),
]
