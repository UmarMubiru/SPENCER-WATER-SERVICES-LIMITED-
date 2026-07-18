import django.urls
from rest_framework.routers import DefaultRouter # type: ignore

from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'items', views.InventoryItemViewSet, basename='inventoryitem')
router.register(r'requests', views.MaterialRequestViewSet, basename='materialrequest')
router.register(r'stock-movements', views.StockMovementViewSet, basename='stockmovement')
router.register(r'movements', views.StockMovementViewSet, basename='stockmovement-movements')

urlpatterns = router.urls
