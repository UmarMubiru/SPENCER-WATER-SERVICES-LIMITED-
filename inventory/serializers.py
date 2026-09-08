from rest_framework import serializers

from inventory.models import (
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
    ToolAccountability,
)


class CategorySerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "description", "is_active", "item_count", "created_at", "updated_at")
        read_only_fields = ("item_count",)

    def get_item_count(self, obj):
        return obj.inventory_items.count() + obj.products.count()

    def to_internal_value(self, data):
        data = data.copy()
        if "isActive" in data and "is_active" not in data:
            data["is_active"] = data.pop("isActive")
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["isActive"] = data["is_active"]
        data["itemCount"] = data["item_count"]
        data["createdAt"] = data["created_at"]
        data["updatedAt"] = data["updated_at"]
        return data

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
    inventory_type = serializers.ChoiceField(
        choices=InventoryItem.InventoryType.choices,
        required=False,
        default=InventoryItem.InventoryType.MATERIAL,
    )
    # Allocated by the server before opening the form; never typed by users.
    sku = serializers.CharField(required=False)
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
            "category", "category_name", "unit", "inventory_type",
            "quantity", "reorder_level", "unit_cost", "status",
            "supplier", "supplier_name", "warehouse",
            "initial_quantity", "movement_reason", "transaction_date",
            "created_at", "updated_at",
        )
        read_only_fields = ("quantity",)  # quantity only changes via StockMovement
        extra_kwargs = {"sku": {"required": False}}

    def to_internal_value(self, data):
        data = data.copy()
        key_map = {
            "initialQuantity": "initial_quantity",
            "movementReason": "movement_reason",
            "transactionDate": "transaction_date",
            "unitCost": "unit_cost",
            "reorderLevel": "reorder_level",
            "inventoryType": "inventory_type",
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
        data["inventoryType"] = data.get("inventory_type")
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
        from inventory.services.movement_service import MovementService

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
                reference=item.sku,
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
    category_name = serializers.CharField(
        source="inventory_item.category.name", read_only=True, default=""
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
            "category_name",
            "movement_type", "reason", "notes", "reference",
            "quantity", "quantity_before", "quantity_after",
            "reorder_level", "status_after",
            "transaction_date", "supplier", "supplier_name",
            "performed_by", "performed_by_name", "material_request",
            "created_at",
        )
        read_only_fields = ("performed_by", "quantity_before", "quantity_after")

    def get_status_after(self, obj):
        if obj.quantity_after <= 0:
            return "OUT_OF_STOCK"
        if obj.quantity_after <= obj.inventory_item.reorder_level:
            return "LOW_STOCK"
        return "IN_STOCK"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["inventoryItem"] = data.pop("inventory_item")
        data["inventoryItemName"] = data.pop("inventory_item_name")
        data["inventoryItemSku"] = data.pop("inventory_item_sku")
        data["categoryName"] = data.pop("category_name")
        data["movementType"] = data.pop("movement_type")
        data["quantityBefore"] = data.pop("quantity_before")
        data["quantityAfter"] = data.pop("quantity_after")
        data["reorderLevel"] = data.pop("reorder_level")
        data["statusAfter"] = data.pop("status_after")
        data["transactionDate"] = data.pop("transaction_date")
        data["supplierName"] = data.pop("supplier_name")
        data["performedBy"] = data.pop("performed_by")
        data["performedByName"] = data.pop("performed_by_name")
        data["createdAt"] = data.pop("created_at")
        return data


class MaterialRequestItemSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(
        source="inventory_item.name", read_only=True
    )
    inventory_item_sku = serializers.CharField(
        source="inventory_item.sku", read_only=True
    )
    inventory_item_type = serializers.CharField(
        source="inventory_item.inventory_type", read_only=True
    )
    quantity_remaining = serializers.SerializerMethodField()
    responsible_person_name = serializers.CharField(
        source="responsible_person.get_full_name", read_only=True, default=""
    )

    class Meta:
        model = MaterialRequestItem
        fields = (
            "id", "inventory_item", "inventory_item_name", "inventory_item_sku", "inventory_item_type",
            "quantity_requested", "quantity_approved", "quantity_issued",
            "quantity_remaining",
            "responsible_person", "responsible_person_name",
            "expected_return_date", "actual_return_date",
            "condition_at_issue", "condition_at_return", "return_notes",
        )
        read_only_fields = ("quantity_approved", "quantity_issued", "actual_return_date", "condition_at_return")

    def get_quantity_remaining(self, obj):
        authorized = obj.quantity_approved if obj.quantity_approved is not None else obj.quantity_requested
        return max(authorized - obj.quantity_issued, 0)

    def to_internal_value(self, data):
        data = data.copy()
        key_map = {
            "inventoryItem": "inventory_item",
            "quantityRequested": "quantity_requested",
            "responsiblePerson": "responsible_person",
            "expectedReturnDate": "expected_return_date",
        }
        for old_key, new_key in key_map.items():
            if old_key in data and new_key not in data:
                data[new_key] = data.pop(old_key)
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.update({
            "inventoryItem": data["inventory_item"], "inventoryItemName": data["inventory_item_name"],
            "inventoryItemSku": data["inventory_item_sku"], "quantityRequested": data["quantity_requested"],
            "quantityApproved": data["quantity_approved"], "quantityIssued": data["quantity_issued"],
            "quantityRemaining": data["quantity_remaining"],
            "inventoryItemType": data["inventory_item_type"],
            "responsiblePerson": data["responsible_person"],
            "responsiblePersonName": data["responsible_person_name"],
            "expectedReturnDate": data["expected_return_date"],
            "actualReturnDate": data["actual_return_date"],
            "conditionAtIssue": data["condition_at_issue"],
            "conditionAtReturn": data["condition_at_return"],
            "returnNotes": data["return_notes"],
        })
        return data


class MaterialRequestSerializer(serializers.ModelSerializer):
    items = MaterialRequestItemSerializer(many=True)
    requested_by_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()
    fulfillment_status = serializers.CharField(read_only=True)

    @staticmethod
    def _user_display_name(user):
        """Return a useful label even when the account has no first/last name."""
        if not user:
            return ""

        full_name = user.get_full_name().strip() if hasattr(user, "get_full_name") else ""
        return full_name or getattr(user, "username", "") or getattr(user, "email", "")

    def get_requested_by_name(self, request):
        return self._user_display_name(request.requested_by)

    def get_reviewed_by_name(self, request):
        return self._user_display_name(request.reviewed_by)

    def get_issued_by_name(self, request):
        return self._user_display_name(request.issued_by)

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
        # Extract tool-specific fields from items
        material_request_items = []
        for item_data in items_data:
            responsible_person = item_data.pop("responsiblePerson", None)
            expected_return_date = item_data.pop("expectedReturnDate", None)
            material_request_items.append(
                MaterialRequestItem(
                    request=request,
                    responsible_person=responsible_person,
                    expected_return_date=expected_return_date,
                    **item_data
                )
            )
        MaterialRequestItem.objects.bulk_create(material_request_items)
        return request

    def to_internal_value(self, data):
        data = data.copy()
        key_map = {"projectId": "project_id", "projectName": "project_name"}
        for old_key, new_key in key_map.items():
            if old_key in data and new_key not in data:
                data[new_key] = data.pop(old_key)
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.update({
            "requestNumber": data["request_number"], "projectId": data["project_id"],
            "projectName": data["project_name"], "requestedBy": data["requested_by"],
            "requestedByName": data["requested_by_name"], "reviewedBy": data["reviewed_by"],
            "reviewedByName": data["reviewed_by_name"], "reviewedAt": data["reviewed_at"],
            "reviewNotes": data["review_notes"], "issuedBy": data["issued_by"],
            "issuedByName": data["issued_by_name"], "issuedAt": data["issued_at"],
            "fulfillmentStatus": data["fulfillment_status"], "createdAt": data["created_at"],
            "updatedAt": data["updated_at"],
        })
        return data


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


class ToolAccountabilitySerializer(serializers.ModelSerializer):
    tool_name = serializers.CharField(source="tool.name", read_only=True)
    tool_sku = serializers.CharField(source="tool.sku", read_only=True)
    responsible_person_name = serializers.CharField(
        source="responsible_person.get_full_name", read_only=True, default=""
    )
    accountable_person_name = serializers.CharField(
        source="accountable_person.get_full_name", read_only=True, default=""
    )
    approved_by_name = serializers.CharField(
        source="approved_by.get_full_name", read_only=True, default=""
    )

    class Meta:
        model = ToolAccountability
        fields = (
            "id", "tool", "tool_name", "tool_sku",
            "project_id", "project_name",
            "material_request", "material_request_item",
            "responsible_person", "responsible_person_name",
            "issued_date", "expected_return_date", "actual_return_date",
            "condition_at_issue", "condition_at_return",
            "status", "damage_description", "loss_description",
            "estimated_value", "accountable_person", "accountable_person_name",
            "resolution", "resolved_at", "approved_by", "approved_by_name",
            "notes", "created_at", "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")

    def to_internal_value(self, data):
        data = data.copy()
        key_map = {
            "projectId": "project_id", "projectName": "project_name",
            "expectedReturnDate": "expected_return_date",
            "actualReturnDate": "actual_return_date",
            "conditionAtIssue": "condition_at_issue",
            "conditionAtReturn": "condition_at_return",
            "damageDescription": "damage_description",
            "lossDescription": "loss_description",
            "estimatedValue": "estimated_value",
            "accountablePerson": "accountable_person",
            "resolvedAt": "resolved_at", "approvedBy": "approved_by",
        }
        for old_key, new_key in key_map.items():
            if old_key in data and new_key not in data:
                data[new_key] = data.pop(old_key)
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.update({
            "toolName": data["tool_name"], "toolSku": data["tool_sku"],
            "projectId": data["project_id"], "projectName": data["project_name"],
            "responsiblePerson": data["responsible_person"],
            "responsiblePersonName": data["responsible_person_name"],
            "expectedReturnDate": data["expected_return_date"],
            "actualReturnDate": data["actual_return_date"],
            "conditionAtIssue": data["condition_at_issue"],
            "conditionAtReturn": data["condition_at_return"],
            "damageDescription": data["damage_description"],
            "lossDescription": data["loss_description"],
            "estimatedValue": data["estimated_value"],
            "accountablePerson": data["accountable_person"],
            "accountablePersonName": data["accountable_person_name"],
            "resolvedAt": data["resolved_at"], "approvedBy": data["approved_by"],
            "approvedByName": data["approved_by_name"], "createdAt": data["created_at"],
            "updatedAt": data["updated_at"],
        })
        return data
