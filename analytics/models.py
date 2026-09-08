from django.db import models
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F
import uuid


class DashboardMetric(models.Model):
    """Stores cached dashboard metrics for performance"""
    METRIC_TYPE_CHOICES = [
        ('funnel', 'Sales Funnel'),
        ('pipeline', 'Sales Pipeline'),
        ('revenue', 'Revenue'),
        ('projects', 'Projects'),
        ('employees', 'Employees'),
        ('inventory', 'Inventory'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    metric_type = models.CharField(max_length=20, choices=METRIC_TYPE_CHOICES)
    metric_name = models.CharField(max_length=100)
    metric_value = models.JSONField(default=dict)
    period = models.CharField(max_length=20, default='daily')  # daily, weekly, monthly, yearly
    period_start = models.DateField()
    period_end = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-period_end', 'metric_type']
        unique_together = ['metric_type', 'metric_name', 'period', 'period_start', 'period_end']
        indexes = [
            models.Index(fields=['metric_type']),
            models.Index(fields=['period']),
            models.Index(fields=['period_end']),
        ]
    
    def __str__(self):
        return f"{self.metric_name} ({self.period})"


class SalesFunnelMetric(models.Model):
    """Tracks sales funnel metrics across stages"""
    STAGE_CHOICES = [
        ('lead', 'Lead'),
        ('qualified', 'Qualified'),
        ('quotation_sent', 'Quotation Sent'),
        ('quotation_review', 'Quotation Review'),
        ('quotation_approved', 'Quotation Approved'),
        ('accepted', 'Accepted'),
        ('project_created', 'Project Created'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stage = models.CharField(max_length=30, choices=STAGE_CHOICES)
    count = models.PositiveIntegerField(default=0)
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Conversion rate from previous stage")
    
    period = models.CharField(max_length=20, default='monthly')
    period_start = models.DateField()
    period_end = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-period_end', 'stage']
        unique_together = ['stage', 'period', 'period_start', 'period_end']
        indexes = [
            models.Index(fields=['stage']),
            models.Index(fields=['period']),
            models.Index(fields=['period_end']),
        ]
    
    def __str__(self):
        return f"{self.get_stage_display()} - {self.period_end}"


class SalesPipelineMetric(models.Model):
    """Tracks sales pipeline and win rate metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    total_leads = models.PositiveIntegerField(default=0)
    qualified_leads = models.PositiveIntegerField(default=0)
    quotations_sent = models.PositiveIntegerField(default=0)
    quotations_accepted = models.PositiveIntegerField(default=0)
    quotations_rejected = models.PositiveIntegerField(default=0)
    
    total_quotation_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    won_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    lost_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    win_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    average_deal_size = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    average_sales_cycle_days = models.PositiveIntegerField(default=0)
    
    period = models.CharField(max_length=20, default='monthly')
    period_start = models.DateField()
    period_end = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-period_end']
        unique_together = ['period', 'period_start', 'period_end']
        indexes = [
            models.Index(fields=['period']),
            models.Index(fields=['period_end']),
        ]
    
    def __str__(self):
        return f"Pipeline - {self.period_end}"


class RevenueMetric(models.Model):
    """Tracks revenue and growth metrics"""
    REVENUE_TYPE_CHOICES = [
        ('total', 'Total Revenue'),
        ('project', 'Project Revenue'),
        ('service', 'Service Revenue'),
        ('product', 'Product Revenue'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    revenue_type = models.CharField(max_length=20, choices=REVENUE_TYPE_CHOICES)
    
    gross_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    cost_of_goods_sold = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    gross_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    gross_margin = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    operating_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    operating_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    operating_margin = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    growth_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Growth rate compared to previous period")
    
    period = models.CharField(max_length=20, default='monthly')
    period_start = models.DateField()
    period_end = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-period_end']
        unique_together = ['revenue_type', 'period', 'period_start', 'period_end']
        indexes = [
            models.Index(fields=['revenue_type']),
            models.Index(fields=['period']),
            models.Index(fields=['period_end']),
        ]
    
    def __str__(self):
        return f"{self.get_revenue_type_display()} - {self.period_end}"


class ProjectMetric(models.Model):
    """Tracks project and resource metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    total_projects = models.PositiveIntegerField(default=0)
    active_projects = models.PositiveIntegerField(default=0)
    completed_projects = models.PositiveIntegerField(default=0)
    on_hold_projects = models.PositiveIntegerField(default=0)
    
    total_project_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    average_project_duration_days = models.PositiveIntegerField(default=0)
    on_time_completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    total_employees = models.PositiveIntegerField(default=0)
    active_employees = models.PositiveIntegerField(default=0)
    average_workload_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    period = models.CharField(max_length=20, default='monthly')
    period_start = models.DateField()
    period_end = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-period_end']
        unique_together = ['period', 'period_start', 'period_end']
        indexes = [
            models.Index(fields=['period']),
            models.Index(fields=['period_end']),
        ]
    
    def __str__(self):
        return f"Projects - {self.period_end}"


class InventoryMetric(models.Model):
    """Tracks inventory and procurement metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    total_items = models.PositiveIntegerField(default=0)
    low_stock_items = models.PositiveIntegerField(default=0)
    out_of_stock_items = models.PositiveIntegerField(default=0)
    
    total_inventory_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_procurement_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    average_stock_turnover_days = models.PositiveIntegerField(default=0)
    stockout_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    period = models.CharField(max_length=20, default='monthly')
    period_start = models.DateField()
    period_end = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-period_end']
        unique_together = ['period', 'period_start', 'period_end']
        indexes = [
            models.Index(fields=['period']),
            models.Index(fields=['period_end']),
        ]
    
    def __str__(self):
        return f"Inventory - {self.period_end}"


class CalendarMetric(models.Model):
    """Tracks calendar event metrics for CRM activities"""
    EVENT_TYPE_CHOICES = [
        ('site_visit', 'Site Visit'),
        ('follow_up', 'Follow Up'),
        ('meeting', 'Meeting'),
        ('task', 'Task'),
        ('quotation_expiry', 'Quotation Expiry'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    
    total_events = models.PositiveIntegerField(default=0)
    completed_events = models.PositiveIntegerField(default=0)
    pending_events = models.PositiveIntegerField(default=0)
    cancelled_events = models.PositiveIntegerField(default=0)
    
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    period = models.CharField(max_length=20, default='monthly')
    period_start = models.DateField()
    period_end = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-period_end', 'event_type']
        unique_together = ['event_type', 'period', 'period_start', 'period_end']
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['period']),
            models.Index(fields=['period_end']),
        ]
    
    def __str__(self):
        return f"{self.get_event_type_display()} - {self.period_end}"
