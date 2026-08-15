from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from inventory.filters import RequestFilter
from inventory.models import MaterialRequest
from inventory.pagination import InventoryPagination
from inventory.permissions import IsInventoryUser
from inventory.serializers import MaterialRequestSerializer
from inventory.services.request_service import RequestService


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
        serializer.save(requested_by=self.request.user)


class MaterialRequestDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MaterialRequest.objects.prefetch_related("items__inventory_item")
    serializer_class = MaterialRequestSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def approve_material_request(request, pk):
    material_request = MaterialRequest.objects.get(pk=pk)
    try:
        RequestService.approve(
            material_request,
            reviewer=request.user,
            approved_quantities=request.data.get("approvedQuantities"),
            review_notes=request.data.get("notes", ""),
        )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=400)
    return Response(MaterialRequestSerializer(material_request).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def reject_material_request(request, pk):
    material_request = MaterialRequest.objects.get(pk=pk)
    RequestService.reject(
        material_request, reviewer=request.user, review_notes=request.data.get("notes", "")
    )
    return Response(MaterialRequestSerializer(material_request).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def invalidate_material_request(request, pk):
    material_request = MaterialRequest.objects.get(pk=pk)
    RequestService.invalidate(
        material_request, reviewer=request.user, review_notes=request.data.get("notes", "")
    )
    return Response(MaterialRequestSerializer(material_request).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def fulfill_material_request(request, pk):
    material_request = MaterialRequest.objects.get(pk=pk)
    try:
        RequestService.fulfill(
            material_request,
            issued_by=request.user,
            issued_quantities=request.data.get("issuedQuantities"),
        )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=400)
    return Response(MaterialRequestSerializer(material_request).data)
