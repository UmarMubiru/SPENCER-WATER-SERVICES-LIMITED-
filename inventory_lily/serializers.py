from rest_framework import serializers

from inventory_lily.models import (
    Category,
    InventoryItem,
    MaterialRequest,
    MaterialRequestItem,
    Product,
    SalesQuotation,
    SalesQuotationItem,
    StockMovement,
    Supplier,
    SupplierQuotation,
    SupplierQuotationItem,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "description", "created_at", "updated_at")

    def validate_name(self, value):
        qs = Category.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Category already exists.")
        return value


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = (
            "id", "name", "contact_person", "email", "phone", "address", "status",
            "created_at", "updated_at",
        )


class InventoryItemSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, default="")

    # Write-only: used only at creation time to record the item's opening
    # stock as a real StockMovement, rather than setting quantity directly.
    initial_quantity = serializers.IntegerField(
        write_only=True, required=False, default=0, min_value=0
    )
    movement_reason = serializers.ChoiceField(
        choices=[("PURCHASE", "Purchase"), ("RETURN", "Return")],
        write_only=True, required=False, default="PURCHASE",
    )
    transaction_date = serializers.DateTimeField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = InventoryItem
        fields = (
            "id", "sku", "barcode", "name", "description",
            "category", "category_name", "unit",
            "quantity", "reorder_level", "unit_cost", "status",
            "supplier", "supplier_name", "warehouse",
            "initial_quantity", "movement_reason", "transaction_date",
            "created_at", "updated_at",
        )
        read_only_fields = ("quantity",)  # quantity only changes via StockMovement

    def to_internal_value(self, data):
        data = data.copy()
        key_map = {
            "initialQuantity": "initial_quantity",
            "movementReason": "movement_reason",
            "transactionDate": "transaction_date",
            "unitCost": "unit_cost",
            "reorderLevel": "reorder_level",
            "supplierName": "supplier",
            "categoryName": "category",
        }
        for old_key, new_key in key_map.items():
            if old_key in data and new_key not in data:
                data[new_key] = data.pop(old_key)
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["supplierName"] = data.get("supplier_name")
        data["categoryName"] = data.get("category_name")
        data["unitCost"] = data.get("unit_cost")
        data["reorderLevel"] = data.get("reorder_level")
        data["initialQuantity"] = data.get("initial_quantity")
        data["movementReason"] = data.get("movement_reason")
        data["transactionDate"] = data.get("transaction_date")
        return data

    def validate_sku(self, value):
        qs = InventoryItem.objects.filter(sku=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("SKU already exists.")
        return value

    def create(self, validated_data):
        from inventory_lily.services.movement_service import MovementService

        initial_quantity = validated_data.pop("initial_quantity", 0)
        movement_reason = validated_data.pop("movement_reason", "PURCHASE")
        transaction_date = validated_data.pop("transaction_date", None)

        item = super().create(validated_data)

        if initial_quantity:
            request = self.context.get("request")
            MovementService.record(
                inventory_item=item,
                movement_type="IN",
                quantity=initial_quantity,
                reason=movement_reason,
                notes="Opening stock recorded at item creation",
                transaction_date=transaction_date,
                supplier=item.supplier,
                performed_by=getattr(request, "user", None) if request else None,
            )
            item.refresh_from_db()

        return item


class ProductSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, default="")

    class Meta:
        model = Product
        fields = (
            "id", "sku", "barcode", "name", "description",
            "category", "category_name", "unit", "brand", "warehouse", "image",
            "quantity", "reorder_level", "cost_price", "selling_price", "status",
            "supplier", "supplier_name", "is_active",
            "created_at", "updated_at",
        )

    def to_internal_value(self, data):
        data = data.copy()
        key_map = {
            "reorderLevel": "reorder_level",
            "costPrice": "cost_price",
            "sellingPrice": "selling_price",
            "isActive": "is_active",
            "supplierName": "supplier",
            "categoryName": "category",
        }
        for old_key, new_key in key_map.items():
            if old_key in data and new_key not in data:
                data[new_key] = data.pop(old_key)
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["supplierName"] = data.get("supplier_name")
        data["categoryName"] = data.get("category_name")
        data["costPrice"] = data.get("cost_price")
        data["sellingPrice"] = data.get("selling_price")
        data["reorderLevel"] = data.get("reorder_level")
        data["isActive"] = data.get("is_active")
        return data

    def validate_sku(self, value):
        qs = Product.objects.filter(sku=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("SKU already exists.")
        return value


class StockMovementSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(
        source="inventory_item.name", read_only=True
    )
    inventory_item_sku = serializers.CharField(
        source="inventory_item.sku", read_only=True
    )
    reorder_level = serializers.IntegerField(
        source="inventory_item.reorder_level", read_only=True
    )
    performed_by_name = serializers.CharField(
        source="performed_by.get_full_name", read_only=True, default=""
    )
    supplier_name = serializers.CharField(source="supplier.name", read_only=True, default="")
    status_after = serializers.SerializerMethodField()

    class Meta:
        model = StockMovement
        fields = (
            "id", "inventory_item", "inventory_item_name", "inventory_item_sku",
            "movement_type", "reason", "notes", "reference",
            "quantity", "quantity_before", "quantity_after",
            "reorder_level", "status_after",
            "transaction_date", "supplier", "supplier_name",
            "performed_by", "performed_by_name", "created_at",
        )
        read_only_fields = ("performed_by", "quantity_before", "quantity_after")

    def get_status_after(self, obj):
        if obj.quantity_after <= 0:
            return "OUT_OF_STOCK"
        if obj.quantity_after <= obj.inventory_item.reorder_level:
            return "LOW_STOCK"
        return "IN_STOCK"


class MaterialRequestItemSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(
        source="inventory_item.name", read_only=True
    )
    inventory_item_sku = serializers.CharField(
        source="inventory_item.sku", read_only=True
    )
    quantity_remaining = serializers.SerializerMethodField()

    class Meta:
        model = MaterialRequestItem
        fields = (
            "id", "inventory_item", "inventory_item_name", "inventory_item_sku",
            "quantity_requested", "quantity_approved", "quantity_issued",
            "quantity_remaining",
        )
        read_only_fields = ("quantity_approved", "quantity_issued")

    def get_quantity_remaining(self, obj):
        authorized = obj.quantity_approved if obj.quantity_approved is not None else obj.quantity_requested
        return max(authorized - obj.quantity_issued, 0)


class MaterialRequestSerializer(serializers.ModelSerializer):
    items = MaterialRequestItemSerializer(many=True)
    requested_by_name = serializers.CharField(
        source="requested_by.get_full_name", read_only=True, default=""
    )
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.get_full_name", read_only=True, default=""
    )
    issued_by_name = serializers.CharField(
        source="issued_by.get_full_name", read_only=True, default=""
    )
    fulfillment_status = serializers.CharField(read_only=True)

    class Meta:
        model = MaterialRequest
        fields = (
            "id", "request_number", "project_id", "project_name", "department",
            "requested_by", "requested_by_name", "status", "notes",
            "reviewed_by", "reviewed_by_name", "reviewed_at", "review_notes",
            "issued_by", "issued_by_name", "issued_at",
            "fulfillment_status",
            "items", "created_at", "updated_at",
        )
        read_only_fields = (
            "requested_by", "status", "request_number",
            "reviewed_by", "reviewed_at", "review_notes",
            "issued_by", "issued_at",
        )

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        request = MaterialRequest.objects.create(**validated_data)
        MaterialRequestItem.objects.bulk_create(
            [MaterialRequestItem(request=request, **item) for item in items_data]
        )
        return request


class SalesQuotationItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True
    )

    class Meta:
        model = SalesQuotationItem
        fields = (
            "id", "product", "product_name", "product_sku",
            "quantity", "unit_price", "subtotal",
        )


class SalesQuotationSerializer(serializers.ModelSerializer):
    items = SalesQuotationItemSerializer(many=True)
    total = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = SalesQuotation
        fields = (
            "id", "customer_name", "customer_email", "status", "valid_until",
            "notes", "items", "total", "created_at", "updated_at",
        )

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        quotation = SalesQuotation.objects.create(**validated_data)
        SalesQuotationItem.objects.bulk_create(
            [SalesQuotationItem(quotation=quotation, **item) for item in items_data]
        )
        return quotation


class SupplierQuotationItemSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(
        source="inventory_item.name", read_only=True, default=""
    )
    product_name = serializers.CharField(source="product.name", read_only=True, default="")
    subtotal = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True
    )

    class Meta:
        model = SupplierQuotationItem
        fields = (
            "id", "inventory_item", "inventory_item_name",
            "product", "product_name",
            "quantity", "unit_price", "subtotal",
        )

    def validate(self, attrs):
        has_item = bool(attrs.get("inventory_item"))
        has_product = bool(attrs.get("product"))
        if has_item == has_product:  # both set, or neither set
            raise serializers.ValidationError(
                "Each line must reference exactly one of inventory_item or product."
            )
        return attrs


class SupplierQuotationSerializer(serializers.ModelSerializer):
    items = SupplierQuotationItemSerializer(many=True)
    total = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)

    class Meta:
        model = SupplierQuotation
        fields = (
            "id", "supplier", "supplier_name", "status", "valid_until",
            "notes", "items", "total", "created_at", "updated_at",
        )

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        quotation = SupplierQuotation.objects.create(**validated_data)
        SupplierQuotationItem.objects.bulk_create(
            [SupplierQuotationItem(quotation=quotation, **item) for item in items_data]
        )
        return quotation
