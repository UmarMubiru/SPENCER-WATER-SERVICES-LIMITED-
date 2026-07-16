import django.urls # type: ignore

from . import views

urlpatterns = [

    django.urls.path(
        "categories/",
        views.CategoryListView.as_view(),
        name="category-list",
    ),

    django.urls.path(
        "categories/new/",
        views.CategoryCreateView.as_view(),
        name="category-create",
    ),

    django.urls.path(
        "items/",
        views.InventoryListView.as_view(),
        name="inventory-list",
    ),

    django.urls.path(
        "items/new/",
        views.InventoryCreateView.as_view(),
        name="inventory-create",
    ),

    django.urls.path(
        "requests/",
        views.MaterialRequestListView.as_view(),
        name="request-list",
    ),

    django.urls.path(
        "requests/new/",
        views.create_request,
        name="request-create",
    ),

    django.urls.path(
        "requests/<uuid:pk>/approve/",
        views.approve_request,
        name="approve-request",
    ),

    django.urls.path(
        "requests/<uuid:pk>/issue/",
        views.issue_request,
        name="issue-request",
    ),

    django.urls.path(
        "requests/<uuid:pk>/",
        views.MaterialRequestDetailView.as_view(),
        name="request-detail",
    )
]

from rest_framework.routers import DefaultRouter # type: ignore

from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'items', views.InventoryItemViewSet, basename='inventoryitem')
router.register(r'requests', views.MaterialRequestViewSet, basename='materialrequest')
router.register(r'stock-movements', views.StockMovementViewSet, basename='stockmovement')

urlpatterns = router.urls