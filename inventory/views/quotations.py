from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from inventory.filters import SalesQuotationFilter
from inventory.models import SalesQuotation
from inventory.pagination import InventoryPagination
from inventory.permissions import IsInventoryUser
from inventory.serializers import SalesQuotationSerializer
from inventory.services.quotation_service import InvalidQuotationTransition, QuotationService


class SalesQuotationListCreateAPIView(generics.ListCreateAPIView):
    queryset = SalesQuotation.objects.prefetch_related("items__product")
    serializer_class = SalesQuotationSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
    pagination_class = InventoryPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = SalesQuotationFilter
    ordering_fields = ["created_at", "status", "customer_name"]
    ordering = ["-created_at"]


class SalesQuotationDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SalesQuotation.objects.prefetch_related("items__product")
    serializer_class = SalesQuotationSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def send_sales_quotation(request, pk):
    quotation = get_object_or_404(SalesQuotation.objects.prefetch_related("items__product"), pk=pk)
    return _sales_action_response(quotation, QuotationService.send)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def accept_sales_quotation(request, pk):
    quotation = get_object_or_404(SalesQuotation.objects.prefetch_related("items__product"), pk=pk)
    return _sales_action_response(quotation, QuotationService.accept)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def expire_sales_quotation(request, pk):
    quotation = get_object_or_404(SalesQuotation.objects.prefetch_related("items__product"), pk=pk)
    return _sales_action_response(quotation, QuotationService.expire)


def _sales_action_response(quotation, action):
    try:
        action(quotation)
    except InvalidQuotationTransition as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(SalesQuotationSerializer(quotation).data)
