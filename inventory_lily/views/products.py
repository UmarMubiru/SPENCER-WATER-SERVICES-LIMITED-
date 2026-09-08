from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from inventory_lily.filters import ProductFilter
from inventory_lily.models import Product
from inventory_lily.pagination import InventoryPagination
from inventory_lily.permissions import IsInventoryUser
from inventory_lily.serializers import ProductSerializer


class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related("supplier")
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
    pagination_class = InventoryPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ProductFilter
    ordering_fields = ["name", "sku", "category", "selling_price"]
    ordering = ["name"]


class ProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related("supplier")
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def check_product_sku(request):
    sku = request.GET.get("sku", "")
    return Response({"exists": Product.objects.filter(sku__iexact=sku).exists()})
