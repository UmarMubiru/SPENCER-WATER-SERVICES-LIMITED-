from django.contrib import messages # type: ignore
from django.contrib.auth.decorators import login_required # type: ignore
from django.contrib.auth.mixins import LoginRequiredMixin # type: ignore
from django.db import transaction # type: ignore
from django.shortcuts import get_object_or_404, redirect, render # type: ignore
from django.urls import reverse_lazy # type: ignore
from django.views.generic import ( # type: ignore
    CreateView,
    ListView,
    DetailView,
)
from rest_framework import exceptions, viewsets, status # type: ignore
from rest_framework.decorators import action # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore

from .forms import (
    CategoryForm,
    InventoryItemForm,
    MaterialRequestForm,
    MaterialRequestItemFormSet,
)

from .models import (
    Category,
    InventoryItem,
    MaterialRequest,
    MaterialRequestItem,
    StockMovement,
)

from .services import (
    MaterialRequestService,
    InventoryError,

    InventoryService,
    InventoryError,
)

from .serializers import (
    CategorySerializer,
    InventoryItemSerializer,
    MaterialRequestSerializer,
    MaterialRequestItemSerializer,
    StockMovementCreateSerializer,
    StockMovementSerializer,
)

class CategoryListView(LoginRequiredMixin, ListView):
    model = Category
    template_name = "inventory/category_list.html"
    context_object_name = "categories"


class CategoryCreateView(LoginRequiredMixin, CreateView):
    model = Category
    form_class = CategoryForm
    template_name = "inventory/category_form.html"
    success_url = reverse_lazy("category-list")


class InventoryListView(LoginRequiredMixin, ListView):
    model = InventoryItem
    template_name = "inventory/inventory_list.html"
    context_object_name = "items"


class InventoryCreateView(LoginRequiredMixin, CreateView):
    model = InventoryItem
    form_class = InventoryItemForm
    template_name = "inventory/inventory_form.html"
    success_url = reverse_lazy("inventory-list")


class MaterialRequestListView(LoginRequiredMixin, ListView):
    model = MaterialRequest
    template_name = "inventory/request_list.html"
    context_object_name = "requests"

class MaterialRequestDetailView(LoginRequiredMixin, DetailView):
    model = MaterialRequest
    template_name = "inventory/request_detail.html"
    context_object_name = "request"

@login_required
@transaction.atomic
def create_request(request):

    if request.method == "POST":

        form = MaterialRequestForm(request.POST)

        formset = MaterialRequestItemFormSet(request.POST)

        if form.is_valid() and formset.is_valid():

            material_request = form.save(commit=False)

            material_request.requested_by = request.user

            material_request.save()

            formset.instance = material_request

            formset.save()

            messages.success(
                request,
                "Material request submitted successfully."
            )

            return redirect("request-list")

    else:

        form = MaterialRequestForm()

        formset = MaterialRequestItemFormSet()

    return render(
        request,
        "inventory/request_form.html",
        {
            "form": form,
            "formset": formset,
        },
    )

@login_required
def approve_request(request, pk):

    req = get_object_or_404(
        MaterialRequest,
        pk=pk,
    )

    try:

        MaterialRequestService.approve_request(
            req,
            request.user,
        )

        messages.success(
            request,
            "Request approved."
        )

    except InventoryError as e:

        messages.error(
            request,
            str(e),
        )

    return redirect("request-list")


@login_required
def issue_request(request, pk):

    req = get_object_or_404(
        MaterialRequest,
        pk=pk,
    )

    try:

        MaterialRequestService.issue_request(
            req,
            request.user,
        )

        messages.success(
            request,
            "Materials issued successfully."
        )

    except InventoryError as e:

        messages.error(
            request,
            str(e),
        )

    return redirect("request-list")


# REST API ViewSets
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []  # Allow anonymous access for testing


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.select_related('category').all()
    serializer_class = InventoryItemSerializer
    permission_classes = []  # Allow anonymous access for testing
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset


class MaterialRequestViewSet(viewsets.ModelViewSet):
    queryset = MaterialRequest.objects.select_related('requested_by', 'approved_by').prefetch_related('items__inventory_item').all()
    serializer_class = MaterialRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def perform_create(self, serializer):
        if not self.request.user or self.request.user.is_anonymous:
            raise exceptions.NotAuthenticated('Authentication credentials were not provided.')
        serializer.save(requested_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        material_request = self.get_object()
        try:
            MaterialRequestService.approve_request(material_request, request.user)
            return Response({'status': 'approved'}, status=status.HTTP_200_OK)
        except InventoryError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        material_request = self.get_object()
        try:
            MaterialRequestService.reject_request(material_request, request.user)
            return Response({'status': 'rejected'}, status=status.HTTP_200_OK)
        except InventoryError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def issue(self, request, pk=None):
        material_request = self.get_object()
        try:
            MaterialRequestService.issue_request(material_request, request.user)
            return Response({'status': 'issued'}, status=status.HTTP_200_OK)
        except InventoryError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related('inventory_item', 'performed_by').all()
    permission_classes = []  # Allow anonymous access for testing

    def get_serializer_class(self):
        if self.action == 'create':
            return StockMovementCreateSerializer
        return StockMovementSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        inventory_item = self.request.query_params.get('inventory_item')
        if inventory_item:
            queryset = queryset.filter(inventory_item_id=inventory_item)
        return queryset
