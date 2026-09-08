import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


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
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)

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

    supplier_code = models.CharField(max_length=64, unique=True, blank=True, null=True)
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    address = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.ACTIVE
    )

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# InventoryItem — internal stock consumed by projects (NOT sold to customers)
# ---------------------------------------------------------------------------

class InventoryItem(TimeStampedModel):
    class InventoryType(models.TextChoices):
        MATERIAL = "MATERIAL", "Material"
        COMPANY_TOOL = "COMPANY_TOOL", "Company Tool"

    sku = models.CharField(max_length=64, unique=True)
    barcode = models.CharField(max_length=64, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="inventory_items",
    )
    unit = models.CharField(max_length=32, default="pcs")

    inventory_type = models.CharField(
        max_length=20,
        choices=InventoryType.choices,
        default=InventoryType.MATERIAL,
        help_text="Distinguish between consumable materials and reusable company tools"
    )

    quantity = models.PositiveIntegerField(default=0)
    initial_stock = models.PositiveIntegerField(default=0)
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

    def save(self, *args, **kwargs):
        """Assign the purchase number on the server, never from the form."""
        if not self.sku:
            self.sku = self._generate_purchase_number()
        # Set initial_stock on first creation if not set
        if self.pk is None and self.initial_stock == 0 and self.quantity > 0:
            self.initial_stock = self.quantity
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_purchase_number():
        from django.db import transaction

        today = timezone.localdate()
        with transaction.atomic():
            sequence, _ = PurchaseNumberSequence.objects.select_for_update().get_or_create(date=today)
            sequence.last_number += 1
            sequence.save(update_fields=["last_number"])
            return f"P-{today.strftime('%Y%m%d')}-{sequence.last_number:04d}"

    @property
    def status(self):
        if self.quantity <= 0:
            return "OUT_OF_STOCK"
        if self.quantity <= self.reorder_level:
            return "LOW_STOCK"
        return "IN_STOCK"


class PurchaseNumberSequence(models.Model):
    """Daily, locked sequence behind inventory purchase numbers."""
    date = models.DateField(unique=True)
    last_number = models.PositiveIntegerField(default=0)


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
    brand = models.CharField(max_length=128, blank=True)
    warehouse = models.CharField(max_length=128, blank=True)
    image = models.TextField(blank=True, default="")
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

    class MovementReason(models.TextChoices):
        PURCHASE = "PURCHASE", "Purchase"
        RETURN = "RETURN", "Return"
        REQUEST_ISSUE = "REQUEST_ISSUE", "Issued for Request"
        ADJUSTMENT = "ADJUSTMENT", "Adjustment"
        DAMAGED = "DAMAGED", "Damaged / Written Off"
        OTHER = "OTHER", "Other"

    inventory_item = models.ForeignKey(
        InventoryItem, on_delete=models.CASCADE, related_name="movements"
    )
    movement_type = models.CharField(max_length=8, choices=MovementType.choices)
    reason = models.CharField(
        max_length=16, choices=MovementReason.choices, default=MovementReason.OTHER
    )
    notes = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=128, blank=True)

    quantity = models.PositiveIntegerField()
    quantity_before = models.PositiveIntegerField(default=0)
    quantity_after = models.PositiveIntegerField(default=0)

    # When the purchase/return/etc. actually happened — distinct from
    # created_at, which is when the record was entered into the system.
    transaction_date = models.DateTimeField(default=timezone.now)

    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="stock_movements",
    )
    material_request = models.ForeignKey(
        'MaterialRequest', on_delete=models.SET_NULL, null=True, blank=True,
        related_name="stock_movements",
    )
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return f"{self.movement_type} {self.quantity} — {self.inventory_item.sku}"


# ---------------------------------------------------------------------------
# MaterialRequest — a project lead requesting InventoryItems for a project
# ---------------------------------------------------------------------------

class RequestNumberSequence(models.Model):
    """
    Backs auto-generated request numbers like MR-20260731-0001 — one row
    per calendar day, incremented atomically under a row lock so concurrent
    submissions on the same day can't collide.
    """
    date = models.DateField(unique=True)
    last_number = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.date} → {self.last_number}"


