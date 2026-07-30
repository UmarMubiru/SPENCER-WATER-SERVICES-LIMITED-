from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from inventory.filters import SupplierQuotationFilter
from inventory.models import SupplierQuotation
from inventory.pagination import InventoryPagination
from inventory.permissions import IsInventoryUser
from inventory.serializers import SupplierQuotationSerializer
from inventory.services.quotation_service import InvalidQuotationTransition, SupplierQuotationService


class SupplierQuotationListCreateAPIView(generics.ListCreateAPIView):
    queryset = SupplierQuotation.objects.select_related("supplier").prefetch_related(
        "items__inventory_item", "items__product"
    )
    serializer_class = SupplierQuotationSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
    pagination_class = InventoryPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = SupplierQuotationFilter
    ordering_fields = ["created_at", "status"]
    ordering = ["-created_at"]


class SupplierQuotationDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SupplierQuotation.objects.select_related("supplier").prefetch_related(
        "items__inventory_item", "items__product"
    )
    serializer_class = SupplierQuotationSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def send_supplier_quotation(request, pk):
    quotation = get_object_or_404(_supplier_quotation_queryset(), pk=pk)
    return _supplier_action_response(quotation, SupplierQuotationService.send)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def accept_supplier_quotation(request, pk):
    quotation = get_object_or_404(_supplier_quotation_queryset(), pk=pk)
    return _supplier_action_response(quotation, SupplierQuotationService.accept)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def reject_supplier_quotation(request, pk):
    quotation = get_object_or_404(_supplier_quotation_queryset(), pk=pk)
    return _supplier_action_response(quotation, SupplierQuotationService.reject)


def _supplier_quotation_queryset():
    return SupplierQuotation.objects.select_related("supplier").prefetch_related(
        "items__inventory_item", "items__product"
    )


def _supplier_action_response(quotation, action):
    try:
        action(quotation)
    except InvalidQuotationTransition as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(SupplierQuotationSerializer(quotation).data)
