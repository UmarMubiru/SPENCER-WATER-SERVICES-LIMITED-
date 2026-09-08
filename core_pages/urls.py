from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'page-fields', views.PageFieldViewSet, basename='page-field')
router.register(r'page-images', views.PageImageViewSet, basename='page-image')
router.register(r'core-values', views.CoreValueViewSet, basename='core-value')
router.register(r'team-members', views.TeamMemberViewSet, basename='team-member')

urlpatterns = [
    path('public/site/', views.public_site_content, name='public-site-content'),
    path('', views.core_page_list, name='core-page-list'),
    path('<int:page_id>/', views.core_page_detail, name='core-page-detail'),
    path('', include(router.urls)),
]
