from django.urls import path
from . import views

urlpatterns = [
    path('', views.service_list, name='service-list'),
    path('<int:service_id>/', views.service_detail, name='service-detail'),
]
