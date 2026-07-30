import uuid

from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base carrying created_at / updated_at for every inventory model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


# ---------------------------------------------------------------------------
# Category — shared between InventoryItem and Product
# ---------------------------------------------------------------------------

class Category(TimeStampedModel):
    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(blank=True)

    class Meta(TimeStampedModel.Meta):
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Supplier
# ---------------------------------------------------------------------------

class Supplier(TimeStampedModel):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"

    name = models.CharField(max_length=255)
    contactPerson = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    address = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.ACTIVE
    )

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# InventoryItem — internal stock consumed by projects (NOT sold to customers)
# ---------------------------------------------------------------------------

class InventoryItem(TimeStampedModel):
    sku = models.CharField(max_length=64, unique=True)
    barcode = models.CharField(max_length=64, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="inventory_items",
    )
    unit = models.CharField(max_length=32, default="pcs")

    quantity = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=0)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="inventory_items",
    )
    warehouse = models.CharField(max_length=128, blank=True)

    class Meta(TimeStampedModel.Meta):
        indexes = [models.Index(fields=["sku"]), models.Index(fields=["category"])]

    def __str__(self):
        return f"{self.sku} — {self.name}"

    @property
    def status(self):
        if self.quantity <= 0:
            return "OUT_OF_STOCK"
        if self.quantity <= self.reorder_level:
            return "LOW_STOCK"
        return "IN_STOCK"


# ---------------------------------------------------------------------------
# Product — customer-facing, sellable catalogue item
# ---------------------------------------------------------------------------

class Product(TimeStampedModel):
    sku = models.CharField(max_length=64, unique=True)
    barcode = models.CharField(max_length=64, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="products",
    )
    unit = models.CharField(max_length=32, default="pcs")

    quantity = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=0)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="products",
    )
    is_active = models.BooleanField(default=True)

    class Meta(TimeStampedModel.Meta):
        indexes = [models.Index(fields=["sku"]), models.Index(fields=["category"])]

    def __str__(self):
        return f"{self.sku} — {self.name}"

    @property
    def status(self):
        if self.quantity <= 0:
            return "OUT_OF_STOCK"
        if self.quantity <= self.reorder_level:
            return "LOW_STOCK"
        return "IN_STOCK"


# ---------------------------------------------------------------------------
# StockMovement — audit trail of InventoryItem quantity changes
# ---------------------------------------------------------------------------

class StockMovement(TimeStampedModel):
    class MovementType(models.TextChoices):
        IN = "IN", "Stock In"
        OUT = "OUT", "Stock Out"

    inventory_item = models.ForeignKey(
        InventoryItem, on_delete=models.CASCADE, related_name="movements"
    )
    movement_type = models.CharField(max_length=8, choices=MovementType.choices)
    quantity = models.PositiveIntegerField()
    reason = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=128, blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return f"{self.movement_type} {self.quantity} — {self.inventory_item.sku}"


# ---------------------------------------------------------------------------
# MaterialRequest — a project lead requesting InventoryItems for a project
# ---------------------------------------------------------------------------

class MaterialRequest(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        ISSUED = "ISSUED", "Issued"

    # Soft reference to the projects app. Swap for a real FK to projects.Project
    # once that model is confirmed — kept decoupled here on purpose.
    project_id = models.UUIDField(null=True, blank=True)
    project_name = models.CharField(max_length=255, blank=True)

    department = models.CharField(max_length=128, blank=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="material_requests",
    )
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.PENDING
    )
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Request {self.id} ({self.status})"


class MaterialRequestItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(
        MaterialRequest, on_delete=models.CASCADE, related_name="items"
    )
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT)
    quantity_requested = models.PositiveIntegerField()
    quantity_approved = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.quantity_requested} x {self.inventory_item.sku}"


# ---------------------------------------------------------------------------
# SalesQuotation — a customer-facing quote built from sellable Products
# (formerly "Quotation" — renamed for symmetry with SupplierQuotation below.
#  URL path stays /api/inventory/quotations/ to avoid breaking existing links.)
# ---------------------------------------------------------------------------

class SalesQuotation(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SENT = "SENT", "Sent"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        EXPIRED = "EXPIRED", "Expired"

    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField(blank=True)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.DRAFT
    )
    valid_until = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Sales Quotation {self.id} — {self.customer_name}"

    @property
    def total(self):
        return sum((item.subtotal for item in self.items.all()), 0)


class SalesQuotationItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation = models.ForeignKey(
        SalesQuotation, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)

    @property
    def subtotal(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.quantity} x {self.product.sku}"


# ---------------------------------------------------------------------------
# SupplierQuotation — an RFQ sent TO a supplier, asking for pricing on
# InventoryItems (restocking) or Products (rare, but supported). Each line
# item points at exactly one of inventory_item / product — enforced in the
# serializer, not the DB, to keep this a plain FK setup.
# ---------------------------------------------------------------------------

class SupplierQuotation(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SENT = "SENT", "Sent"
        RECEIVED = "RECEIVED", "Received"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    supplier = models.ForeignKey(
        Supplier, on_delete=models.PROTECT, related_name="supplier_quotations"
    )
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.DRAFT
    )
    valid_until = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Supplier Quotation {self.id} — {self.supplier.name}"

    @property
    def total(self):
        return sum((item.subtotal for item in self.items.all()), 0)


class SupplierQuotationItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation = models.ForeignKey(
        SupplierQuotation, on_delete=models.CASCADE, related_name="items"
    )
    inventory_item = models.ForeignKey(
        InventoryItem, on_delete=models.PROTECT, null=True, blank=True
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, null=True, blank=True
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)

    @property
    def subtotal(self):
        return self.quantity * self.unit_price

    def __str__(self):
        target = self.inventory_item or self.product
        return f"{self.quantity} x {target.sku if target else '—'}"
