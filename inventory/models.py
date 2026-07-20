import re
import uuid

from django.conf import settings # type: ignore
from django.core.validators import MinValueValidator # type: ignore
from django.db import models # type: ignore


# ==========================================================
# ENUMS
# ==========================================================

class RequestStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"
    ISSUED = "ISSUED", "Issued"
    COMPLETED = "COMPLETED", "Completed"


class MovementType(models.TextChoices):
    INITIAL = "INITIAL", "Initial Stock"
    PURCHASE = "PURCHASE", "Purchase"
    ISSUE = "ISSUE", "Issue"
    RETURN = "RETURN", "Return"
    ADJUSTMENT = "ADJUSTMENT", "Adjustment"


# ==========================================================
# BASE MODEL
# ==========================================================

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ==========================================================
# CATEGORY
# ==========================================================

class Category(TimeStampedModel):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.name


# ==========================================================
# INVENTORY ITEM
# ==========================================================

class InventoryItem(TimeStampedModel):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="inventory_items",
    )

    item_code = models.CharField(
        max_length=30,
        unique=True,
        blank=True,
    )

    name = models.CharField(
        max_length=150,
    )

    description = models.TextField(
        blank=True,
    )

    unit = models.CharField(
        max_length=20,
    )

    quantity = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )

    reorder_level = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )

    unit_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["name"]

        indexes = [
            models.Index(fields=["item_code"]),
            models.Index(fields=["name"]),
            models.Index(fields=["category"]),
            models.Index(fields=["is_active"]),
        ]

        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gte=0),
                name="inventory_quantity_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(reorder_level__gte=0),
                name="inventory_reorder_non_negative",
            ),
        ]

    def _generate_item_code_prefix(self) -> str:
        raw_name = self.category.name if self.category else ''
        prefix = re.sub(r'[^A-Z0-9]+', '', raw_name.upper())
        prefix = prefix[:2] if len(prefix) >= 2 else prefix or 'IT'
        return prefix

    def _generate_next_item_code(self) -> str:
        prefix = self._generate_item_code_prefix()
        pattern = rf'^{re.escape(prefix)}-(\d+)$'
        max_count = 0
        existing_codes = InventoryItem.objects.filter(category=self.category, item_code__startswith=f"{prefix}-").values_list('item_code', flat=True)
        for code in existing_codes:
            match = re.match(pattern, code)
            if match:
                count = int(match.group(1))
                if count > max_count:
                    max_count = count
        return f"{prefix}-{max_count + 1:04d}"

    def save(self, *args, **kwargs):
        if not self.item_code:
            self.item_code = self._generate_next_item_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.item_code} - {self.name}"


# ==========================================================
# MATERIAL REQUEST
# ==========================================================

class MaterialRequest(TimeStampedModel):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    request_number = models.CharField(
        max_length=30,
        unique=True,
    )

    project_reference = models.CharField(
        max_length=150,
    )

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="material_requests",
    )

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="approved_material_requests",
    )

    rejected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="rejected_material_requests",
    )

    status = models.CharField(
        max_length=20,
        choices=RequestStatus.choices,
        default=RequestStatus.PENDING,
    )

    remarks = models.TextField(
        blank=True,
    )

    requested_at = models.DateTimeField(
        auto_now_add=True,
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    rejected_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-requested_at"]

        indexes = [
            models.Index(fields=["request_number"]),
            models.Index(fields=["status"]),
            models.Index(fields=["requested_by"]),
            models.Index(fields=["requested_at"]),
        ]

    def __str__(self):
        return self.request_number


# ==========================================================
# MATERIAL REQUEST ITEM
# ==========================================================

class MaterialRequestItem(TimeStampedModel):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    material_request = models.ForeignKey(
        MaterialRequest,
        on_delete=models.CASCADE,
        related_name="items",
    )

    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name="request_items",
    )

    requested_quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )

    approved_quantity = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )

    issued_quantity = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )

    remarks = models.TextField(
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "material_request",
                    "inventory_item",
                ],
                name="unique_inventory_item_per_request",
            ),
            models.CheckConstraint(
                condition=models.Q(
                    approved_quantity__lte=models.F("requested_quantity")
                ),
                name="approved_not_greater_than_requested",
            ),
            models.CheckConstraint(
                condition=models.Q(
                    issued_quantity__lte=models.F("approved_quantity")
                ),
                name="issued_not_greater_than_approved",
            ),
        ]

    def __str__(self):
        return f"{self.inventory_item.name} ({self.requested_quantity})"


# ==========================================================
# STOCK MOVEMENT
# ==========================================================

class StockMovement(TimeStampedModel):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name="stock_movements",
    )

    movement_type = models.CharField(
        max_length=20,
        choices=MovementType.choices,
    )

    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )

    balance_before = models.PositiveIntegerField()

    balance_after = models.PositiveIntegerField()

    reference_type = models.CharField(
        max_length=50,
        blank=True,
    )

    reference_id = models.UUIDField(
        null=True,
        blank=True,
    )

    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="stock_movements",
    )

    remarks = models.TextField(
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["inventory_item"]),
            models.Index(fields=["movement_type"]),
            models.Index(fields=["created_at"]),
        ]

        constraints = [
            models.CheckConstraint(
                condition=models.Q(balance_before__gte=0),
                name="balance_before_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(balance_after__gte=0),
                name="balance_after_non_negative",
            ),
        ]

    def __str__(self):
        return f"{self.inventory_item.name} - {self.movement_type}"