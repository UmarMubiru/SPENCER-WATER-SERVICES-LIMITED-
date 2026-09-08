from django.utils import timezone
from datetime import timedelta
from .models import MetricSnapshot, Alert


def notify_low_stock(alert, item):
    """Create one unread in-app notification per eligible user for an alert."""
    from django.contrib.auth import get_user_model
    from notifications.models import Notification, NotificationPreference

    User = get_user_model()
    for user in User.objects.filter(is_active=True):
        preference = NotificationPreference.objects.filter(user=user).first()
        if preference and not preference.in_app_inventory:
            continue

        # An alert remains open until resolved. Tie the notice to that alert so
        # repeated analytics refreshes never flood the notification bell.
        if Notification.objects.filter(
            recipient=user,
            notification_type='inventory_low',
            metadata__alert_id=str(alert.id),
        ).exists():
            continue

        Notification.objects.create(
            recipient=user,
            notification_type='inventory_low',
            title=f"Low stock: {item.name}",
            message=(
                f"{item.name} has {item.quantity} {item.unit or 'unit(s)'} remaining "
                f"(reorder level: {item.reorder_level})."
            ),
            metadata={
                'alert_id': str(alert.id),
                'inventory_item_id': str(item.id),
                'href': '/admin/inventory/dashboard',
            },
        )


def compute_daily_snapshots():
    from employees.models import Employee
    from django.db.models import F

    today = timezone.now().date()

    total = Employee.objects.count()
    available = Employee.objects.filter(status='available').count()
    availability_rate = round((available / total) * 100, 2) if total else 0

    MetricSnapshot.objects.update_or_create(
        metric_key='employee_availability_rate', snapshot_date=today,
        defaults={'value': availability_rate}
    )
    # repeat this pattern for each metric worth trending —
    # quotation_success_rate, avg_project_completion_days, inventory_turnover, etc.


def generate_alerts():
    from employees.models import Employee
    from inventory.models import InventoryItem
    from django.db.models import F

    today = timezone.now().date()

    for emp in Employee.objects.filter(contract_end_date__range=(today, today + timedelta(days=14))):
        Alert.objects.get_or_create(
            title=f"Contract Expiring: {emp.full_name}",
            category='contract_expiring',
            reference_type='Employee',
            reference_id=str(emp.id),
            status='open',
            defaults={
                'priority': 'high',
                'description': f"{emp.full_name}'s contract expires {emp.contract_end_date}",
                'metadata': {},
            }
        )
    low_stock_items = InventoryItem.objects.filter(quantity__lte=F('reorder_level'))
    low_stock_ids = [str(item_id) for item_id in low_stock_items.values_list('id', flat=True)]

    # Once stock recovers, close the current alert. If it falls again later,
    # a new alert and fresh unread notification will be created.
    Alert.objects.filter(
        category='low_stock',
        reference_type='InventoryItem',
        status='open',
    ).exclude(reference_id__in=low_stock_ids).update(status='resolved')

    for item in low_stock_items:
        alert, _ = Alert.objects.get_or_create(
            title=f"Low Stock: {item.name}",
            category='low_stock',
            reference_type='InventoryItem',
            reference_id=str(item.id),
            status='open',
            defaults={
                'priority': 'medium',
                'description': f"{item.name} is below reorder level ({item.quantity} remaining)",
                'metadata': {},
            }
        )
        notify_low_stock(alert, item)
