from django.db import transaction

from inventory.models import MaterialRequest
from inventory.services.movement_service import MovementService


class RequestService:
    @staticmethod
    @transaction.atomic
    def approve(material_request: MaterialRequest, approved_quantities: dict = None):
        """
        approved_quantities: optional {material_request_item_id: quantity_approved}
        override. Defaults to the requested quantity for every line item.
        """
        approved_quantities = approved_quantities or {}

        for item in material_request.items.select_related("inventory_item"):
            item.quantity_approved = approved_quantities.get(
                str(item.id), item.quantity_requested
            )
            item.save(update_fields=["quantity_approved"])

        material_request.status = MaterialRequest.Status.APPROVED
        material_request.save(update_fields=["status", "updated_at"])
        return material_request

    @staticmethod
    @transaction.atomic
    def issue(material_request: MaterialRequest, issued_by=None):
        if material_request.status != MaterialRequest.Status.APPROVED:
            raise ValueError("Only approved requests can be issued.")

        for line in material_request.items.select_related("inventory_item"):
            qty = line.quantity_approved or line.quantity_requested
            MovementService.record(
                inventory_item=line.inventory_item,
                movement_type="OUT",
                quantity=qty,
                reason="Material request issued",
                reference=str(material_request.id),
                performed_by=issued_by,
            )

        material_request.status = MaterialRequest.Status.ISSUED
        material_request.save(update_fields=["status", "updated_at"])
        return material_request

    @staticmethod
    @transaction.atomic
    def reject(material_request: MaterialRequest):
        material_request.status = MaterialRequest.Status.REJECTED
        material_request.save(update_fields=["status", "updated_at"])
        return material_request
