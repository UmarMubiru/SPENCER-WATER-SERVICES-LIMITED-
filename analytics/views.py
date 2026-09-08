from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, Avg
from .models import (
    DashboardMetric, SalesFunnelMetric, SalesPipelineMetric,
    RevenueMetric, ProjectMetric, InventoryMetric, CalendarMetric
)
from .serializers import (
    DashboardMetricSerializer, SalesFunnelMetricSerializer, SalesPipelineMetricSerializer,
    RevenueMetricSerializer, ProjectMetricSerializer, InventoryMetricSerializer, CalendarMetricSerializer
)


def log_system_activity(module, action, description, performed_by, reference_id=None, reference_type=None, old_value=None, new_value=None, department=None):
    """Helper function to log to centralized SystemActivity"""
    from reports.models import SystemActivity
    
    performed_by_name = performed_by.get_full_name() if performed_by else 'System'
    
    SystemActivity.objects.create(
        module=module,
        action=action,
        description=description,
        performed_by=performed_by,
        performed_by_name=performed_by_name,
        department=department or (getattr(performed_by, 'department', '') if performed.user else ''),
        reference_id=reference_id or '',
        reference_type=reference_type or '',
        old_value=old_value or {},
        new_value=new_value or {},
    )


class DashboardMetricViewSet(viewsets.ModelViewSet):
    queryset = DashboardMetric.objects.all()
    serializer_class = DashboardMetricSerializer
    
    def get_queryset(self):
        queryset = DashboardMetric.objects.all()
        metric_type = self.request.query_params.get('metric_type')
        period = self.request.query_params.get('period')
        
        if metric_type:
            queryset = queryset.filter(metric_type=metric_type)
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset


class SalesFunnelMetricViewSet(viewsets.ModelViewSet):
    queryset = SalesFunnelMetric.objects.all()
    serializer_class = SalesFunnelMetricSerializer
    
    def get_queryset(self):
        queryset = SalesFunnelMetric.objects.all()
        stage = self.request.query_params.get('stage')
        period = self.request.query_params.get('period')
        
        if stage:
            queryset = queryset.filter(stage=stage)
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset


class SalesPipelineMetricViewSet(viewsets.ModelViewSet):
    queryset = SalesPipelineMetric.objects.all()
    serializer_class = SalesPipelineMetricSerializer
    
    def get_queryset(self):
        queryset = SalesPipelineMetric.objects.all()
        period = self.request.query_params.get('period')
        
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset


class RevenueMetricViewSet(viewsets.ModelViewSet):
    queryset = RevenueMetric.objects.all()
    serializer_class = RevenueMetricSerializer
    
    def get_queryset(self):
        queryset = RevenueMetric.objects.all()
        revenue_type = self.request.query_params.get('revenue_type')
        period = self.request.query_params.get('period')
        
        if revenue_type:
            queryset = queryset.filter(revenue_type=revenue_type)
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset


class ProjectMetricViewSet(viewsets.ModelViewSet):
    queryset = ProjectMetric.objects.all()
    serializer_class = ProjectMetricSerializer
    
    def get_queryset(self):
        queryset = ProjectMetric.objects.all()
        period = self.request.query_params.get('period')
        
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset


class InventoryMetricViewSet(viewsets.ModelViewSet):
    queryset = InventoryMetric.objects.all()
    serializer_class = InventoryMetricSerializer
    
    def get_queryset(self):
        queryset = InventoryMetric.objects.all()
        period = self.request.query_params.get('period')
        
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset


class CalendarMetricViewSet(viewsets.ModelViewSet):
    queryset = CalendarMetric.objects.all()
    serializer_class = CalendarMetricSerializer
    
    def get_queryset(self):
        queryset = CalendarMetric.objects.all()
        event_type = self.request.query_params.get('event_type')
        period = self.request.query_params.get('period')
        
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset
