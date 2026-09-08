from django.urls import path
from . import views

urlpatterns = [
    path('public/', views.public_testimonial_list, name='public-testimonial-list'),
    path('', views.testimonial_list, name='testimonial-list'),
    path('<int:testimonial_id>/', views.testimonial_detail, name='testimonial-detail'),
]
