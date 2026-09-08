from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from inventory.filters import RequestFilter
from inventory.models import MaterialRequest
from inventory.pagination import InventoryPagination
from inventory.permissions import IsInventoryUser
from inventory.serializers import MaterialRequestSerializer
from inventory.services.request_service import RequestService
from reports.audit import log_activity


class MaterialRequestListCreateAPIView(generics.ListCreateAPIView):
    queryset = MaterialRequest.objects.prefetch_related("items__inventory_item")
    serializer_class = MaterialRequestSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
    pagination_class = InventoryPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = RequestFilter
    ordering_fields = ["created_at", "status"]
    ordering = ["-created_at"]

    def perform_create(self, serializer):
        material_request = serializer.save(requested_by=self.request.user)
        log_activity(
            module="inventory",
            action="Material request submitted",
            action_type="created",
            entity_type="MaterialRequest",
            entity_id=material_request.id,
            reference_number=material_request.request_number,
            description=f"Submitted {material_request.items.count()} item request for {material_request.project_name or material_request.department or 'Inventory'}.",
            performed_by=self.request.user,
            new_data={"status": material_request.status, "item_count": material_request.items.count()},
            request=self.request,
        )


class MaterialRequestDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MaterialRequest.objects.prefetch_related("items__inventory_item")
    serializer_class = MaterialRequestSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def approve_material_request(request, pk):
    material_request = MaterialRequest.objects.get(pk=pk)
    previous_status = material_request.status
    try:
        RequestService.approve(
            material_request,
            reviewer=request.user,
            approved_quantities=request.data.get("approvedQuantities"),
            review_notes=request.data.get("notes", ""),
        )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=400)
    log_activity(
        module="inventory",
        action="Material request approved",
        action_type="approved",
        entity_type="MaterialRequest",
        entity_id=material_request.id,
        reference_number=material_request.request_number,
        description=f"Approved request {material_request.request_number} for {material_request.project_name or material_request.department or 'Inventory'}.",
        performed_by=request.user,
        old_data={"status": previous_status},
        new_data={"status": material_request.status, "approved_quantities": request.data.get("approvedQuantities", {})},
        request=request,
    )
    return Response(MaterialRequestSerializer(material_request).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def reject_material_request(request, pk):
    material_request = MaterialRequest.objects.get(pk=pk)
    previous_status = material_request.status
    RequestService.reject(
        material_request, reviewer=request.user, review_notes=request.data.get("notes", "")
    )
    log_activity(
        module="inventory",
        action="Material request rejected",
        action_type="warning",
        entity_type="MaterialRequest",
        entity_id=material_request.id,
        reference_number=material_request.request_number,
        description=f"Rejected request {material_request.request_number}.",
        performed_by=request.user,
        old_data={"status": previous_status},
        new_data={"status": material_request.status, "notes": material_request.review_notes},
        request=request,
    )
    return Response(MaterialRequestSerializer(material_request).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def invalidate_material_request(request, pk):
    material_request = MaterialRequest.objects.get(pk=pk)
    previous_status = material_request.status
    RequestService.invalidate(
        material_request, reviewer=request.user, review_notes=request.data.get("notes", "")
    )
    log_activity(
        module="inventory",
        action="Material request marked invalid",
        action_type="warning",
        entity_type="MaterialRequest",
        entity_id=material_request.id,
        reference_number=material_request.request_number,
        description=f"Marked request {material_request.request_number} as invalid.",
        performed_by=request.user,
        old_data={"status": previous_status},
        new_data={"status": material_request.status, "notes": material_request.review_notes},
        request=request,
    )
    return Response(MaterialRequestSerializer(material_request).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def fulfill_material_request(request, pk):
    material_request = MaterialRequest.objects.get(pk=pk)
    quantities_before = {str(item.id): item.quantity_issued for item in material_request.items.all()}
    try:
        RequestService.fulfill(
            material_request,
            issued_by=request.user,
            issued_quantities=request.data.get("issuedQuantities"),
        )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=400)
    issued_lines = [
        {"item_id": str(item.id), "quantity": item.quantity_issued - quantities_before[str(item.id)]}
        for item in material_request.items.all()
        if item.quantity_issued > quantities_before[str(item.id)]
    ]
    log_activity(
        module="inventory",
        action="Material request items issued",
        action_type="updated",
        entity_type="MaterialRequest",
        entity_id=material_request.id,
        reference_number=material_request.request_number,
        description=f"Issued {sum(line['quantity'] for line in issued_lines)} unit(s) for request {material_request.request_number}.",
        performed_by=request.user,
        old_data={"issued_quantities": quantities_before},
        new_data={"issued_lines": issued_lines, "fulfillment_status": material_request.fulfillment_status},
        request=request,
    )
    return Response(MaterialRequestSerializer(material_request).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def return_tool(request, pk):
    """Return a company tool from a material request item"""
    try:
        item = RequestService.return_tool(
            material_request_item_id=pk,
            returned_by=request.user,
            return_data={
                'quantity_returned': request.data.get('quantity_returned', 0),
                'condition_at_return': request.data.get('condition_at_return', 'GOOD'),
                'return_notes': request.data.get('return_notes', ''),
            }
        )
        from inventory.serializers import MaterialRequestItemSerializer
        log_activity(
            module="inventory",
            action="Company tool returned",
            action_type="updated",
            entity_type="MaterialRequest",
            entity_id=item.request_id,
            reference_number=item.request.request_number,
            description=f"Returned {request.data.get('quantity_returned', 0)} x {item.inventory_item.name} from {item.request.project_name or 'project'}.",
            performed_by=request.user,
            new_data={"item": item.inventory_item.sku, "quantity_returned": request.data.get('quantity_returned', 0), "condition": item.condition_at_return},
            request=request,
        )
        serializer = MaterialRequestItemSerializer(item)
        return Response(serializer.data)
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def extend_return_date(request, pk):
    """Extend the expected return date for a company tool"""
    try:
        from inventory.models import MaterialRequestItem
        item = MaterialRequestItem.objects.get(pk=pk)

        if item.inventory_item.inventory_type != 'COMPANY_TOOL':
            return Response({"detail": "Only company tools can have return dates extended."}, status=400)

        new_return_date = request.data.get('expected_return_date')
        reason = request.data.get('reason', '')

        if not new_return_date:
            return Response({"detail": "Expected return date is required."}, status=400)

        item.expected_return_date = new_return_date
        item.save(update_fields=["expected_return_date"])

        log_activity(
            module="inventory",
            action="Tool return date extended",
            action_type="updated",
            entity_type="MaterialRequest",
            entity_id=item.request_id,
            reference_number=item.request.request_number,
            description=f"Extended return date for {item.inventory_item.name} to {new_return_date}. Reason: {reason}",
            performed_by=request.user,
            new_data={"item": item.inventory_item.sku, "new_return_date": new_return_date, "reason": reason},
            request=request,
        )

        from inventory.serializers import MaterialRequestItemSerializer
        serializer = MaterialRequestItemSerializer(item)
        return Response(serializer.data)
    except MaterialRequestItem.DoesNotExist:
        return Response({"detail": "Material request item not found."}, status=404)
    except Exception as exc:
        return Response({"detail": str(exc)}, status=400)
