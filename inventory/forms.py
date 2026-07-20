from django import forms # type: ignore
from django.forms import inlineformset_factory # type: ignore

from .models import (
    Category,
    InventoryItem,
    MaterialRequest,
    MaterialRequestItem,
)


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = [
            "name",
            "description",
            "is_active",
        ]


class InventoryItemForm(forms.ModelForm):
    class Meta:
        model = InventoryItem
        fields = [
            "category",
            "name",
            "description",
            "unit",
            "quantity",
            "reorder_level",
            "unit_cost",
            "is_active",
        ]


class MaterialRequestForm(forms.ModelForm):
    class Meta:
        model = MaterialRequest
        fields = [
            "request_number",
            "project_reference",
            "remarks",
        ]


class MaterialRequestItemForm(forms.ModelForm):
    class Meta:
        model = MaterialRequestItem
        fields = [
            "inventory_item",
            "requested_quantity",
            "remarks",
        ]


MaterialRequestItemFormSet = inlineformset_factory(
    MaterialRequest,
    MaterialRequestItem,
    form=MaterialRequestItemForm,
    extra=1,
    can_delete=True,
)
