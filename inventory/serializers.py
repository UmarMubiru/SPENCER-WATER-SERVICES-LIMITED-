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
            "id", "name", "email", "phone", "address", "status",
            "created_at", "updated_at",
        )


class InventoryItemSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, default="")

    class Meta:
        model = InventoryItem
        fields = (
            "id", "sku", "barcode", "name", "description",
            "category", "category_name", "unit",
            "quantity", "reorder_level", "unit_cost", "status",
            "supplier", "supplier_name", "warehouse",
            "created_at", "updated_at",
        )
        read_only_fields = ("quantity",)  # quantity only changes via StockMovement

    def validate_sku(self, value):
        qs = InventoryItem.objects.filter(sku=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("SKU already exists.")
        return value


class ProductSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, default="")

    class Meta:
        model = Product
        fields = (
            "id", "sku", "barcode", "name", "description",
            "category", "category_name", "unit",
            "quantity", "reorder_level", "cost_price", "selling_price", "status",
            "supplier", "supplier_name", "is_active",
            "created_at", "updated_at",
        )

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
    performed_by_name = serializers.CharField(
        source="performed_by.get_full_name", read_only=True, default=""
    )

    class Meta:
        model = StockMovement
        fields = (
            "id", "inventory_item", "inventory_item_name", "inventory_item_sku",
            "movement_type", "quantity", "reason", "reference",
            "performed_by", "performed_by_name", "created_at",
        )
        read_only_fields = ("performed_by",)


class MaterialRequestItemSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(
        source="inventory_item.name", read_only=True
    )
    inventory_item_sku = serializers.CharField(
        source="inventory_item.sku", read_only=True
    )

    class Meta:
        model = MaterialRequestItem
        fields = (
            "id", "inventory_item", "inventory_item_name", "inventory_item_sku",
            "quantity_requested", "quantity_approved",
        )


class MaterialRequestSerializer(serializers.ModelSerializer):
    items = MaterialRequestItemSerializer(many=True)
    requested_by_name = serializers.CharField(
        source="requested_by.get_full_name", read_only=True, default=""
    )

    class Meta:
        model = MaterialRequest
        fields = (
            "id", "project_id", "project_name", "department",
            "requested_by", "requested_by_name", "status", "notes",
            "items", "created_at", "updated_at",
        )
        read_only_fields = ("requested_by", "status")

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        request = MaterialRequest.objects.create(**validated_data)
        MaterialRequestItem.objects.bulk_create(
            [MaterialRequestItem(request=request, **item) for item in items_data]
        )
        return request


class SalesQuotationItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
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

    def get_product_name(self, obj):
        return obj.product.name


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
    inventory_item_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
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

    def get_inventory_item_name(self, obj):
        return obj.inventory_item.name if obj.inventory_item else ""

    def get_product_name(self, obj):
        return obj.product.name if obj.product else ""


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
