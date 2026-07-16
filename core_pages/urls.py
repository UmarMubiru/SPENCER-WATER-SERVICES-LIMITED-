from django.urls import path
from . import views

urlpatterns = [
    path('', views.core_page_list, name='core-page-list'),
    path('<int:page_id>/', views.core_page_detail, name='core-page-detail'),
]
