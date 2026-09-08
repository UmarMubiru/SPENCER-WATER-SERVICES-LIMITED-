from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.permissions import IsAuthenticated

from inventory_lily.filters import CategoryFilter
from inventory_lily.models import Category
from inventory_lily.pagination import InventoryPagination
from inventory_lily.permissions import IsInventoryUser
from inventory_lily.serializers import CategorySerializer


class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
    pagination_class = InventoryPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = CategoryFilter
    ordering_fields = ["name"]
    ordering = ["name"]


class CategoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
