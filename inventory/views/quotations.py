from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.permissions import IsAuthenticated

from inventory.filters import SalesQuotationFilter
from inventory.models import SalesQuotation
from inventory.pagination import InventoryPagination
from inventory.permissions import IsInventoryUser
from inventory.serializers import SalesQuotationSerializer


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