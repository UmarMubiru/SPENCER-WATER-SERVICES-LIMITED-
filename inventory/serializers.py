from django.shortcuts import get_object_or_404 # type: ignore
from rest_framework import serializers # type: ignore

from .models import (
    Category,
    InventoryItem,
    MaterialRequest,
    MaterialRequestItem,
    StockMovement,
    MovementType,
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
        read_only_fields = [
            'approved_quantity',
            'issued_quantity',
        ]


class MaterialRequestSerializer(serializers.ModelSerializer):
    items = MaterialRequestItemSerializer(many=True)
    requested_by_name = serializers.CharField(source='requested_by.username', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True)
    rejected_by_name = serializers.CharField(source='rejected_by.username', read_only=True)
    
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
            'rejected_by',
            'rejected_by_name',
            'status',
            'remarks',
            'requested_at',
            'approved_at',
            'rejected_at',
            'items',
        ]
        read_only_fields = [
            'requested_by',
            'approved_by',
            'rejected_by',
            'approved_at',
            'rejected_at',
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        requested_by = validated_data.pop('requested_by', self.context['request'].user)

        material_request = MaterialRequest.objects.create(
            requested_by=requested_by,
            **validated_data,
        )

        for item_data in items_data:
            MaterialRequestItem.objects.create(
                material_request=material_request,
                **item_data,
            )

        return material_request


class StockMovementCreateSerializer(serializers.ModelSerializer):
    item_id = serializers.UUIDField(write_only=True)
    reference = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = StockMovement
        fields = [
            'item_id',
            'movement_type',
            'quantity',
            'reference_type',
            'reference',
            'remarks',
        ]

    def create(self, validated_data):
        item_id = validated_data.pop('item_id')
        validated_data.pop('reference', None)

        inventory_item = get_object_or_404(InventoryItem, id=item_id)
        user = self.context['request'].user
        movement_type = validated_data['movement_type']
        quantity = validated_data['quantity']
        reference_type = validated_data.get('reference_type', '')
        remarks = validated_data.get('remarks', '')

        before = inventory_item.quantity

        if movement_type == MovementType.ISSUE:
            if inventory_item.quantity < quantity:
                raise serializers.ValidationError({'quantity': 'Insufficient stock for this item.'})
            inventory_item.quantity -= quantity
        else:
            inventory_item.quantity += quantity

        inventory_item.save(update_fields=['quantity', 'updated_at'])
        after = inventory_item.quantity

        return StockMovement.objects.create(
            inventory_item=inventory_item,
            movement_type=movement_type,
            quantity=quantity,
            balance_before=before,
            balance_after=after,
            reference_type=reference_type,
            reference_id=None,
            performed_by=user,
            remarks=remarks,
        )


class StockMovementSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(source='inventory_item.name', read_only=True)
    inventory_item_code = serializers.CharField(source='inventory_item.item_code', read_only=True)
    item_id = serializers.UUIDField(source='inventory_item.id', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True)
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    reference = serializers.SerializerMethodField()
    notes = serializers.CharField(source='remarks', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id',
            'inventory_item',
            'item_id',
            'inventory_item_name',
            'inventory_item_code',
            'movement_type',
            'quantity',
            'balance_before',
            'balance_after',
            'reference_type',
            'reference_id',
            'reference',
            'performed_by',
            'performed_by_name',
            'notes',
            'timestamp',
        ]

    def get_reference(self, obj):
        return str(obj.reference_id) if obj.reference_id else ''
