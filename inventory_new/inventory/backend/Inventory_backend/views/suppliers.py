from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.permissions import IsAuthenticated

from inventory.filters import SupplierFilter
from inventory.models import Supplier
from inventory.pagination import InventoryPagination
from inventory.permissions import IsInventoryUser
from inventory.serializers import SupplierSerializer


class SupplierListCreateAPIView(generics.ListCreateAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
    pagination_class = InventoryPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = SupplierFilter
    ordering_fields = ["name"]
    ordering = ["name"]


class SupplierDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
