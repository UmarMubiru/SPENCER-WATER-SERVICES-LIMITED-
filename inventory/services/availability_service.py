from django.db import models
from django.utils import timezone
from inventory.models import InventoryItem, StockMovement, MaterialRequestItem, MaterialRequest


class AvailabilityService:
    """Service for calculating tool availability and tracking tool assignments"""

    @staticmethod
    def is_company_tool(inventory_item: InventoryItem) -> bool:
        """A Company Tools category is accepted while existing items are being
        migrated to the explicit COMPANY_TOOL item type."""
        category_name = (inventory_item.category.name if inventory_item.category else '').strip().lower()
        return inventory_item.inventory_type == InventoryItem.InventoryType.COMPANY_TOOL or 'company' in category_name
    
    @staticmethod
    def get_tool_availability(inventory_item: InventoryItem):
        """
        Calculate availability for a company tool.
        
        For company tools, availability = total_quantity - quantity_currently_issued
        For materials, availability = quantity (standard inventory logic)
        """
        if not AvailabilityService.is_company_tool(inventory_item):
            # For materials, use standard inventory quantity
            return {
                "inventory_item": str(inventory_item.id),
                "inventory_type": inventory_item.inventory_type,
                "total_quantity": inventory_item.quantity,
                "issued_quantity": 0,
                "available_quantity": inventory_item.quantity,
                "status": inventory_item.status,
                "current_assignments": []
            }
        
        # For company tools, calculate issued quantity from material request items
        issued_quantity = MaterialRequestItem.objects.filter(
            inventory_item=inventory_item,
            quantity_issued__gt=0,
            actual_return_date__isnull=True  # Not yet returned
        ).aggregate(total_issued=models.Sum('quantity_issued'))['total_issued'] or 0
        
        available_quantity = max(inventory_item.quantity - issued_quantity, 0)
        
        # Get current assignments
        current_assignments = MaterialRequestItem.objects.filter(
            inventory_item=inventory_item,
            quantity_issued__gt=0,
            actual_return_date__isnull=True
        ).select_related(
            'request',
            'responsible_person'
        ).values(
            'request__project_id',
            'request__project_name',
            'request__request_number',
            'responsible_person__id',
            'responsible_person__first_name',
            'responsible_person__last_name',
            'quantity_issued',
            'expected_return_date'
        )
        
        return {
            "inventory_item": str(inventory_item.id),
            "inventory_type": InventoryItem.InventoryType.COMPANY_TOOL,
            "total_quantity": inventory_item.quantity,
            "issued_quantity": issued_quantity,
            "available_quantity": available_quantity,
            "status": "AVAILABLE" if available_quantity > 0 else "UNAVAILABLE",
            "current_assignments": list(current_assignments)
        }
    
    @staticmethod
    def get_available_tools(category=None, search=None, warehouse=None, available_only=True):
        """
        Get list of available company tools with optional filters.
        """
        queryset = InventoryItem.objects.filter(
            models.Q(inventory_type=InventoryItem.InventoryType.COMPANY_TOOL)
            | models.Q(category__name__icontains='company')
        ).select_related('category').distinct()
        
        if category:
            queryset = queryset.filter(category_id=category)
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(sku__icontains=search) |
                models.Q(description__icontains=search)
            )
        if warehouse:
            queryset = queryset.filter(warehouse__icontains=warehouse)
        
        tools = []
        for item in queryset:
            availability = AvailabilityService.get_tool_availability(item)
            if not available_only or availability['available_quantity'] > 0:
                tools.append({
                    **availability,
                    "sku": item.sku,
                    "name": item.name,
                    "category": item.category.name if item.category else None,
                    "warehouse": item.warehouse,
                    "unit": item.unit,
                })
        
        return tools
    
    @staticmethod
    def get_overdue_tools():
        """
        Get tools that are overdue for return (expected_return_date < today and not returned).
        """
        today = timezone.localdate()
        
        overdue_items = MaterialRequestItem.objects.filter(
            models.Q(inventory_item__inventory_type=InventoryItem.InventoryType.COMPANY_TOOL)
            | models.Q(inventory_item__category__name__icontains='company'),
            quantity_issued__gt=0,
            expected_return_date__lt=today,
            actual_return_date__isnull=True
        ).select_related(
            'inventory_item',
            'request',
            'responsible_person'
        )
        
        overdue = []
        for item in overdue_items:
            days_overdue = (today - item.expected_return_date).days
            overdue.append({
                "tool_id": str(item.inventory_item.id),
                "tool_name": item.inventory_item.name,
                "tool_sku": item.inventory_item.sku,
                "project_id": str(item.request.project_id) if item.request.project_id else None,
                "project_name": item.request.project_name,
                "request_number": item.request.request_number,
                "responsible_person": item.responsible_person.full_name if item.responsible_person else None,
                "responsible_person_id": str(item.responsible_person.id) if item.responsible_person else None,
                "due_date": item.expected_return_date.isoformat(),
                "days_overdue": days_overdue,
                "quantity_issued": item.quantity_issued
            })
        
        return overdue
    @staticmethod
    def is_company_tool(inventory_item: InventoryItem) -> bool:
        """Support the established Company Tools category during the transition
        to the explicit inventory_type field."""
        category_name = (inventory_item.category.name if inventory_item.category else '').strip().lower()
        return (
            inventory_item.inventory_type == InventoryItem.InventoryType.COMPANY_TOOL
            or category_name in {'company tools', 'company tool', 'company items', 'company item'}
        )
