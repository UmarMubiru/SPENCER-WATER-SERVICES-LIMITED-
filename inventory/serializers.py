from rest_framework import serializers # type: ignore

from .models import (
    Category,
    InventoryItem,
    MaterialRequest,
    MaterialRequestItem,
    StockMovement,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'description',
            'is_active',
            'created_at',
            'updated_at',
        ]


class InventoryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = InventoryItem
        fields = [
            'id',
            'item_code',
            'name',
            'description',
            'unit',
            'quantity',
            'reorder_level',
            'unit_cost',
            'is_active',
            'category',
            'category_name',
            'created_at',
            'updated_at',
        ]


class MaterialRequestItemSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(source='inventory_item.name', read_only=True)
    inventory_item_code = serializers.CharField(source='inventory_item.item_code', read_only=True)
    
    class Meta:
        model = MaterialRequestItem
        fields = [
            'id',
            'inventory_item',
            'inventory_item_name',
            'inventory_item_code',
            'requested_quantity',
            'approved_quantity',
            'issued_quantity',
            'remarks',
        ]


class MaterialRequestSerializer(serializers.ModelSerializer):
    items = MaterialRequestItemSerializer(many=True, read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.username', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True)
    
    class Meta:
        model = MaterialRequest
        fields = [
            'id',
            'request_number',
            'project_reference',
            'requested_by',
            'requested_by_name',
            'approved_by',
            'approved_by_name',
            'status',
            'remarks',
            'requested_at',
            'approved_at',
            'items',
        ]


class StockMovementSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(source='inventory_item.name', read_only=True)
    inventory_item_code = serializers.CharField(source='inventory_item.item_code', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id',
            'inventory_item',
            'inventory_item_name',
            'inventory_item_code',
            'movement_type',
            'quantity',
            'balance_before',
            'balance_after',
            'reference_type',
            'reference_id',
            'performed_by',
            'performed_by_name',
            'remarks',
            'created_at',
        ]
