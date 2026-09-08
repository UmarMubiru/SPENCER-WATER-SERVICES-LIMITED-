from rest_framework import serializers
from .models import (
    DashboardMetric, SalesFunnelMetric, SalesPipelineMetric,
    RevenueMetric, ProjectMetric, InventoryMetric, CalendarMetric
)


class DashboardMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardMetric
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class SalesFunnelMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesFunnelMetric
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class SalesPipelineMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesPipelineMetric
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class RevenueMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueMetric
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMetric
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class InventoryMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryMetric
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class CalendarMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarMetric
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
