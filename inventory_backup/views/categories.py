from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.permissions import IsAuthenticated

from inventory.filters import CategoryFilter
from inventory.models import Category
from inventory.pagination import InventoryPagination
from inventory.permissions import IsInventoryUser
from inventory.serializers import CategorySerializer


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
