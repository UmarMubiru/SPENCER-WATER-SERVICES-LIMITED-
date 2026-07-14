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
)

from .services import (
    MaterialRequestService,
    InventoryError,
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