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
<<<<<<< HEAD
=======
from rest_framework import viewsets, status # type: ignore
from rest_framework.decorators import action # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore
>>>>>>> 4f5b3e5994d89b10184d42424b6c939c21c13e14

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
<<<<<<< HEAD
=======
    MaterialRequestItem,
    StockMovement,
>>>>>>> 4f5b3e5994d89b10184d42424b6c939c21c13e14
)

from .services import (
    MaterialRequestService,
<<<<<<< HEAD
    InventoryError,
)

=======
    InventoryService,
    InventoryError,
)

from .serializers import (
    CategorySerializer,
    InventoryItemSerializer,
    MaterialRequestSerializer,
    MaterialRequestItemSerializer,
    StockMovementSerializer,
)

>>>>>>> 4f5b3e5994d89b10184d42424b6c939c21c13e14
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

<<<<<<< HEAD
    return redirect("request-list")
=======
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
    permission_classes = []  # Allow anonymous access for testing
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        material_request = self.get_object()
        try:
            MaterialRequestService.approve_request(material_request, request.user)
            return Response({'status': 'approved'}, status=status.HTTP_200_OK)
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


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMovement.objects.select_related('inventory_item', 'performed_by').all()
    serializer_class = StockMovementSerializer
    permission_classes = []  # Allow anonymous access for testing
    
    def get_queryset(self):
        queryset = super().get_queryset()
        inventory_item = self.request.query_params.get('inventory_item')
        if inventory_item:
            queryset = queryset.filter(inventory_item_id=inventory_item)
        return queryset
>>>>>>> 4f5b3e5994d89b10184d42424b6c939c21c13e14
