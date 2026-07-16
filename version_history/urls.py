from django.urls import path
from . import views

urlpatterns = [
    path('', views.version_list, name='version-list'),
    path('<int:version_id>/', views.version_detail, name='version-detail'),
]
