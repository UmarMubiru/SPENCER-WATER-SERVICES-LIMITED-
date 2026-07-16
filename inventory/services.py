from django.db import transaction # type: ignore
from django.db.models import F # type: ignore
from django.utils import timezone # type: ignore

from .models import (
    InventoryItem,
    MaterialRequest,
    MaterialRequestItem,
    StockMovement,
    RequestStatus,
    MovementType,
)


class InventoryError(Exception):
    """Base inventory exception."""
    pass


class InsufficientStockError(InventoryError):
    """Raised when stock is insufficient."""
    pass


class InvalidRequestStateError(InventoryError):
    """Raised when a request cannot transition."""
    pass


class InventoryService:

    @staticmethod
    @transaction.atomic
    def add_initial_stock(
        inventory_item,
        quantity,
        user,
        remarks="Initial Stock",
    ):
        before = inventory_item.quantity

        inventory_item.quantity += quantity
        inventory_item.save(update_fields=["quantity", "updated_at"])

        StockMovement.objects.create(
            inventory_item=inventory_item,
            movement_type=MovementType.INITIAL,
            quantity=quantity,
            balance_before=before,
            balance_after=inventory_item.quantity,
            performed_by=user,
            remarks=remarks,
        )

        return inventory_item

    @staticmethod
    @transaction.atomic
    def increase_stock(
        inventory_item,
        quantity,
        user,
        remarks="Purchase",
    ):
        before = inventory_item.quantity

        inventory_item.quantity += quantity
        inventory_item.save(update_fields=["quantity", "updated_at"])

        StockMovement.objects.create(
            inventory_item=inventory_item,
            movement_type=MovementType.PURCHASE,
            quantity=quantity,
            balance_before=before,
            balance_after=inventory_item.quantity,
            performed_by=user,
            remarks=remarks,
        )

        return inventory_item

    @staticmethod
    @transaction.atomic
    def reduce_stock(
        inventory_item,
        quantity,
        user,
        remarks="Issue",
        reference_type="MaterialRequest",
        reference_id=None,
    ):

        inventory_item.refresh_from_db()

        if inventory_item.quantity < quantity:
            raise InsufficientStockError(
                f"Insufficient stock for {inventory_item.name}"
            )

        before = inventory_item.quantity

        inventory_item.quantity -= quantity

        inventory_item.save(update_fields=["quantity", "updated_at"])

        StockMovement.objects.create(
            inventory_item=inventory_item,
            movement_type=MovementType.ISSUE,
            quantity=quantity,
            balance_before=before,
            balance_after=inventory_item.quantity,
            performed_by=user,
            reference_type=reference_type,
            reference_id=reference_id,
            remarks=remarks,
        )

        return inventory_item

class MaterialRequestService:

    @staticmethod
    @transaction.atomic
    def approve_request(request, approver):

        if request.status != RequestStatus.PENDING:
            raise InvalidRequestStateError(
                "Only pending requests can be approved."
            )

        items = request.items.select_related("inventory_item")

        for item in items:

            if item.inventory_item.quantity < item.requested_quantity:
                raise InsufficientStockError(
                    f"{item.inventory_item.name} has insufficient stock."
                )

        request.status = RequestStatus.APPROVED
        request.approved_by = approver
        request.approved_at = timezone.now()

        request.save(
            update_fields=[
                "status",
                "approved_by",
                "approved_at",
                "updated_at",
            ]
        )

        return request

    @staticmethod
    @transaction.atomic
    def issue_request(request, issuer):

        if request.status != RequestStatus.APPROVED:
            raise InvalidRequestStateError(
                "Only approved requests can be issued."
            )

        items = request.items.select_related("inventory_item")

        for item in items:

            InventoryService.reduce_stock(
                inventory_item=item.inventory_item,
                quantity=item.requested_quantity,
                user=issuer,
                reference_type="MaterialRequest",
                reference_id=request.id,
                remarks=f"Issued for {request.request_number}",
            )

            item.approved_quantity = item.requested_quantity
            item.issued_quantity = item.requested_quantity

            item.save(
                update_fields=[
                    "approved_quantity",
                    "issued_quantity",
                ]
            )

        request.status = RequestStatus.ISSUED

        request.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return request
