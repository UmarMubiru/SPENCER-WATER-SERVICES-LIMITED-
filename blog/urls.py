from django.urls import path
from . import views

urlpatterns = [
    path('', views.blog_list, name='blog-list'),
    path('<int:post_id>/', views.blog_detail, name='blog-detail'),
    path('categories/', views.category_list, name='category-list'),
    path('tags/', views.tag_list, name='tag-list'),
]