class MaterialRequest(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        INVALID = "INVALID", "Invalid"

    request_number = models.CharField(max_length=32, unique=True, editable=False, blank=True)

    # Soft reference to the projects app. Swap for a real FK to projects.Project
    # once that model is confirmed — kept decoupled here on purpose.
    project_id = models.UUIDField(null=True, blank=True)
    project_name = models.CharField(max_length=255, blank=True)  # "project reference"

    department = models.CharField(max_length=128, blank=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name="material_requests",
    )
    notes = models.TextField(blank=True)  # requester's notes

    # created_at (inherited) doubles as "date/time requested" — no separate
    # field needed since it's stamped automatically the moment the request
    # is submitted.

    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.PENDING
    )
    # Populated whichever way the request is resolved — approved, rejected,
    # or marked invalid. "reviewed" rather than "approved" since this same
    # trio covers all three outcomes, not just approval.
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="material_requests_reviewed",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)  # approver's notes

    # Issuing is a distinct step from approval — often a different person
    # (e.g. warehouse staff) acting after an approver has signed off.
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="material_requests_issued",
    )
    issued_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.request_number or self.id} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.request_number:
            self.request_number = self._generate_request_number()
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_request_number():
        from django.db import transaction
        from django.utils import timezone

        today = timezone.localdate()
        with transaction.atomic():
            seq, _ = RequestNumberSequence.objects.select_for_update().get_or_create(
                date=today
            )
            seq.last_number += 1
            seq.save(update_fields=["last_number"])
            return f"MR-{today.strftime('%Y%m%d')}-{seq.last_number:04d}"

    @property
    def fulfillment_status(self):
        """
        Decoupled from `status` on purpose: a request can be APPROVED and
        still be NOT_ISSUED, PARTIALLY_ISSUED, or COMPLETED depending on
        how much of it has actually left the shelf so far.
        """
        items = list(self.items.all())
        if not items:
            return "NOT_ISSUED"
        total_authorized = sum(
            (i.quantity_approved if i.quantity_approved is not None else i.quantity_requested)
            for i in items
        )
        total_issued = sum(i.quantity_issued for i in items)
        if total_issued <= 0:
            return "NOT_ISSUED"
        if total_issued >= total_authorized:
            return "COMPLETED"
        return "PARTIALLY_ISSUED"

    def issue(self, user):
        """
        Issue this material request by creating stock movements for each item.
        This creates OUT movements to reduce inventory stock.
        """
        from inventory.services.movement_service import MovementService

        if self.status != self.Status.APPROVED:
            raise ValueError("Can only issue approved requests")

        movements = []
        for item in self.items.all():
            quantity_to_issue = item.quantity_approved if item.quantity_approved is not None else item.quantity_requested

            if quantity_to_issue > item.quantity_issued:
                quantity = quantity_to_issue - item.quantity_issued

                movement = MovementService.record(
                    inventory_item=item.inventory_item,
                    movement_type=StockMovement.MovementType.OUT,
                    quantity=quantity,
                    reason=StockMovement.MovementReason.ISSUE,
                    notes=f"Material Request {self.request_number}",
                    reference=self.request_number,
                    performed_by=user,
                    material_request=self,
                )

                item.quantity_issued += quantity
                item.save(update_fields=["quantity_issued"])
                movements.append(movement)

        self.issued_by = user
        self.issued_at = timezone.now()
        self.save(update_fields=["issued_by", "issued_at"])

        return movements


class MaterialRequestItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(
        MaterialRequest, on_delete=models.CASCADE, related_name="items"
    )
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT)
    quantity_requested = models.PositiveIntegerField(default=0)
    quantity_approved = models.PositiveIntegerField(null=True, blank=True)
    quantity_issued = models.PositiveIntegerField(default=0)

    # Tool issue tracking fields
    responsible_person = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="tool_issuances",
        help_text="Person responsible for the issued tool"
    )
    expected_return_date = models.DateField(null=True, blank=True, help_text="Expected return date for company tools")
    actual_return_date = models.DateField(null=True, blank=True, help_text="Actual return date")
    condition_at_issue = models.CharField(max_length=20, blank=True, help_text="Condition when issued")
    condition_at_return = models.CharField(max_length=20, blank=True, help_text="Condition when returned")
    return_notes = models.TextField(blank=True, help_text="Notes about tool return")

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


# ---------------------------------------------------------------------------
# ToolAccountability — accountability for damaged/lost/not-returned tools
# ---------------------------------------------------------------------------

class ToolAccountability(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING_RETURN = "PENDING_RETURN", "Pending Return"
        RETURNED_GOOD = "RETURNED_GOOD", "Returned Good"
        RETURNED_DAMAGED = "RETURNED_DAMAGED", "Returned Damaged"
        NOT_RETURNED = "NOT_RETURNED", "Not Returned"
        LOST = "LOST", "Lost"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        ACCOUNTABILITY_RESOLVED = "ACCOUNTABILITY_RESOLVED", "Accountability Resolved"

    tool = models.ForeignKey(
        InventoryItem, on_delete=models.PROTECT, related_name="accountability_records"
    )
    project_id = models.UUIDField(null=True, blank=True, help_text="Soft reference to project")
    project_name = models.CharField(max_length=255, blank=True)
    material_request = models.ForeignKey(
        MaterialRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="accountability_records"
    )
    material_request_item = models.ForeignKey(
        MaterialRequestItem, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="accountability_records"
    )
    responsible_person = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="accountability_records"
    )
    issued_date = models.DateField(null=True, blank=True)
    expected_return_date = models.DateField(null=True, blank=True)
    actual_return_date = models.DateField(null=True, blank=True)
    condition_at_issue = models.CharField(max_length=20, blank=True)
    condition_at_return = models.CharField(max_length=20, blank=True)
    status = models.CharField(
        max_length=30, choices=Status.choices, default=Status.PENDING_RETURN
    )
    damage_description = models.TextField(blank=True)
    loss_description = models.TextField(blank=True)
    estimated_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    accountable_person = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="accountability_as_responsible"
    )
    resolution = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="approved_accountability"
    )
    notes = models.TextField(blank=True)

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]
        verbose_name = "Tool Accountability"
        verbose_name_plural = "Tool Accountability Records"

    def __str__(self):
        return f"{self.tool.name} - {self.project_name or 'Unknown Project'} ({self.status})"
