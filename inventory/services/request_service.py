from django.db import transaction
from django.utils import timezone

from inventory.models import MaterialRequest
from inventory.services.movement_service import MovementService


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
            if isinstance(approved_qty, bool) or not isinstance(approved_qty, int) or approved_qty < 0:
                raise ValueError(
                    f"Approved quantity for {item.inventory_item.sku} must be a whole number of zero or more."
                )

            # Approval is an authorisation, not a stock movement. A reviewer may
            # reduce or increase the requested amount; live stock is safely
            # checked and deducted only when the warehouse issues the items.
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

            if isinstance(qty, bool) or not isinstance(qty, int) or qty < 0:
                raise ValueError(
                    f"Issue quantity for {line.inventory_item.sku} must be a whole number of zero or more."
                )
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
                material_request=material_request,
            )
            line.quantity_issued += qty
            line.save(update_fields=["quantity_issued"])
            any_issued = True

            # Log to project history if this is a company tool
            if line.inventory_item.inventory_type == 'COMPANY_TOOL':
                try:
                    from projects.models_extras import ProjectHistory
                    from projects.models import Project
                    project = Project.objects.filter(id=material_request.project_id).first()
                    if project:
                        ProjectHistory.objects.create(
                            project=project,
                            event_type='RESOURCE_ISSUED',
                            description=f'Issued {qty} x {line.inventory_item.name} to project',
                            performed_by=issued_by,
                        )
                except Exception:
                    # Don't fail the issue if project history fails
                    pass

        if not any_issued:
            raise ValueError("Nothing to issue — all items are already fully issued.")

        material_request.issued_by = issued_by
        material_request.issued_at = timezone.now()
        material_request.save(update_fields=["issued_by", "issued_at", "updated_at"])

        return material_request

    @staticmethod
    @transaction.atomic
    def return_tool(material_request_item_id, returned_by, return_data):
        """
        Return a company tool from a material request item.
        
        return_data should contain:
        - quantity_returned: int
        - condition_at_return: str (GOOD, DAMAGED, LOST)
        - return_notes: str (optional)
        """
        from inventory.models import MaterialRequestItem, ToolAccountability
        
        try:
            item = MaterialRequestItem.objects.select_related(
                'inventory_item', 'request', 'responsible_person'
            ).get(pk=material_request_item_id)
        except MaterialRequestItem.DoesNotExist:
            raise ValueError("Material request item not found.")
        
        if item.inventory_item.inventory_type != 'COMPANY_TOOL':
            raise ValueError("Only company tools can be returned through this method.")
        
        quantity_returned = return_data.get('quantity_returned', 0)
        condition = return_data.get('condition_at_return', 'GOOD')
        notes = return_data.get('return_notes', '')
        
        if quantity_returned <= 0:
            raise ValueError("Quantity returned must be greater than 0.")
        
        if quantity_returned > item.quantity_issued:
            raise ValueError(f"Cannot return {quantity_returned}. Only {item.quantity_issued} were issued.")
        
        # Update return tracking
        item.actual_return_date = timezone.now().date()
        item.condition_at_return = condition
        item.return_notes = notes
        item.save(update_fields=["actual_return_date", "condition_at_return", "return_notes"])
        
        # Handle based on condition
        if condition == 'GOOD':
            # Return to inventory - create IN movement
            MovementService.record(
                inventory_item=item.inventory_item,
                movement_type="IN",
                quantity=quantity_returned,
                reason="RETURN",
                notes=f"Tool returned from {item.request.project_name or 'project'}",
                reference=item.request.request_number,
                performed_by=returned_by,
            )
        else:
            # Create accountability record for damaged/lost tools
            ToolAccountability.objects.create(
                tool=item.inventory_item,
                project_id=item.request.project_id,
                project_name=item.request.project_name,
                material_request=item.request,
                material_request_item=item,
                responsible_person=item.responsible_person,
                issued_date=item.request.issued_at.date() if item.request.issued_at else None,
                expected_return_date=item.expected_return_date,
                actual_return_date=timezone.now().date(),
                condition_at_issue=item.condition_at_issue,
                condition_at_return=condition,
                status='RETURNED_DAMAGED' if condition == 'DAMAGED' else 'LOST',
                damage_description=notes if condition == 'DAMAGED' else '',
                loss_description=notes if condition == 'LOST' else '',
                accountable_person=item.responsible_person,
            )
        
        # Log to project history
        try:
            from projects.models_extras import ProjectHistory
            from projects.models import Project
            project = Project.objects.filter(id=item.request.project_id).first()
            if project:
                event_desc = f'Returned {quantity_returned} x {item.inventory_item.name} - Condition: {condition}'
                if condition in ['DAMAGED', 'LOST']:
                    event_desc += ' (Accountability created)'
                ProjectHistory.objects.create(
                    project=project,
                    event_type='RESOURCE_RETURNED',
                    description=event_desc,
                    performed_by=returned_by,
                )
        except Exception:
            # Don't fail the return if project history fails
            pass
        
        return item
