from django.urls import path
from . import views

urlpatterns = [
    path('', views.service_list, name='service-list'),
    path('<int:service_id>/', views.service_detail, name='service-detail'),
    path('<int:service_id>/sections/', views.service_section_list, name='service-section-list'),
    path('<int:service_id>/sections/<int:section_id>/', views.service_section_detail, name='service-section-detail'),
    path('<int:service_id>/gallery/', views.service_gallery_update, name='service-gallery-update'),
]
