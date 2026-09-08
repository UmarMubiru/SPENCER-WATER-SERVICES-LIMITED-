from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardMetricViewSet, SalesFunnelMetricViewSet, SalesPipelineMetricViewSet,
    RevenueMetricViewSet, ProjectMetricViewSet, InventoryMetricViewSet, CalendarMetricViewSet
)

router = DefaultRouter()
router.register(r'dashboard-metrics', DashboardMetricViewSet, basename='dashboard-metric')
router.register(r'sales-funnel', SalesFunnelMetricViewSet, basename='sales-funnel')
router.register(r'sales-pipeline', SalesPipelineMetricViewSet, basename='sales-pipeline')
router.register(r'revenue', RevenueMetricViewSet, basename='revenue')
router.register(r'projects', ProjectMetricViewSet, basename='project-metric')
router.register(r'inventory', InventoryMetricViewSet, basename='inventory-metric')
router.register(r'calendar', CalendarMetricViewSet, basename='calendar-metric')

urlpatterns = [
    path('', include(router.urls)),
]
