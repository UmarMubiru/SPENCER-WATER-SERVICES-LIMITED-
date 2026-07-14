from django.urls import path # type: ignore

from . import views

urlpatterns = [

    path(
        "categories/",
        views.CategoryListView.as_view(),
        name="category-list",
    ),

    path(
        "categories/new/",
        views.CategoryCreateView.as_view(),
        name="category-create",
    ),

    path(
        "items/",
        views.InventoryListView.as_view(),
        name="inventory-list",
    ),

    path(
        "items/new/",
        views.InventoryCreateView.as_view(),
        name="inventory-create",
    ),

    path(
        "requests/",
        views.MaterialRequestListView.as_view(),
        name="request-list",
    ),

    path(
        "requests/new/",
        views.create_request,
        name="request-create",
    ),

    path(
        "requests/<uuid:pk>/approve/",
        views.approve_request,
        name="approve-request",
    ),

    path(
        "requests/<uuid:pk>/issue/",
        views.issue_request,
        name="issue-request",
    ),

    path(
        "requests/<uuid:pk>/",
        views.MaterialRequestDetailView.as_view(),
        name="request-detail",
    )
]