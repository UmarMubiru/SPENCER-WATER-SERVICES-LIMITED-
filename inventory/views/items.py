from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from inventory.filters import InventoryItemFilter
from inventory.models import InventoryItem
from inventory.pagination import InventoryPagination
from inventory.permissions import IsInventoryUser
from inventory.serializers import InventoryItemSerializer


class InventoryItemListCreateAPIView(generics.ListCreateAPIView):
    queryset = InventoryItem.objects.select_related("supplier")
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
    pagination_class = InventoryPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = InventoryItemFilter
    ordering_fields = ["name", "sku", "category", "quantity"]
    ordering = ["name"]


class InventoryItemDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryItem.objects.select_related("supplier")
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def check_item_sku(request):
    sku = request.GET.get("sku", "")
    return Response({"exists": InventoryItem.objects.filter(sku__iexact=sku).exists()})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInventoryUser])
def allocate_purchase_number(request):
    """Reserve the next system purchase number before the item form is filled."""
    return Response({"purchaseNumber": InventoryItem._generate_purchase_number()})
