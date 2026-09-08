from datetime import timedelta
from django.db import transaction
from django.utils import timezone

from inventory_lily.models import MaterialRequest
from inventory_lily.services.movement_service import MovementService


class RequestService:
    @staticmethod
    @transaction.atomic
    def approve(material_request: MaterialRequest, reviewer, approved_quantities: dict = None,
                review_notes: str = ""):
        """
        approved_quantities: optional {material_request_item_id: quantity_approved}
        override. Defaults to the requested quantity for every line item.
        """
        approved_quantities = approved_quantities or {}

        for item in material_request.items.select_related("inventory_item"):
            approved_qty = approved_quantities.get(str(item.id), item.quantity_requested)
            if approved_qty > item.quantity_requested:
                raise ValueError(
                    f"Cannot approve {approved_qty} of {item.inventory_item.sku} — "
                    f"only {item.quantity_requested} were requested."
                )
            item.quantity_approved = approved_qty
            item.save(update_fields=["quantity_approved"])

        material_request.status = MaterialRequest.Status.APPROVED
        material_request.reviewed_by = reviewer
        material_request.reviewed_at = timezone.now()
        material_request.review_notes = review_notes
        material_request.save(
            update_fields=["status", "reviewed_by", "reviewed_at", "review_notes", "updated_at"]
        )
        return material_request

    @staticmethod
    @transaction.atomic
    def reject(material_request: MaterialRequest, reviewer, review_notes: str = ""):
        material_request.status = MaterialRequest.Status.REJECTED
        material_request.reviewed_by = reviewer
        material_request.reviewed_at = timezone.now()
        material_request.review_notes = review_notes
        material_request.save(
            update_fields=["status", "reviewed_by", "reviewed_at", "review_notes", "updated_at"]
        )
        return material_request

    @staticmethod
    @transaction.atomic
    def invalidate(material_request: MaterialRequest, reviewer, review_notes: str = ""):
        """For requests that are malformed/no longer relevant, distinct from
        a valid request that was reviewed and declined (REJECTED)."""
        material_request.status = MaterialRequest.Status.INVALID
        material_request.reviewed_by = reviewer
        material_request.reviewed_at = timezone.now()
        material_request.review_notes = review_notes
        material_request.save(
            update_fields=["status", "reviewed_by", "reviewed_at", "review_notes", "updated_at"]
        )
        return material_request

    @staticmethod
    @transaction.atomic
    def fulfill(material_request: MaterialRequest, issued_by, issued_quantities: dict = None):
        """
        issued_quantities: optional {material_request_item_id: quantity_to_issue_now}.
        Defaults to issuing the full remaining (approved - already issued) for
        every line. Supports being called more than once for partial,
        staggered issuance — each call only issues what's specified and adds
        to quantity_issued, it never resets it.
        """
        if material_request.status != MaterialRequest.Status.APPROVED:
            raise ValueError("Only approved requests can be issued against.")

        issued_quantities = issued_quantities or {}
        any_issued = False

        for line in material_request.items.select_related("inventory_item"):
            authorized = line.quantity_approved if line.quantity_approved is not None else line.quantity_requested
            remaining = authorized - line.quantity_issued
            qty = issued_quantities.get(str(line.id), remaining)

            if qty <= 0:
                continue
            if qty > remaining:
                raise ValueError(
                    f"Cannot issue {qty} of {line.inventory_item.sku} — only {remaining} remaining to issue."
                )

            MovementService.record(
                inventory_item=line.inventory_item,
                movement_type="OUT",
                quantity=qty,
                reason="REQUEST_ISSUE",
                notes="Material request issued",
                reference=str(material_request.id),
                performed_by=issued_by,
            )
            line.quantity_issued += qty
            line.save(update_fields=["quantity_issued"])
            any_issued = True

        if not any_issued:
            raise ValueError("Nothing to issue — all items are already fully issued.")

        material_request.issued_by = issued_by
        material_request.issued_at = timezone.now()
        material_request.save(update_fields=["issued_by", "issued_at", "updated_at"])

        return material_request

    @staticmethod
    def get_recent_requests(days=None):
        """
        Get recent material requests with optional timeline filtering.
        days: None for all time, 2 for last 2 days, 14 for last 2 weeks
        """
        queryset = MaterialRequest.objects.select_related('requested_by', 'reviewed_by', 'issued_by').prefetch_related('items__inventory_item')
        
        if days:
            cutoff_date = timezone.now() - timedelta(days=days)
            queryset = queryset.filter(created_at__gte=cutoff_date)
        
        return queryset.order_by('-created_at')
