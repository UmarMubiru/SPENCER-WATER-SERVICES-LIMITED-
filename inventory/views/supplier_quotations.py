from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.permissions import IsAuthenticated

from inventory.filters import SupplierQuotationFilter
from inventory.models import SupplierQuotation
from inventory.pagination import InventoryPagination
from inventory.permissions import IsInventoryUser
from inventory.serializers import SupplierQuotationSerializer


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
